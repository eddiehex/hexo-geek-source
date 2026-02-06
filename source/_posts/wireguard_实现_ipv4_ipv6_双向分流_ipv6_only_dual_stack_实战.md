---
title: WireGuard 实现 IPv4 / IPv6 双向分流（IPv6-only × Dual-Stack 实战）
date: 2024-11-19
categories: 
    - Linux
tags: [WireGuard, IPv6, IPv4, Networking, VPN]
excerpt: "在真实服务器环境中，使用 WireGuard 实现 IPv6-only 与双栈服务器之间的 IPv4 / IPv6 双向借网，并提供一键自动部署脚本。"
---

## 背景

随着 IPv4 资源逐渐枯竭，越来越多的 VPS / 云服务器开始提供 **IPv6-only** 网络环境。这类服务器通常具备：

- IPv6 公网地址
- **无公网 IPv4**
- 通过 NAT64 或代理访问 IPv4 世界（质量不稳定）

而现实中经常会遇到另一类服务器：

- 同时具备 **IPv4 + IPv6（Dual Stack）**
- IPv4 网络质量稳定
- IPv6 出口位置一般

这就引出了一个非常实际的需求：

> 能否让 IPv6-only 服务器使用另一台双栈服务器的 IPv4 出口，同时反过来让双栈服务器使用 IPv6-only 服务器的 IPv6 出口？

答案是：可以，而且 **WireGuard 是最干净、最可控的方案**。

---

## 目标

- A（IPv6-only）：IPv4 → 走 B
- B（Dual Stack）：IPv6 → 走 A
- 双方公网访问不受影响
- 重启自动恢复

一句话总结：

> **A 借 B 的 IPv4，B 借 A 的 IPv6**

---

## 网络拓扑

```
        IPv4 Internet                  IPv6 Internet
              ▲                              ▲
              │                              │
         ┌────┴────┐                    ┌────┴────┐
         │ Server B │◄── IPv6 ── WG ──► │ Server A │
         │ Dual     │                    │ IPv6-only│
         │ Stack    │── IPv4 ── WG ────►│          │
         └─────────┘                    └──────────┘
```

---

## 使用方式

### 第一步：生成密钥（两台服务器）

```bash
sudo bash wg_dualstack_split.sh --role auto
```

### 第二步：部署

#### 在 A 上

```bash
sudo bash wg_dualstack_split.sh --role a \
  --peer-endpoint-v6 "<B_PUBLIC_IPV6>" \
  --peer-pub "<B_PUBLIC_KEY>"
```

#### 在 B 上

```bash
sudo bash wg_dualstack_split.sh --role b \
  --peer-endpoint-v6 "<A_PUBLIC_IPV6>" \
  --peer-pub "<A_PUBLIC_KEY>"
```

---

## 验证

```bash
# A
curl -4 ip.sb
curl ip.sb

# B
curl -6 ip.sb
```

---

## 总结

本文展示了一套 **真实可落地** 的 IPv4 / IPv6 双向分流方案，适用于：

- IPv6-only VPS
- 双栈中转
- 网络质量优化
