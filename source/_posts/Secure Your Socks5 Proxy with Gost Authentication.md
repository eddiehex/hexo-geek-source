---
title: Secure Your Socks5 Proxy with Gost Authentication
date: 2023-11-01
categories: 
  - Linux
tags: [socks5, gost]
toc: true
excerpt: "Learn how to secure your Socks5 proxy using Gost authentication. This guide provides step-by-step instructions for setting up and configuring Gost to enhance the security of your proxy server."
---

Today, I received an email about IP abuse, likely due to my open Socks5 service on the server.  Without any authentication, anyone with the IP address and port could connect. 

To enhance security, I've added authentication to my Gost service. 

### Configuration

Here's how I configured Gost for secure Socks5 proxying:

**1. config.json:**

```json
{
    "Debug": true,
    "ServeNodes": [
        "socks5://username:password@0.0.0.0:port"
    ]
}
```
**Replace the following:**

*  `username`: Your desired username
*  `password`: Your desired password
*  `port`: Your desired Socks5 port

**2. docker-compose.yml:**

```yaml
version: "3"

services:
  gost:
    image: ginuerzh/gost
    restart: always
    network_mode: "host"
    volumes:
      - ./config.json:/gost/config.json 
    command:
      - "-C=/gost/config.json" 
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

This configuration launches a Gost container, mounts the `config.json`, and sets it to restart automatically.

### Application Example: IPv6 Forwarding with Hysteia2

One use case for a Socks5 proxy is forwarding IPv6 traffic for servers with only IPv4 connectivity. Here's an example using Hysteia2:

```yaml
#hysteia configuration
  -acl: 
  	inline:
				- so(::/0)  
				
  - name: so
    type: socks5
    socks5:
      addr: your-server-ip:your-gost-port
      username: your-gost-username
      password: your-gost-password
```

**Replace the placeholders with your actual Gost server information.**

### Conclusion

Adding authentication significantly improves the security of your Socks5 service.  After implementing it, I noticed several failed connection attempts from suspicious IPs in the Gost logs. 
