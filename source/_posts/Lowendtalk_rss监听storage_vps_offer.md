---
title: Lowendtalk_rss监听storage_vps_offer
date: 2023-11-01
categories: 
  - Python
tags: [python, rss, vps]
toc: true
excerpt: "Learn how to monitor Lowendtalk RSS feeds for storage VPS offers using a Python script. This guide provides step-by-step instructions for setting up and running a script to track and notify you of new VPS offers."
---

### 背景

最近开始玩pt，想要看看有没有合适又便宜的storage vps，所以通过chat-gpt写了个python脚本实现对于Lowendtalk offer板块的监听。逻辑大致是通过`feedparser` 获取rss内容找到大于最晚时间的文章标题查询是否包含storage，将rss中的最晚文章的时间进行保存，如果有则通过telegram api 实现消息推送。



### 脚本

```python
import feedparser
import requests
from datetime import datetime, timezone

def notice(text):
    api_url = "api_url"
    data = {
        "chat_id": "-chat_id",
        "text": text
    }
    response = requests.post(api_url, json=data)
    return response

def fetch_and_notify():
    try:
        # URL of the RSS feed
        rss_url = "https://lowendtalk.com/categories/offers/feed.rss"

        # Parse the RSS feed
        feed = feedparser.parse(rss_url)

        # Read the last published date from file
        with open("/root/script/let_monitor/last_date.txt", "r") as file:
            last_date_str = file.read().strip()
            last_date = datetime.strptime(last_date_str, '%a, %d %b %Y %H:%M:%S %z') if last_date_str else datetime.min.replace(tzinfo=timezone.utc)

        # Initialize the latest date variable
        latest_date = last_date

        # Sort entries by publication date
        entries = sorted(feed.entries, key=lambda e: datetime.strptime(e.published, '%a, %d %b %Y %H:%M:%S %z'), reverse=True)

        # Iterate over sorted entries and send notifications for new entries
        for entry in entries:
            entry_date = datetime.strptime(entry.published, '%a, %d %b %Y %H:%M:%S %z')
            if entry_date > last_date and 'storage' in entry.title.lower():
                title = entry.title
                link = entry.link
                pub_date = entry.published

                # Format the message to send
                message = f"#VPSOFFER👋👋\nNew Post: {title}\nLink: {link}\nPublished on: {pub_date}"

                # Send the notification
                response = notice(message)
                print(f"Notification sent for {title}, status code: {response.status_code}")

                # Update the latest date
                if entry_date > latest_date:
                    latest_date = entry_date

        # Save the latest date to file
        with open("/root/script/let_monitor/last_date.txt", "w") as file:
            file.write(latest_date.strftime('%a, %d %b %Y %H:%M:%S %z'))

    except Exception as e:
        error_message = f"Error in fetch_and_notify: {str(e)}"
        notice(error_message)
        print(error_message)

# Call the function to start the process
fetch_and_notify()

```

### feedparser 的用法

```python
import feedparser

# 1. 从 URL 获取 RSS/Atom 订阅内容
feed_url = "https://www.example.com/feed.xml"  # 替换成实际的 RSS/Atom 订阅链接
feed = feedparser.parse(feed_url)

# 2. 访问订阅内容信息
print("订阅名称:", feed.feed.title)
print("订阅链接:", feed.feed.link)
print("订阅描述:", feed.feed.description)

# 3. 访问订阅内容中的条目
for entry in feed.entries:
    print("条目标题:", entry.title)
    print("条目链接:", entry.link)
    print("条目发布时间:", entry.published)
    print("条目摘要:", entry.summary)
    # 访问其他条目信息，例如作者，标签，内容，等
    # ...

# 4. 访问条目内容
for entry in feed.entries:
    # 访问完整的内容，如果可用
    print("条目完整内容:", entry.content[0].value)

# 5. 处理错误
if feed.status != 200:
    print("错误:", feed.bozo_exception)
```

**示例解释:**

1. **获取订阅内容:** 使用 `feedparser.parse(feed_url)` 函数解析 RSS/Atom 订阅内容。
2. **访问订阅信息:**  可以使用 `feed.feed.title`、`feed.feed.link` 和 `feed.feed.description` 访问订阅的标题、链接和描述信息。
3. **访问条目:** `feed.entries` 包含订阅中的所有条目，你可以遍历它们并访问每个条目的信息。
4. **访问条目内容:** 每个条目都包含 `title`、`link`、`published` 和 `summary` 属性，你可以根据需要访问其他属性。
5. **处理错误:**  `feed.status` 表示 HTTP 状态码，`feed.bozo_exception` 表示解析错误信息。

**其他常用用法:**

* **指定解析器:**  可以使用 `feedparser.parse(feed_url, handlers={})`, 其中 `handlers` 是一个字典，用于指定自定义解析器。
* **使用缓存:** 使用 `feedparser.parse(feed_url, cache=True)` 可以将订阅内容缓存起来，避免重复解析。
* **处理图片:**  某些 RSS/Atom 订阅包含图片信息，可以使用 `entry.media_content` 访问它们。
* **处理自定义字段:** 不同订阅可能有不同的自定义字段，可以使用 `entry.keys()` 查看可用字段，并根据需要访问它们。

**示例代码中的注释部分包含更多示例用法，你可以根据需要进行修改。**
