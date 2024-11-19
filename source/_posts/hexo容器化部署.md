---
title: hexo 容器化部署
date: 2023-11-01
categories: 
  - Docker
tags: [hexo, docker]
toc: true
excerpt: "Learn how to deploy your Hexo blog using containerization. This guide provides step-by-step instructions for setting up and deploying Hexo with Docker, ensuring a scalable and efficient deployment process."
---
#### Dockerfile 构建hexo镜像
```FROM node:latest
# 维护者信息
MAINTAINER eddie <kygoho@live.com>
# 工作目录
WORKDIR root/blog
# 安装Hexo
RUN npm init -y\
   && npm install hexo-cli -g \
   && npm install hexo-server \
   && hexo init hexo && cd hexo \
   && npm install \
   && npm install hexo-deployer-git \
# 设置git
   && git config --global user.name "eddiehex" \
   && git config --global user.email "kygoho@live.com"\
   && npm i -S hexo-prism-plugin \
   && npm install hexo-generator-search --save \
   && npm i hexo-permalink-pinyin --save \
   && npm install hexo-generator-feed --save \
   && npm install hexo-deployer-git --saven
# 映射端口
EXPOSE 4000
WORKDIR hexo
# 运行命令
CMD ["/usr/bin/env", "hexo", "server"]
```
#### 运行容器
```
docker run -d -p 4000:4000 -v $PWD/hexo:/root/blog/hexo --name hexo hexo
```
笔记：

- 最新的npm需要先确定workdir 才能安装
- 需要先进行npm init初始化才能生成package.json 才能npm install
- hexo init 需要在一个新的空文件
