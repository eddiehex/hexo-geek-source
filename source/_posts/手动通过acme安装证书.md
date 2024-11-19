---
title: acme安装证书
date: 2023-11-01
categories: 
  - Linux
tags: [acme, ssl, certificate]
toc: true
excerpt: "Learn how to manually install SSL certificates using ACME. This guide provides detailed steps for setting up and configuring ACME to secure your web applications with SSL certificates."
---
#### 手动通过acme安装证书

```shell
curl https://get.acme.sh | sh #安装acme
```

```shell
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt #替换服务
```

```shell
~/.acme.sh/acme.sh --issue -d khw.423327.xyz --dns --yes-I-know-dns-manual-mode-enough-go-ahead-please  #生成添加TXT需要的NAME和Value
```

#### 去域名服务商处添加TXT

```shell
~/.acme.sh/acme.sh --renew -d khw.423327.xyz --yes-I-know-dns-manual-mode-enough-go-ahead-please  #生成证书
```

#### 生成结果如下

```shell
[Fri 06 Jan 2023 07:37:07 AM EST] Your cert is in: /root/.acme.sh/khw.423327.xyz/khw.423327.xyz.cer
[Fri 06 Jan 2023 07:37:07 AM EST] Your cert key is in: /root/.acme.sh/khw.423327.xyz/khw.423327.xyz.key #使用这个
[Fri 06 Jan 2023 07:37:07 AM EST] The intermediate CA cert is in: /root/.acme.sh/khw.423327.xyz/ca.cer
[Fri 06 Jan 2023 07:37:07 AM EST] And the full chain certs is there: /root/.acme.sh/khw.423327.xyz/fullchain.cer #使用这个
```
