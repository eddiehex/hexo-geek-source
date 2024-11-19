---
title: 服务器开启BBR
date: 2023-11-01
categories: 
  - Linux
tags: [BBR, server]
toc: true
excerpt: "Learn how to enable BBR (Bottleneck Bandwidth and Round-trip propagation time) on your server to improve network performance. This guide provides step-by-step instructions for configuring BBR on various server environments."
---

### 什么是BBR

BBR是Google提出的一种新型拥塞控制算法，可以提高服务器的吞吐和TCP连接的延迟；

### 前期准备

不同系统开启BBR的方式有些许的差异，大致可以区分是否需要安装最新内核

1 查看服务器系统和服务器内核版本

```shell
uname -a
Linux 5.17.9-1.el7.elrepo.x86_64 #1 SMP PREEMPT Tue May 17 16:17:10 EDT 2022 x86_64 x86_64 x86_64 GNU/Linux
# 可以看出内核版本为5.17
cat /etc/issue
Debian GNU/Linux 10 \n \l
# 系统为debian
cat /etc/redhat-release
CentOS Linux release 7.9.2009 (Core)
#c 系统为centos
```

2 查看系统是bbr开启情况

```shell
sysctl net.ipv4.tcp_available_congestion_control
net.ipv4.tcp_available_congestion_control = reno cubic bbr

lsmod |grep bbr
tcp_bbr                20480  16

#两种方式返回值带bbr 则表示已开启
```



3 开启BBR

1）当系统内核版本低于4.1

```shell
#首先安装elrepo源
rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org
rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-3.el7.elrepo.noarch.rpm
#启用elrepo-kernel
yum-config-manager --enable elrepo-kernel
#安装内核
yum -y install kernel-ml kernel-ml-devel
#查看内核启动项排序正常新安装的内核版本在0号位
awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
#如果内核启动编号不是0执行
grub2-set-default 0
#重启
reboot
```

2） 当系统内核版本高于4.1

```shell
#直接开启BBR
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
#完成后按照2 进行验证
```

4 注意事项

**低版本的内核在升级时偶尔会遇到更新完内核重启失联的现象，故尽量选择高版本系统直接执行3-2）步骤**
