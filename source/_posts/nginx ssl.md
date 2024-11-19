---
title: nginx ssl 配置
date: 2023-11-01
categories: 
  - Linux
tags: [nginx, ssl]
toc: true
excerpt: "Learn how to configure SSL for Nginx. This guide provides detailed steps for setting up SSL certificates and configuring Nginx to secure your web applications with HTTPS."
---
### 80端口访问

```shell
server {
  listen 80;
  listen [::]:80;

  # 域名
  server_name domain.com  www.domain.com;

  location / {
    ## 定位到wordpress
    proxy_pass http://wordpress;

        proxy_http_version    1.1;
        proxy_cache_bypass    $http_upgrade;

        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host                $host;
        proxy_set_header X-Real-IP            $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto    $scheme;
        proxy_set_header X-Forwarded-Host    $host;
        proxy_set_header X-Forwarded-Port    $server_port;
  }
}
```
### 443端口访问
需要将证书文件放置nginx容器中

```sh
server {
    # 服务器端口使用443，开启ssl, 这里ssl就是上面安装的ssl模块
    listen       443 ssl;
    # 域名，多个以空格分开
    server_name  domain.com www.domain.com;

    # ssl证书地址
    ssl_certificate     /etc/nginx/cert/6827606_www.domain.com.pem;  # pem文件的路径
    ssl_certificate_key  /etc/nginx/cert/6827606_www.domain.com.key; # key文件的路径

    # ssl验证相关配置
    ssl_session_timeout  5m;    #缓存有效期
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;    #加密算法
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;    #安全链接可选的加密协议
    ssl_prefer_server_ciphers on;   #使用服务器端的首选算法

    location / {
    ## 定位到wordpress
    proxy_pass http://wordpress;

        proxy_http_version    1.1;
        proxy_cache_bypass    $http_upgrade;

        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host                $host;
        proxy_set_header X-Real-IP            $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto    $scheme;
        proxy_set_header X-Forwarded-Host    $host;
        proxy_set_header X-Forwarded-Port    $server_port;
    }
}
server {
    listen       80;
    server_name  domain.com www.domain.com;
    return 301 https://$server_name$request_uri;
}

```
