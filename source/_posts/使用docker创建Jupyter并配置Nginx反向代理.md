---
title: 使用docker创建Jupyter并配置Nginx反向代理
date: 2023-11-01
categories: 
  - Docker
tags: [jupyter, nginx, docker]
toc: true
excerpt: "Learn how to create a Jupyter environment using Docker and configure Nginx as a reverse proxy. This guide provides step-by-step instructions for setting up and deploying Jupyter with Nginx for enhanced accessibility and security."
---

#### docker创建Jupyter服务

```shell
#本地端创建相关文件夹
mkdir -p /opt/jupyter/jovyan
mkdir -p /opt/jupyter/jovyan/.jupyter
chmod 777 -R /opt/jupyter/jovyan
#获取jupyter镜像
docker pull jupyter/base-notebook:notebook-5.7.8
#创建jupyter容器
docker run --name vk-jupyter -d \
-p 8888:8888 \
-v /opt/jupyter/jovyan:/home/jovyan \
jupyter/base-notebook:notebook-5.7.8
#获取jupyter的token
docker exec -it vk-jupyter jupyter notebook list
#设置密码
docker exec -it vk-jupyter jupyter notebook password
docker restart vk-jupyter
#安装插件
docker exec -it vk-jupyter pip install ipywidgets
#安装常用命令
docker exec --user root -it vk-jupyter /bin/bash #使用管理员权限进入
apt update
apt install curl
apt install unzip
```

#### 配置nginx反向代理

因为服务器中已存在多个应用，故使用服务器子地址路径实现域名访问notebook

首先修改nginx_location配置文件

```shell
    location /py {
        proxy_set_header   Host             $host;
        proxy_set_header   X-Real-IP        $remote_addr;
        proxy_set_header  X-Forwarded-For  $proxy_add_x_forwarded_for;

        proxy_pass http://172.0.0.1:8888;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
```

重启nginx -t && nginx -s reload

修改/opt/jupyter/jovyan/.jupyter/jupyter_notebook_config.py 配置文件

```shell
{
  "NotebookApp": {
    "password": "your passwored",
    "base_url": "/py"
  }
}
```

重启docker restart vk-jupyter
