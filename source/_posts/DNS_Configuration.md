---
title: SingBox DNS Configuration
date: 2023-11-01
categories: 
  - Linux
tags: [singbox, dns]
toc: true
excerpt: "Learn how to configure DNS settings in SingBox. This guide provides detailed steps for setting up and optimizing DNS configurations to ensure efficient and reliable network performance."
---

## DNS Configuration

There are generally three types of DNS servers: remote, local, and blocking.

**Remote DNS servers** are public DNS services offered by companies like Google and Cloudflare. Examples include:

```json
{
  "tag": "google",
  "address": "tls://8.8.8.8",
  "detour": "Proxy"
},
{
  "tag": "cloudflare",
  "address": "https://1.1.1.1/dns-query",
  "detour": "Proxy"
}
```

**Local DNS servers** are typically used to resolve domain names within a local network:

```json
{ 
  "tag": "local-dns",
  "address": "tls://223.5.5.5", 
  "detour": "direct"
}
```

**Blocking DNS servers** are used to block access to specific domains:

```json
{
  "tag": "block-dns",
  "address": "rcode://success"
}
```

**Fake IP DNS** can be used to potentially speed up connections by reducing DNS requests:

```json
{
  "tag": "fakeip-dns",
  "address": "fakeip"
}
```

## Other Configuration Options

Besides server information, you can configure:

* **DNS Rules:** Define the order of DNS server queries and rules for specific domains.
* **Strategy:** Specify the preferred DNS record type (A or AAAA).
* **Fake IP:** Define IP address ranges for the `fakeip-dns` server.

### Fake IP Configuration

```json
{
"enabled": true,
"inet4_range": "198.18.0.0/15",
"inet6_range": "fc00::/18"
}
```

### DNS Rule Example

```json
{
    "rule_set": [ //advertisement match
      "geosite-adguard"
    ],
    "server": "block-dns"
  },
  {
    "rule_set": [ // geosit match
      "geosite-netflix",
      "geosite-youtube",
      "geosite-openai",
      "geosite-speedtest",
      "geosite-github",
      "geosite-cloudflare",
      "Gemini",
      "geosite-google",
      "geosite-tiktok",
      "geosite-jable"
    ],
    "rewrite_ttl": 1,
    "server": "fakeip-dns"
  },
  {
    "domain_suffix": [ //domain match
      "edu.cn",
      "gov.cn",
      "mil.cn",
      "ac.cn",
      "com.cn",
      "net.cn",
      "org.cn",
      "中国",
      "中國"
    ],
    "server": "local-dns"
  },
  {
    "rule_set": [ //domestic site match
      "geosite-cn",
      "geosite-icloud@cn",
      "geosite-apple@cn"
    ],
    "server": "local-dns"
  },

  {
    "query_type": [
      "A",
      "AAAA"
    ],
    "rewrite_ttl": 1,
    "server": "fakeip-dns"
  },
  {
    "outbound": "any",
    "server": "local-dns"
  }

```

This rule `outboud: any, server:local` dictates that for any `outbound service`, the `local-dns` server will be used to resolve domain names. For example, if you have a VLESS outbound service, this rule ensures that the `local-dns` server is queried to find the IP address of the service's domain before establishing a connection. If the specified server is `fakeip-dns`, a fake IP address within the configured address range will be returned instead. 