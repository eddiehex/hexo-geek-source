---
title: 尝试调用E5-graph API 实现邮箱发送
date: 2023-11-01
categories: 
  - Python
tags: [python,API]
toc: true
excerpt: "通过调用E5-graph API，实现自动化邮箱发送功能。本指南涵盖了从API配置到邮件发送的详细步骤，适合希望简化邮件发送流程的开发者。"
---

## Azure 应用创建

- 创建api 获取client_Id, client_secrete
- 添加api权限

![img](https://od.009100.xyz/api/raw/?path=/picture/blog/api_authority.png)

## 基于Flask 创建API

- 创建路由获取post请求的json数据
- 通过client_id等信息请求发起token请求
- 使用token调用api实现邮件发送

```python
from flask import Flask, request, jsonify
import requests
import json

app = Flask(__name__)

# 应用程序注册时获得的信息
client_id = "{client_Id}"
client_secret = "{client_secrete}"
redirect_uri = "http://localhost"

# 租户 ID，通常为 "common"
tenant_id = "{tenant_Id}"

# Microsoft Graph API 的端点
token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
graph_api_url = "https://graph.microsoft.com/v1.0/users/{mail_address}/sendMail"

@app.route('/send_email', methods=['POST'])
def send_email():
    # 获取 POST 请求的 JSON 数据
    data = request.get_json()

    # 构建获取访问令牌的请求
    token_payload = {
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": client_secret,
        "scope": "https://graph.microsoft.com/.default"
    }

    token_response = requests.post(token_url, data=token_payload)
    token_data = token_response.json()

    # 提取访问令牌
    access_token = token_data.get("access_token")
    print(access_token)

    # 构建发送邮件的请求
    email_payload = {
        "message": {
            "subject": data.get("subject"),
            "body": {
                "contentType": "Text",
                "content": data.get("body"),
            },
            "toRecipients": [
                {
                    "emailAddress": {
                        "address": data.get("recipient"),
                    }
                }
            ],
        }
    }

    headers = {
        "Authorization": "Bearer " + access_token,
        "Content-Type": "application/json",
    }

    # 发送邮件
    email_response = requests.post(graph_api_url, headers=headers, json=email_payload)

    # 打印 API 响应
    print(email_response.text)

    # 检查是否成功发送邮件
    if email_response.status_code == 202:
        return jsonify({"status": "success", "message": "邮件发送成功！"})
    else:
        return jsonify({"status": "error", "message": f"邮件发送失败，状态码：{email_response.status_code}, 内容：{email_response.text}"})


if __name__ == '__main__':
    app.run(debug=True,port=8444)

```

## API调用

- 创建待发邮件数据json数据
- 发起post请求

```python
import requests
import json

# API 的完整 URL，包括协议、域名和端口
api_url = "https://domain.com/s/send_email"

# 要发送的邮件数据
email_data = {
    "subject": "Test Subject",
    "body": "This is the email body.",
    "recipient": "xxxxx@icloud.com"
}

try:
    # 发送 POST 请求给 API
    response = requests.post(api_url, json=email_data)

    # 尝试解析 JSON
    result = response.json()

    # 检查响应状态码
    if response.status_code == 200:
        print("API 响应成功:", result)
    else:
        print("API 响应错误:", result)

except requests.exceptions.RequestException as e:
    print("请求异常:", e)
except json.JSONDecodeError as e:
    print("JSON 解码错误:", e)

```

## 失败

因微软限制邮件滥发等原因，调用成功后邮件被退回

![fail](https://od.009100.xyz/api/raw/?path=/picture/blog/fail.png)

## requests 库post 和get 方法

后续需完成这两个方法的总结，非常常用。
