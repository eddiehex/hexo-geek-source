---
title: 利用 API 自动获取汇率并实时通知
date: 2023-11-01
categories: 
  - Python
tags: [python, api]
toc: true
excerpt: "Learn how to automatically fetch exchange rates using an API and send real-time notifications. This guide covers the setup and implementation of a Python script to keep you updated with the latest currency exchange rates."
---

## 背景

> by chat-gpt3.5

在国际贸易和金融交流中，汇率是一个至关重要的因素，直接影响着货币之间的兑换关系。为了方便地获取汇率信息并实时通知，我们可以利用 Python 编写一个脚本，通过 API 自动获取汇率数据，并将结果保存到 CSV 文件中。本文将介绍如何使用 ExchangeRate-API 提供的接口，获取土耳其里拉（TRY）、美元（USD）对人民币（CNY）的汇率，并额外获取美元对新加坡元（SGD）的汇率。

## 实现

首先，我们使用 `requests` 库发送 HTTP 请求，获取 ExchangeRate-API 提供的最新汇率数据。以下是获取汇率的函数：

```python
import requests
import json
import schedule
import time
import csv

def get_exchange_rate_by_api(currency, currency_to):
    url = "https://api.exchangerate-api.com/v4/latest/" + currency
    response = requests.get(url)
    data = response.json()
    exchange_rate = data["rates"][currency_to]
    return exchange_rate
```

接下来，我们通过调度get_exchange_rate_by_api，每天执行获取汇率的操作，并将结果保存到 CSV 文件中：

```python
def job():
    rate_try = get_exchange_rate_by_api("TRY", "CNY")
    rate_usd = get_exchange_rate_by_api("USD", "CNY")
    rate_sgd = get_exchange_rate_by_api("USD", "SGD")

    today = time.strftime("%Y-%m-%d", time.localtime())

    with open('exchange_rates.csv', 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([today, "TRY", "CNY", rate_try])
        writer.writerow([today, "USD", "CNY", rate_usd])
        writer.writerow([today, "USD", "SGD", rate_sgd])

    notice_text = f"今日{today}，土耳其里拉对人民币的汇率为：{rate_try}，美元对人民币的汇率为：{rate_usd}，美元对新加坡元的汇率为：{rate_sgd}"
    notice(notice_text)

    print(f"执行完成，{today}")
```

最后，我们定义通知函数 `notice`，通过 Telegram Bot API 将获取到的汇率信息发送到指定的聊天群：

```python
def notice(text):
    api_url = "https://domain.com/api/send_notification"
    data = {
        "chat_id": "{chat_id}",
        "text": text
    }

    response = requests.post(api_url, json=data)

    if response.status_code == 200:
        print("通知成功")
    else:
        print("通知失败")
    return
```

在主程序中，我们通过 `if __name__ == '__main__':` 判断脚本是否直接运行，如果是，则执行 `job()` 函数，

再通过cron任务实现每天早上 9 点自动获取并通知汇率信息。

通过这样的自动化脚本，我们可以方便地获取最新的汇率数据，并及时了解货币兑换情况。