---
title: 基于ddddocr库的验证码识别
date: 2023-10-15
categories: 
  - Python
tags: [python, ddddocr]
toc: true
excerpt: "Implement CAPTCHA recognition using the ddddocr library. This guide covers the setup and usage of ddddocr for effective CAPTCHA solving in Python applications."
---

## 背景

Ebay公益服的持续使用往往需要通过签到赚取积分来维持，偶尔因忙于他事容易忘记，故在翻阅他人资料后着手开发。

## 依赖准备

- ddddocr 用于验证码识别
- telethon 同telegram交互
- asyncio 异步任务处理
- requests 通知请求

```shell
# 安装
pip install ddddocr
# 安装时发生了报错
AttributeError: module 'PIL.Image' has no attribute 'ANTIALIAS'
```

在github上发现有[issue](https://github.com/sml2h3/ddddocr/issues/139)解决方案

```sh
#按照方案二处理，降级Pillow的版本，比如使用9.5.0版本（先卸载，再重新安装）
pip uninstall -y Pillow
pip install Pillow==9.5.0
```

其他正常安装即可

## ddddocr 使用

```python
import ddddocr

ocr = ddddocr.DdddOcr(beta=True,show_ad=False) #开启测试版 关闭广告

with open("test.jpg", 'rb') as f:
    image = f.read()

res = ocr.classification(image)
print(res)
```

图片示例：

![识别图片示例](https://od.wadaho.cf/api/raw/?path=/picture/blog/2023-11-13%2012.54.05.jpg)

其他一些[用法](https://github.com/sml2h3/ddddocr#readme)

## 实现

实现路径为

- 通过与telegram交互发送签到/checkin 命令，
- 获取验证码，
- 通过captcha_solver识别验证码，
- 最后交互发送识别结果，
- 判断结果信息，失败重试。

```python
# -*- coding: utf-8 -*-
import os
import time
from telethon import TelegramClient, events
import ddddocr
import asyncio
import requests
def notice(text):
    api_url = "https://noticurl.com/send_notification"
    data = {
        "chat_id": "{chat_id}",
        "text": text
    }
    response = requests.post(api_url, json=data)
    return print(response.json())

def captcha_solver(f):
    with open(f, 'rb') as image_file: 
        image_bytes = image_file.read()
        ocr = ddddocr.DdddOcr(beta=True, show_ad=False)
        res = ocr.classification(image_bytes)
    return res

async def tg_qd(client, tg_bot, tg_command):
    await client.send_message(tg_bot, tg_command)
    await asyncio.sleep(5)  # 使用 asyncio.sleep 代替 time.sleep
    messages = await client.get_messages(tg_bot)
    await messages[0].download_media(file="1.jpg")
    the_code = captcha_solver("1.jpg")
    await client.send_message(tg_bot, the_code)
    await asyncio.sleep(5)
    messages = await client.get_messages(tg_bot)
    return messages[0].message

api_id = [{api_id}]  # 输入api_id，一个账号一项
api_hash = ['{api_hash}']  # 输入api_hash，一个账号一项
session_name = api_id[:]
bots_commands = ["@{channelname}", "/checkin", "成功","/cancle"]

async def main():
    for num in range(len(api_id)):
        session_name[num] = "id_" + str(session_name[num])
        client = TelegramClient(
            session_name[num],
            api_id[num],
            api_hash[num],
            proxy=("socks5", "127.0.0.1", 1087), #本地运行开启代理
        )
        try:
            await client.start()
            the_result = await tg_qd(client, bots_commands[0], bots_commands[1])
            print(the_result)
            i = 0
            while bots_commands[2] not in the_result: 
                i += 1
                await client.send_message(bots_commands[0], bots_commands[3])
                await asyncio.sleep(5)
                the_result = await tg_qd(client, bots_commands[0], bots_commands[1])
                if i > 2: 
                    break
            text = the_result + "终点站"
            notice(text)
        except Exception as err:
            error_message = f"Error in main(): {str(err)}"
            notice(error_message)
        finally:
            await client.disconnect()

asyncio.run(main())

```

# 其他

### Truecaptcha

本来想通过[truecaptcha](https://truecaptcha.org/code.html)来实现验证码识别

```python
import requests
import base64

def solve(f):
	with open(f, "rb") as image_file:
		encoded_string = base64.b64encode(image_file.read()).decode('ascii')
		url = 'https://api.apitruecaptcha.org/one/gettext'

		data = { 
			'userid':'{id}', #填入id
			'apikey':'{key}',  #填入key
			'data':encoded_string
		}
		response = requests.post(url = url, json = data)
		data = response.json()
		return data
```

但是之前的单日100的限额变成了一次。

另外试了一下改服务对于中文识别不太行，英文数字还可以

### telegram交互

后续还需要多研究研究！
