---
title: 利用flaresolverr 实现cloudflare访问限制突破
date: 2023-11-01
categories: 
  - Python
tags: [flaresolverr, python]
toc: true
excerpt: "Learn how to bypass Cloudflare access restrictions using flaresolverr. This guide provides step-by-step instructions for setting up and using flaresolverr to navigate Cloudflare's security measures."
---

## 背景

最近使用想通过RSS订阅常用论坛，做到信息统一浏览，但常用的nodeseek论坛因托管于cloudflare平台，直接订阅其RSS会出现因cloudflare保护措施无法访问获取。

## 解决方案

通过部署flaresolverr绕过cloudflare防范从而对网站进行访问。

### flaresolverr 部署

通过docker部署

```shell
docker run -d   --name=flaresolverr   -p 8191:8191   -e LOG_LEVEL=info   --restart unless-stopped   ghcr.io/flaresolverr/flaresolverr:latest
```

### flaresolverr使用

#### request.get

```shell
curl -L -X POST 'http://localhost:8191/v1' -H 'Content-Type: application/json' --data-raw '{
    "cmd": "request.get",
		"url":"http://www.nodeseek.com/",
		"maxTimeout": 60000
 }'
```

返回内容示例

```json
{
    "solution": {
        "url": "https://www.google.com/?gws_rd=ssl",
        "status": 200,
        "headers": {
            "status": "200",
            "date": "Thu, 16 Jul 2020 04:15:49 GMT",
            "expires": "-1",
            "cache-control": "private, max-age=0",
            "content-type": "text/html; charset=UTF-8",
            "strict-transport-security": "max-age=31536000",
            "p3p": "CP=\"This is not a P3P policy! See g.co/p3phelp for more info.\"",
            "content-encoding": "br",
            "server": "gws",
            "content-length": "61587",
            "x-xss-protection": "0",
            "x-frame-options": "SAMEORIGIN",
            "set-cookie": "1P_JAR=2020-07-16-04; expires=Sat..."
        },
        "response":"<!DOCTYPE html>...",
        "cookies": [
            {
                "name": "NID",
                "value": "204=QE3Ocq15XalczqjuDy52HeseG3zAZuJzID3R57...",
                "domain": ".google.com",
                "path": "/",
                "expires": 1610684149.307722,
                "size": 178,
                "httpOnly": true,
                "secure": true,
                "session": false,
                "sameSite": "None"
            },
            {
                "name": "1P_JAR",
                "value": "2020-07-16-04",
                "domain": ".google.com",
                "path": "/",
                "expires": 1597464949.307626,
                "size": 19,
                "httpOnly": false,
                "secure": true,
                "session": false,
                "sameSite": "None"
            }
        ],
        "userAgent": "Windows NT 10.0; Win64; x64) AppleWebKit/5..."
    },
    "status": "ok",
    "message": "",
    "startTimestamp": 1594872947467,
    "endTimestamp": 1594872949617,
    "version": "1.0.0"
}
```

#### sessions.create

```shell
# 创建seesion
curl -L -X POST 'http://localhost:8191/v1' -H 'Content-Type: application/json' --data-raw '{
    "cmd": "sessions.create",
    "url":"http://www.nodeseek.com/rss.xml",
    "maxTimeout": 60000
  }'
  
# 应用session
curl -L -X POST 'http://localhost:8191/v1' -H 'Content-Type: application/json' --data-raw '{
    "cmd": "request.get",
    "url":"http://www.nodeseek.com/rss.xml",
    "maxTimeout": 60000,
    "session": "48554e80-803c-11ee-804f-0242ac110002"
  }'
```

#### session.list

```shell
curl -L -X POST 'http://localhost:8191/v1' -H 'Content-Type: application/json' --data-raw '{
    "cmd": "sessions.list"}'
```



## 场景应用

```python
from http.server import BaseHTTPRequestHandler, HTTPServer
from curl_cffi import requests
import xml.dom.minidom  # Library for XML formatting
import xml.parsers.expat
import subprocess
import json


# Define the URL and the user agent
url = "https://www.nodeseek.com/rss.xml"
user_agent = "chrome110"
output_file = "rss.xml"  # New file to save the content
curl_command = (
    "curl -L -X POST 'http://localhost:8191/v1' "
    "-H 'Content-Type: application/json' "
    "--data-raw '{"
    "  \"cmd\": \"request.get\","
    "  \"url\":\"http://www.nodeseek.com/rss.xml\","
    "  \"maxTimeout\": 60000,"
    "  \"session\": \"48554e80-803c-11ee-804f-0242ac110002\""
    "}'"
)

class MyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            try:
                # Send an HTTP GET request
                #response = requests.get(url, impersonate=user_agent)
                #response_text = response.text
                response = subprocess.run(curl_command, shell=True, check=True, capture_output=True, text=True)
                json_response = json.loads(response.stdout)
                response_text = json_response.get('solution', {}).get('response', '')

                # Parse the RSS XML
                dom = xml.dom.minidom.parseString(response_text)
                formatted_xml = dom.toprettyxml()

                # Save the formatted content to 'rss.xml'
                with open(output_file, 'w', encoding='utf-8') as file:
                    file.write(formatted_xml)

                # Set the HTTP response headers
                self.send_response(200)
                self.send_header('Content-type', 'application/rss+xml; charset=utf-8')  # Set content type to XML
                self.end_headers()

                # Send the content of 'rss.xml' as the response
                with open(output_file, 'rb') as file:
                    self.wfile.write(file.read())
            except xml.parsers.expat.ExpatError as e:
                # Handle XML parsing errors
                error_message = "Error parsing XML: " + str(e)
                self.send_response(500)
                self.send_header('Content-type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(error_message.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

def run(server_class=HTTPServer, handler_class=MyHandler, port=8123):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting HTTP server on port {port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
```

