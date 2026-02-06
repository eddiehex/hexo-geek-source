---
title: WireGuard 实现 IPv4 / IPv6 双向分流（IPv6-only × Dual-Stack 实战）
date: 2026-02-06
categories:
  - {optional}
tags: [{optional}]
toc: true
excerpt: "{optional}"
---

背景

在现在的 VPS / 云服务器环境中，一个非常常见、也非常头疼的组合是：

服务器	网络能力
Server A	只有 IPv6（IPv6-only）
Server B	IPv4 + IPv6（Dual Stack）

现实需求往往是：
	•	🟢 A 没有 IPv4，但需要访问 IPv4 网络
	•	🟢 B 有 IPv6，但想使用 A 的 IPv6 出口
	•	🟢 两台服务器都要 保持公网可访问
	•	🟢 不能因为配置错误把自己 SSH 踢下线
	•	🟢 重启后必须自动恢复

⸻

目标

最终我们要实现的是：
	•	✅ A 的 IPv4 流量 → 通过 B 出口（NAT44）
	•	✅ B 的 IPv6 流量 → 通过 A 出口（NAT66）
	•	✅ 双方通过 WireGuard 隧道互通
	•	✅ 所有配置 可持久、可恢复、可维护

一句话总结：

A 借 B 上 IPv4 网，B 借 A 上 IPv6 网

⸻

最终网络拓扑

        IPv4 Internet                  IPv6 Internet
              ▲                              ▲
              │                              │
         ┌────┴────┐                    ┌────┴────┐
         │ Server B │◄── IPv6 ── WG ──► │ Server A │
         │ Dual     │                    │ IPv6-only│
         │ Stack    │── IPv4 ── WG ────►│          │
         └─────────┘                    └──────────┘

A: IPv4 → B
B: IPv6 → A


⸻

核心设计原则（非常重要）

这套方案能成功，关键不在 WireGuard 本身，而在网络细节：
	1.	AllowedIPs = 路由语义，不是白名单
	2.	IPv6 默认路由一旦改，endpoint 和 DNS 必须加 host route
	3.	IPv6 /112 地址段 → 路由必须使用 onlink
	4.	不要用 tr -cd 清洗配置文件（会破坏 wg0.conf）
	5.	NAT / 路由必须 幂等 + 自动化

⸻

Server B（Dual Stack）配置

功能
	•	A 的 IPv4 → 通过 B NAT 出口
	•	B 的 IPv6 → 走 A
	•	防止 WireGuard 握手和 DNS 死循环
	•	重启自动恢复

⸻

/etc/wireguard/wg0.conf（Server B）

[Interface]
Address = 10.0.0.2/24, fd00::2/64
PrivateKey = <B_PRIVATE_KEY>
ListenPort = 51820
Table = off
DNS = 2001:4860:4860::8888, 8.8.8.8
MTU = 1280

# NAT44：A 的 IPv4 走 B
PostUp   = sysctl -w net.ipv4.ip_forward=1
PostUp   = iptables -t nat -C POSTROUTING -s 10.0.0.1/32 -o eth0 -j MASQUERADE 2>/dev/null || \
           iptables -t nat -A POSTROUTING -s 10.0.0.1/32 -o eth0 -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -s 10.0.0.1/32 -o eth0 -j MASQUERADE 2>/dev/null || true

# 防死循环：A 的公网 IPv6（WireGuard endpoint）
PostUp   = ip -6 route replace <A_PUBLIC_IPV6>/128 via <B_IPV6_GW> dev eth0 onlink
PostDown = ip -6 route del     <A_PUBLIC_IPV6>/128 via <B_IPV6_GW> dev eth0 onlink 2>/dev/null || true

# DNS 走物理网关
PostUp   = ip -6 route replace 2001:4860:4860::8888/128 via <B_IPV6_GW> dev eth0 onlink
PostDown = ip -6 route del     2001:4860:4860::8888/128 via <B_IPV6_GW> dev eth0 onlink 2>/dev/null || true

# B 的 IPv6 默认走 A
PostUp   = ip -6 route add default dev wg0 metric 50
PostDown = ip -6 route del default dev wg0 metric 50

[Peer]
PublicKey = <A_PUBLIC_KEY>
Endpoint = [<A_PUBLIC_IPV6>]:51820
AllowedIPs = ::/0, 10.0.0.1/32
PersistentKeepalive = 25


⸻

启动与持久化（Server B）

systemctl enable wg-quick@wg0
wg-quick up wg0

cat >/etc/sysctl.d/99-wg-forward.conf <<EOF
net.ipv4.ip_forward = 1
EOF
sysctl --system


⸻

Server A（IPv6-only）配置

功能
	•	IPv4 默认 → 走 B
	•	IPv6 仍保持直连
	•	为 B 提供 IPv6 NAT66
	•	SSH 不会被误断

⸻

/etc/wireguard/wg0.conf（Server A）

[Interface]
Address = 10.0.0.1/24, fd00::1/64
PrivateKey = <A_PRIVATE_KEY>
ListenPort = 51820
DNS = 8.8.8.8
MTU = 1280

# NAT66：B 的 IPv6 走 A
PostUp   = sysctl -w net.ipv6.conf.all.forwarding=1
PostUp   = ip6tables -t nat -C POSTROUTING -s fd00::2/128 -o eth0 -j MASQUERADE 2>/dev/null || \
           ip6tables -t nat -A POSTROUTING -s fd00::2/128 -o eth0 -j MASQUERADE
PostDown = ip6tables -t nat -D POSTROUTING -s fd00::2/128 -o eth0 -j MASQUERADE 2>/dev/null || true

# IPv6 SSH 保命路由（强烈建议）
PostUp   = ip -6 route replace <YOUR_IPV6_CLIENT>/128 via <A_IPV6_GW> dev eth0 onlink
PostDown = ip -6 route del     <YOUR_IPV6_CLIENT>/128 via <A_IPV6_GW> dev eth0 onlink 2>/dev/null || true

[Peer]
PublicKey = <B_PUBLIC_KEY>
Endpoint = [<B_PUBLIC_IPV6>]:51820
AllowedIPs = 0.0.0.0/0, fd00::2/128
PersistentKeepalive = 25


⸻

启动与持久化（Server A）

systemctl enable wg-quick@wg0

cat >/etc/sysctl.d/99-wg-forward.conf <<EOF
net.ipv6.conf.all.forwarding = 1
EOF
sysctl --system


⸻

验证清单

Server A

curl -4 ip.sb   # 应显示 B 的 IPv4
curl ip.sb      # 应显示 A 的 IPv6

Server B

curl -6 ip.sb   # 应显示 A 的 IPv6

隧道状态

wg show


⸻

常见踩坑总结

❌ 不要这样清洗配置文件

tr -cd '\11\12\15\40-\176'

会破坏 wg0.conf，导致 wg-quick 启动失败 + DNS 丢失

✅ 正确方式

grep -vP '\x00' wg0.conf > wg0.clean && mv wg0.clean wg0.conf


⸻

是否需要持久？

场景	是否必须
只劫持 A 的 IPv4	❌ 不必须
B 的 IPv6 走 A	✅ 强烈建议
改 IPv6 默认路由	✅ 必须
生产环境	✅ 必须


⸻

总结

这不是一篇“如何安装 WireGuard”的教程，而是一套：

真实生产环境中，IPv4 / IPv6 双向借网的完整工程方案

如果你也有：
	•	IPv6-only VPS
	•	想访问 IPv4 网络
	•	或需要跨地域 IPv6 出口

这套配置可以直接复用。

⸻
