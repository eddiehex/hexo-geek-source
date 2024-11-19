---
title: iphone手机库存监听
date: 2023-11-01
categories: 
  - Python
tags: [python, iphone, stock monitoring]
toc: true
excerpt: "Learn how to monitor iPhone stock availability using a Python script. This guide provides step-by-step instructions for setting up and running a script to check stock and send notifications via Telegram."
---



```python
from enum import Flag
from random import choice
import requests
import re
from time import sleep

import requests
import time

import smtplib
from email.mime.text import MIMEText

# Telegram Bot API token and chat ID
telegram_api_token = 'bot_token'
telegram_chat_id = '-chat_id'

def sendTelegramMessage(message):
    try:
        url = f"https://api.telegram.org/bot{telegram_api_token}/sendMessage"
        params = {"chat_id": telegram_chat_id, "text": message}
        response = requests.post(url, params=params)
        response.raise_for_status()
        print('Telegram message sent successfully')
    except Exception as e:
        print('Error sending Telegram message:', e)


def AppleMonitor(flag0, count):
    try:
        #根据需要修改地址及产品id，location、product（parts.0=后面的）
        location='辽宁 大连 中山区'
        product='MTQA3CH/A'
        #product='MPUW3CH/A'
        url='https://www.apple.com.cn/shop/fulfillment-messages?pl=true&mts.0=regular&parts.0='+product+'&location='+location
        print(url)
        user_agent_list=['Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.5 (KHTML, like Gecko)','Mozilla/5.0 (Windows NT 6.1; WOW64; rv:11.0) Gecko/20100101 Firefox/11.0','Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C; .NET4.0E)','Opera/9.80 (Windows NT 6.1; WOW64; U; zh-cn) Presto/2.10.229 Version/11.62']
        kv = {'user-agent': choice(user_agent_list)}
        r = requests.get(url, headers=kv)
        r.raise_for_status()
        pattern = re.compile('"pickupDisplay":"(.*?)"', re.S)
        r.encoding = r.apparent_encoding
        res=re.search(pattern,r.text)
        if res.group(1) != 'unavailable':
            if not flag0:
                # Send a Telegram message when the product is available
                sendTelegramMessage('AppleMonitor: ip15pro 大连有货！')
                flag0 = True
                count = 120

            print('=======================================')
            print('=======================================')
            print('=======================================')
            print('                有货！')
            print('=======================================')
            print('=======================================')
            print('=======================================')
            print('')

        if flag0:
            count -= 1
            if count == 0:
                flag0 = False

        return flag0, count
    except Exception as e:
        print("失败:", e)
        return flag0, count

if __name__ == '__main__':
    flag0 = False
    count = 120
    while 1:
        flag0, count = AppleMonitor(flag0, count)
        # Add a sleep to avoid excessive requests
        time.sleep(30)
```

