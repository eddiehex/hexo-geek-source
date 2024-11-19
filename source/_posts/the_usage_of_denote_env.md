---
title: Python 中环境变量的使用
date: 2024-11-19
categories: 
    - Python
excerpt: "环境变量的读取和使用介绍"
---

## 背景
环境变量的使用很大程度上是基于隐藏敏感信息，避免敏感信息明文在代码中。实现环境变量的的读取有多种方法，而且不同时候会出现不同的使用方式。

## 使用
### 安装
```python
pip install python-dotenv
```
### 创建`.env`文件

```markdown
   DATABASE_URL=postgres://user:password@localhost:5432/mydatabase
   SECRET_KEY=mysecretkey
```

### 加载环境变量
```python
   from dotenv import load_dotenv
   import os

   load_dotenv()

   database_url = os.getenv('DATABASE_URL')
   secret_key = os.getenv('SECRET_KEY')

   print(f"Database URL: {database_url}")
   print(f"Secret Key: {secret_key}")
```

**注意**
确保 .env 文件在正确的位置。默认情况下，load_dotenv() 会在当前工作目录查找 .env 文件。如果 .env 文件在其他位置，你可以指定路径
```python
load_dotenv("/完整/路径/到/.env")
```

另外如果有引入Openai包的话，他会自动搜寻环境变量，不用取通过 `load_dotenv()`来加载。

### export环境变量
如果在终端设置了环境变量
```shell
   export DATABASE_URL=postgres://user:password@localhost:5432/mydatabase
   export SECRET_KEY=mysecretkey
```
则可以直接读取环境变量
```python
   import os

   database_url = os.getenv('DATABASE_URL')
   secret_key = os.getenv('SECRET_KEY')

   print(f"Database URL: {database_url}")
   print(f"Secret Key: {secret_key}")
```