---
title: python异步函数初步认识
date: 2023-11-01
categories: 
  - Python
tags: [python, async]
toc: true
excerpt: "Get an introduction to asynchronous functions in Python. This guide covers the basics of async programming, including how to write and use async functions to improve the performance of your Python applications."
---

## 背景

上次在Chat-gpt的指导下完成了通过flaresolverr绕过cloudflare访问nodeseek的RSS，一段时间后发现因为访问频繁，常常会发生服务堵塞问题导致服务不可用，主要原因在于flaresolverr处理请求maxTimeout为60秒，任务时间较长，基于该情况下有了此次改造。

## 实现

- 将代码拆分为两部分，一部分通过flaresolverr获取RSS数据；另一部分为创建Http服务监听8123端口，响应访问请求返回RSS数据
- 引入异步函数，提升并发处理能力，避免多次请求造成服务堵塞

### 代码梳理

好的，让我们来详细解释一下整个访问响应的过程：

1. **启动服务：** 通过运行 `app.py` 中的代码，启动了一个 HTTP 服务。这个服务监听在 8123 端口。

    ```python
    if __name__ == '__main__':
        loop = asyncio.get_event_loop()
        app = loop.run_until_complete(init_app())
        web.run_app(app, port=8123)
    ```

2. **路由设置：** 在 `app.py` 中的 `init_app` 函数中，设置了路由。对于根路径 `'/'` 的 GET 请求，会调用 `handle` 函数。

    ```python
    async def init_app():
        app = web.Application()
        app.router.add_get('/', handle)
        return app
    ```

3. **异步处理请求：** 在 `handle` 函数中，通过调用 `get_rss_data()` 获取 RSS 数据，`get_rss_data` 函数定义在 `get_rss_data.py` 中。

    ```python
    async def handle(request):
        rss_data = await get_rss_data()
        return web.Response(text=rss_data, content_type='application/xml')
    ```

4. **获取最新 RSS 数据：** 在 `get_rss_data` 函数中，通过异步调用 `reqfla` 函数，该函数发送 POST 请求获取 RSS 数据。注意，在 `get_rss_data` 函数中使用了全局变量 `session_id` 和 `sessions` 来保持会话信息。

    ```python
    async def reqfla():
      			# ... 省略
    async def get_rss_data():
        try:
            global session_id, sessions
            # ... 省略部分代码
            response = await reqfla(request_cmd)
            result = response.get('solution', {}).get('response', '')
            # ... 省略部分代码
            return formatted_xml
        except Exception as e:
            print(f"Error: {e}")
    ```

5. **返回响应：** 最终，`handle` 函数返回了包含最新 RSS 数据的 HTTP 响应。

    ```python
    return web.Response(text=rss_data, content_type='application/xml')
    ```

6. **运行事件循环：** 在 `__main__` 部分，通过 `loop.run_until_complete(init_app())` 创建并运行事件循环。事件循环负责协调和调度异步任务的执行。

    ```python
    if __name__ == '__main__':
        loop = asyncio.get_event_loop()
        app = loop.run_until_complete(init_app())
        web.run_app(app, port=8123)
    ```

这样，当有请求访问 8123 端口的根路径时，就会触发 `handle` 函数，进而调用 `get_rss_data` 函数获取最新的 RSS 数据，并将数据返回给客户端。整个过程中，利用了异步编程的特性，确保在等待 I/O 操作的过程中，不会阻塞其他任务的执行，提高了程序的效率。

### get_rss_data.py

```python
import json
import requests
import xml.dom.minidom
import xml.parsers.expat
from datetime import datetime

# 获取当前日期和时间
current_datetime = datetime.now()

# 格式化日期和时间为字符串
formatted_datetime = current_datetime.strftime("%Y-%m-%d %H:%M:%S")

url = 'http://localhost:8191/v1'
dest = 'http://www.nodeseek.com/rss.xml'
session_id = ""
sessions = []
output_file = "rss.xml"
headers = {
    "Content-Type": "application/json"
}

create_cmd = {
    "cmd": "sessions.create",
    "url": dest
}

list_cmd = {
    "cmd": "sessions.list"
}

destroy_cmd = {
    "cmd": "sessions.destroy",
    "session": session_id
}

request_cmd = {
    "cmd": "request.get",
    "url": dest,
    "maxTimeout": 60000,
    "session": session_id
}

async def reqfla(cmd):
    response = requests.post(url, headers=headers, json=cmd)
    result = response.json()
    if result.get('status') == 'ok':
        return result
    else:
        raise Exception(result.get('message', 'Unknown error'))

async def get_rss_data():
    global session_id, sessions  # Declare as global variables
    try:
        # Modify the parameters to match create_cmd
        if session_id == "":
            list_session = await reqfla(list_cmd)
            sessions = list_session.get("sessions")
            print("留存的 sessions:", sessions)

            if len(sessions) > 1:
                for session in sessions:
                    destroy_cmd["session"] = session
                    destroy_session = await reqfla(destroy_cmd)
                    print(destroy_session.get("message"))

            if not sessions:
                create_session = await reqfla(create_cmd)
                session_id = create_session.get("session")
                sessions.append(session_id)
                print("最新创建的 sessions：", sessions)

        session_id = sessions[0]
        print("-" * 10, formatted_datetime, "-" * 10)
        print("本次使用 session_id：", session_id)
        response = await reqfla(request_cmd)
        result = response.get('solution', {}).get('response', '')
        print("请求完成，开始处理 xml")

        dom = xml.dom.minidom.parseString(result)
        formatted_xml = dom.toprettyxml()

        with open(output_file, 'w', encoding='utf-8') as file:
            file.write(formatted_xml)
        print("xml文件处理完成等待访问")

        return formatted_xml
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    import asyncio

    async def main():
        await get_rss_data()

    asyncio.run(main())

```

### app.py

```python
import asyncio
from aiohttp import web
from get_rss_data import get_rss_data

async def handle(request):
    # 异步处理 HTTP 请求的函数
    rss_data = await get_rss_data()
    return web.Response(text=rss_data, content_type='application/xml')

async def init_app():
    # 初始化异步 web 应用
    app = web.Application()
    app.router.add_get('/', handle)
    return app

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    app = loop.run_until_complete(init_app())
    web.run_app(app, port=8123)
```

## 异步函数

当你使用异步编程时，主要涉及到协程（coroutine）和事件循环（event loop）的概念。以下是异步编程的基本流程：

1. **定义异步函数（协程）：** 使用 `async def` 定义异步函数。异步函数中可以包含 `await` 表达式，用于等待其他异步任务的执行。

    ```python
    async def some_async_function():
        result = await some_other_async_function()
        print(result)
    ```

2. **创建事件循环：** 使用 `asyncio.get_event_loop()` 创建一个事件循环对象。

    ```python
    loop = asyncio.get_event_loop()
    ```

3. **运行异步任务：** 使用事件循环的 `run_until_complete` 方法运行异步任务。

    ```python
    loop.run_until_complete(some_async_function())
    ```

4. **启动事件循环：** 使用 `loop.run_forever()` 启动事件循环。事件循环会负责调度异步任务的执行。

    ```python
    loop.run_forever() 
    #在上述的代码中，虽然没有显式地调用 `loop.run_forever()`，但 `web.run_app(app, port=8123)` 实际上会在内部启动事件循环并一直运行，直到应用程序停止。
    
    #`web.run_app()` 是 aiohttp 框架提供的一个方便的函数，它会在内部启动事件循环，监听 HTTP 请求，并持续运行直到应用程序结束。因此，在这个特定的情境下，你不需要显式地调用 `loop.run_forever()`。
    ```

或者，在终止事件循环前，通过 `loop.run_until_complete` 来运行异步任务：

```python
loop.run_until_complete(some_async_function())
```

总体来说，异步编程的关键在于充分利用等待 I/O 操作的时间，让程序在等待的时候不阻塞，而是去执行其他任务。事件循环负责协调和调度这些异步任务的执行，使得整个程序能够以更高效的方式运行。