---
title: linux 知识
date: 2024-01-01
categories: 
  - Linux
excerpt: "Unlock the power of Linux with this comprehensive guide. From checking server status and managing files to configuring environment variables and handling firewall settings, this post covers essential Linux commands and operations. Whether you're a beginner or an experienced user, these tips will help you navigate and optimize your Linux environment with ease."
---

## 查看服务器情况

```shell
#查看硬盘使用情况
df -h
#查看内存使用情况
free -h
#查看块设备情况
lsblk
```

## 服务器登陆

```shell
#ssh 用户名@ip地址 -p 端口号 -i 密钥地址
ssh root@206.190.232.205 -p 26838 -i /Users/eddieho/hx_for_hob/ssa/bwg_jp
# 使用管理员权限
sudo -i
```

## 安装相关依赖

```shell
yum -y install wget
yum update -y && yum install curl -y
```

## 常用 vm 测试

```shell
wget -qO- bench.sh | bash
```

## 查看 ip

```shell
#查看公网ip
curl -s http://tnx.nl/ip
#
ifconfig -a
```

## 文件夹操作

```shell
# 移动或者改名
mv mynginx/ myblog/
# 创建
mkdir myblog
# 删除
rm myblog
rm -rf blog
```

## 处理防火墙

```shell
#停止firewall
systemctl stop firewalld.service
#禁止firewall开机启动
systemctl disable firewalld.service
#关闭iptables
service iptables stop
#去掉iptables开机启动
chkconfig iptables off
```

## 环境变量

```shell
# 直接用export命令
export PATH=$PATH:/opt/au1200_rm/build_tools/bin
# 修改profile文件
vi /etc/profile
export PATH="$PATH:/opt/au1200_rm/build_tools/bin"
source /etc/profile
# 修改.bashrc文件
 vi /root/.bashrc
export PATH="$PATH:/opt/au1200_rm/build_tools/bin"
# 修改.bashrc
vi ~/.bashrc
alias v2ray=/usr/local/sbin/v2ray
```

## 日期&&时间

```sh
# 当前时间
date
- Tue 14 Nov 2023 04:13:21 PM UTC
# 当前时区
timedatectl
- Local time: Tue 2023-11-14 16:14:00 UTC
           Universal time: Tue 2023-11-14 16:14:00 UTC
                 RTC time: Tue 2023-11-14 16:14:01
                Time zone: Etc/UTC (UTC, +0000)
- System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no

# 修改时区为上海
timedatectl set-timezone Asia/Shanghai
```
