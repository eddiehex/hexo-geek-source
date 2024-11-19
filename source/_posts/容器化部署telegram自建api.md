---
title: 容器化部署telegram自建api
date: 2023-11-01
categories: 
  - Docker
tags: [telegram, api, docker]
toc: true
excerpt: "Learn how to deploy your own Telegram API using containerization. This guide covers the steps to set up and deploy a custom Telegram API using Docker, ensuring a scalable and efficient deployment process."
---



## 容器构建

创建docker-compose.yml

```yaml
version: '3.7'

services:
  telegram-bot-api:
    image: aiogram/telegram-bot-api:latest
    restart: always
    environment:
      TELEGRAM_API_ID: "your_api_id"
      TELEGRAM_API_HASH: "your_api_hash"
      TELEGRAM_LOCAL: 1
    volumes:
      - $pwd/data:/var/lib/telegram-bot-api
    ports:
      # :左边为映射的端口
      - 8888:8081
```

执行命令

```shell
docker-compose up -d
```



## 使用

- 调用api进行消息通知

  ```
  http://yourdomain.com:8888/bot{bot-token}/sendMessage?chat_id={chat-id}&text={content}
  
  https://api.telegram.org/botXXXXXX/sendMessage?chat_id=YYYYYY&text={content}
  ```

...
