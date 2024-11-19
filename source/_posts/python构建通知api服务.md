---
title: python构建通知api服务
date: 2023-11-01
categories: 
  - Python
  - API
tags: [api, flask, nginx, python]
toc: true
excerpt: "Learn how to build a notification API service using Python. This guide provides step-by-step instructions for setting up and deploying a notification service with Flask and Nginx."
---

## 模块准备

有必要的话先安装虚拟环境，进行隔离

```shell
pip install virtualenv
# 或者
apt-get install python3-venv
# 当前目录创建虚拟环境
python -m venv venv
# 激活虚拟环境
source venv/bin/activate
# 关闭虚拟环境
deactive
```

安装必要模块

```shell
pip install flask
pip requests
```

## 代码

利用flask创建api服务

```python
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Telegram 机器人的 API 地址
telegram_bot_api = "your token api url"

@app.route('/send_notification', methods=['POST'])
def send_notification():
    try:
        # 获取请求中的数据
        data = request.json
        chat_id = data.get('chat_id')
        text = data.get('text')

        # 检查是否缺少必要的参数
        if not chat_id or not text:
            return jsonify({"error": "Missing required parameters"}), 400

        # 构建请求参数
        params = {
            "chat_id": chat_id,
            "text": text,
        }

        # 发送 HTTP 请求
        response = requests.get(telegram_bot_api, params=params)

        # 返回响应结果
        return jsonify({"status": "success", "response": response.text}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
```

## ngixn 反代该服务

通过nginx实现反向代理：

- 第一种写法nginx会将`/api` 路径带入服务导致路由路径变为`/api/send_notification` 从而报错，需要改flask路由
- 第二种写法则去掉了路径中的`/api` 

```shell
location /api {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

```shell
location /api {
    rewrite ^/api(/.*)$ $1 break;  # 去掉路径中的 /api 部分
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 服务请求

通过python request 请求服务实现通知发送

```python
import requests

def notice(text):
    api_url = "https://address.com/api/send_notification"
    data = {
        "chat_id": "-1001970059003",
        "text": text
    }
    response = requests.post(api_url, json=data)

    return print(response.json())

if __name__ == "__main__":
    text = "你好"
    notice(text)
```

## 后记

感觉像是在无限套娃，虽然少写了一个bot token，也还行吧！