---
title: python自动签到pt站点
date: 2023-11-01
categories: 
  - Python
tags: [python, pt]
toc: true
excerpt: "Learn how to automate the check-in process for PT sites using Python. This guide provides step-by-step instructions for setting up and running a script to automatically sign in to your PT accounts."
---
## python调用requests 实现签到动作

- requsets 访问pt站点签到
- telegram 机器人通知签到结果

```python
import requests

url = 'https://www.ptdomain.org/attendance.php'
notify_success_url = 'http://api.telegram.org/bot{bot-token}/sendMessage?chat_id={chat-id}&text=PT签到成功!'
notify_failure_url = 'http://api.telegram.org/bot{bot-token}/sendMessage?chat_id={chat-id}&text=PT签到失败!'

headers = {
    'authority': 'www.ptdomain.org',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'zh,zh-CN;q=0.9',
    'cache-control': 'max-age=0',
    'cookie': 'your cookies', #修改为你的cookies
    'referer': 'https://www.pttime.org/index.php',
    'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
}

response = requests.get(url, headers=headers)

# Check if the response contains a string indicating successful sign-in
if '签到成功' in response.text:
    print('签到成功！')
    # 发送成功通知
    notify_response = requests.get(notify_success_url)
    if notify_response.status_code == 200:
        print('成功通知已发送成功！')
    else:
        print(f'成功通知发送失败，状态码: {notify_response.status_code}')
else:
    print('签到未成功。')
    # 发送失败通知
    notify_response = requests.get(notify_failure_url)
    if notify_response.status_code == 200:
        print('失败通知已发送成功！')
    else:
        print(f'失败通知发送失败，状态码: {notify_response.status_code}')
```

## headers 获取

利用chrome开发工具直接复制请求代码

![chrome开发工具](https://od.wadaho.cf/api/raw/?path=/picture/blog/picshoot1.png)

## 使用crontab定时执行任务

添加下列任务

```shell
crontab -e
0 9 * * * /usr/bin/python3 /root/script/sign/abc.py  # 每天上午9点执行
```

