---
title: Configuring Xray with VLESS, Reality, and gRPC
date: 2023-11-01
categories: 
  - Linux
tags: [xray, vless, grpc, singbox]
toc: true
excerpt: "Learn how to configure Xray with VLESS, Reality, and gRPC. This guide provides step-by-step instructions for setting up and optimizing Xray for enhanced network performance and security."
---
This guide outlines setting up a secure and efficient Xray connection using the VLESS protocol with Reality and gRPC. This method offers several advantages:

* **Enhanced Security:**  Benefits from the inherent security of VLESS and Reality protocols.
* **Simplified Setup:** Eliminates the need for SSL certificates.
* **Exposure to New Technologies:** Provides an opportunity to learn and implement cutting-edge protocols like gRPC.

### Prerequisites

* A server running a compatible operating system (e.g., Linux).
* Root access to the server.

### Step 1: Installing Xray

Use the following command to install the latest beta version of Xray on your server:

```bash
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install --beta -u root
```

### Step 2: Generating Credentials

Generate the necessary credentials for your Xray configuration:

```bash
xray uuid # Generate a UUID
xray x22519 # Generate a X25519 key pair
# Choose a short ID (between 1 and 16 characters long, using characters 1-F)
# Example:
b1 
```

### Step 3: Finding a Suitable Website for Reality

Identify a website that supports HTTP/2 and TLS 1.3, preferably with an X25519 certificate. You can use the following resources to find a suitable website:

* **GitHub Issue:** [https://github.com/XTLS/Xray-core/issues/2005](https://github.com/XTLS/Xray-core/issues/2005)

* **BGP.tools:** [https://bgp.tools/](https://bgp.tools/)

   1. Open [https://bgp.tools/](https://bgp.tools/).
   2. Input your VPS IP address and search.
   3. Navigate to the "DNS" tab.
   4. Choose the "Show Forward DNS" option.
   5. Select a few domains from the list and use your browser's developer tools to verify if they use TLS 1.3 and an X25519 certificate.

   Ideally, the chosen website should be in the same IP range as your server, relatively unknown (for better privacy), and have low latency.
   
* Check command

   ```shell
   curl -I --tlsv1.3 --http2 https://englishdog.xyz
   ```
   
   ```shell
   #return 200 means successful
   HTTP/2 200
   server: nginx
   date: Mon, 03 Jun 2024 13:43:42 GMT
   content-type: text/html; charset=utf-8
   content-length: 12181
   last-modified: Wed, 08 May 2024 12:16:39 GMT
   vary: Accept-Encoding
   etag: "663b6d27-2f95"
   x-xss-protection: 1; mode=block
   x-content-type-options: nosniff
   referrer-policy: no-referrer-when-downgrade
   content-security-policy: default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline'; frame-ancestors 'self';
   permissions-policy: interest-cohort=()
   strict-transport-security: max-age=31536000; includeSubDomains
   accept-ranges: bytes
   ```
   
   

### Step 4: Configuring the Server

Configure your Xray server by modifying the `config.json` file located at `/usr/local/etc/xray/config.json`.  You can find example configurations in this GitHub repository: [https://github.com/chika0801/Xray-examples/tree/main/VLESS-gRPC-REALITY](https://github.com/chika0801/Xray-examples/tree/main/VLESS-gRPC-REALITY).  

**Remember to replace the placeholders in the example configurations with your generated credentials and chosen website details.**

### Step 5: Configuring the Client

Configure your Xray client with the corresponding settings from the server configuration.  Below is an example client configuration. Be sure to adjust it to your specific needs and match the settings with your server configuration.

```json
{
  "dns": {
    "servers": [
      {
        "tag": "remote",
        "address": "https://1.1.1.1/dns-query",
        "detour": "vless-out"
      },
      {
        "tag": "local",
        "address": "https://223.5.5.5/dns-query",
        "detour": "direct"
      },
      {
        "address": "rcode://success",
        "tag": "block"
      }
    ],
    "rules": [
      {
        "outbound": [ "any" ],
        "server": "local"
      },
      {
        "disable_cache": true,
        "geosite": [ "category-ads-all" ],
        "server": "block"
      },
      {
        "clash_mode": "global",
        "server": "remote"
      },
      {
        "clash_mode": "direct",
        "server": "local"
      },
      {
        "geosite": "cn",
        "server": "local"
      }
    ],
    "strategy": "prefer_ipv4"
  },
  "inbounds": [
    {
      "type": "tun",
      "inet4_address": "172.19.0.1/30",
      "inet6_address": "2001:0470:f9da:fdfa::1/64",
      "sniff": true,
      "sniff_override_destination": true,
      "domain_strategy": "prefer_ipv4",
      "stack": "mixed",
      "strict_route": true,
      "mtu": 9000,
      "endpoint_independent_nat": true,
      "auto_route": true
    },
    {
      "type": "socks",
      "tag": "socks-in",
      "listen": "127.0.0.1",
      "sniff": true,
      "sniff_override_destination": true,
      "domain_strategy": "prefer_ipv4",
      "listen_port": 1087,
      "users": []
    },
    {
      "type": "mixed",
      "tag": "mixed-in",
      "sniff": true,
      "sniff_override_destination": true,
      "domain_strategy": "prefer_ipv4",
      "listen": "127.0.0.1",
      "listen_port": 1088,
      "users": []
    }
  ],
  "log": {
    "disabled": false,
    "level": "info",
    "timestamp": true
  },
  "outbounds": [
    {
      "type": "vless",
      "tag": "vless-out",
      "server": "{your_server_ip}",
      "server_port": 443,
      "uuid": "{your_uuid}",
      "tls": {
        "enabled": true,
        "server_name": "{your_domain}",
        "insecure": false,
        "reality": {
          "enabled": true,
          "public_key": "{your_public_key}",
          "short_id": "{your_short_id}"
        },
        "utls": {
          "enabled": true,
          "fingerprint": "chrome"
        }
      },
      "transport": {
        "type": "grpc",
        "service_name": "{your_service_name}",
        "idle_timeout": "60s",
        "ping_timeout": "20s"
      }
    },
    {
      "tag": "direct",
      "type": "direct"
    },
    {
      "tag": "block",
      "type": "block"
    },
    {
      "tag": "dns-out",
      "type": "dns"
    }
  ],
  "route": {
    "auto_detect_interface": true,
    "rules": [
      {
        "geosite": "category-ads-all",
        "outbound": "block"
      },
      {
        "outbound": "dns-out",
        "protocol": "dns"
      },
      {
        "clash_mode": "direct",
        "outbound": "direct"
      },
      {
        "clash_mode": "global",
        "outbound": "vless-out"
      },
      {
        "geoip": [ "cn", "private" ],
        "outbound": "direct"
      },
      {
        "geosite": "geolocation-!cn",
        "outbound": "vless-out"
      },
      {
        "geosite": "cn",
        "outbound": "direct"
      }
    ]
  }
}
```

**Replace the following placeholders with your specific information:**

* `{your_server_ip}`: Your server's IP address.
* `{your_uuid}`: The UUID generated in Step 2.
* `{your_domain}`: The domain of the website you chose in Step 3.
* `{your_public_key}`: The public key generated in Step 2.
* `{your_short_id}`: The short ID you chose in Step 2.
* `{your_service_name}`:  The gRPC service name configured on your server.

### Conclusion

By following these steps, you will have successfully configured Xray with VLESS, Reality, and gRPC. This setup provides a secure and efficient way to browse the internet while benefiting from the latest advancements in network protocols. Remember to keep your configuration files secure and choose a strong password for your Xray client.