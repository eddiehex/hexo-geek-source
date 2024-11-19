---
title: python 虚拟环境安装
date: 2023-11-01
categories: 
  - Python
tags: [python, virtual environment]
toc: true
excerpt: "Learn how to set up a Python virtual environment. This guide provides step-by-step instructions for creating and managing virtual environments to isolate your Python projects and dependencies."
---

- 自带工具包 vevn

```sh
python3 -m venv myenv
# 近支持Python 3.3 以后的版本
```

- 第三发工具包

```sh
python3 -m virtualenv myenv
# 需要先安装
pip install virtualenv
```



## 使用命令

- 激活

```sh
source myenv/bin/activate
```

- 退出

```sh
deactivate
```

- 删除

```sh
rm -rf myenv
```

## 其他

- pyvenv.cfg 文件

```text
home = /opt/homebrew/opt/python@3.10/bin
implementation = CPython
version_info = 3.10.13.final.0
virtualenv = 20.24.6
include-system-site-packages = false
base-prefix = /opt/homebrew/opt/python@3.10/Frameworks/Python.framework/Versions/3.10
base-exec-prefix = /opt/homebrew/opt/python@3.10/Frameworks/Python.framework/Versions/3.10
base-executable = /opt/homebrew/opt/python@3.10/bin/python3.10
```

文件中包含了环境使用的解释器相关信息，文件位于myenv目录下

- requirements.txt

通常项目会有一些自己需要的特定版本的依赖，虚拟环境很好的解决了不同项目对同一模块不同版本需求的管理

安装：

```sh
pip install -r requirements.txt
```



