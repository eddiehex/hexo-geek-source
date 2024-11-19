---
title: docker 知识
date: 2023-11-01
categories: 
  - Docker
tags: [docker, tutorial]
toc: true
excerpt: "Unlock the potential of Docker with this comprehensive guide. Learn the fundamentals of containerization, how to set up Docker, and best practices for managing Docker containers efficiently."
---
#### 安装

```shell
# 安装依赖包
yum install -y yum-utils
# 加 yum 软件源
yum-config-manager \
     --add-repo \
     https://download.docker.com/linux/centos/docker-ce.repo
# 更新 yum 软件源缓存，并安装 docker-ce
yum install docker-ce docker-ce-cli containerd.io
```

``` shell
# FirewallBackend=nftables 关闭防火墙
FirewallBackend=iptables
# 启动
systemctl enable docker
systemctl start docker
```



#### 获取镜像

```shell
# docker pull --help
# docker pull 应用名：【标签】
docker pull [选项] [Docker Registry 地址[:端口号]/]仓库名[:标签]
```



#### 运行

```shell
 docker run -it --rm ubuntu:18.04 bash
 docker exec -it nginx /bin/bash
# -it:这是两个参数，一个是 -i：交互式操作，一个是 -t 终端。我们这里打算进入 bash 执行一些命令并查看返回结果，因此我们需要交互式终端。
# --rm：这个参数是说容器退出后随之将其删除。默认情况下，为了排障需求，退出的容器并不会立即删除，除非手动 docker rm。我们这里只是随便执行个命令，看看结果，不需要排障和保留结果，因此使用 --rm 可以避免浪费空间。
# ubuntu:18.04：这是指用 ubuntu:18.04 镜像为基础来启动容器
# bash：放在镜像名后的是 命令，这里我们希望有个交互式 Shell，因此用的是 bash
```

#### 列出镜像

``` shell
$ docker image ls
REPOSITORY           TAG                 IMAGE ID            CREATED             SIZE
redis                latest              5f515359c7f8        5 days ago          183 MB
nginx                latest              05a60462f8ba        5 days ago          181 MB
mongo                3.2                 fe9198c04d62        5 days ago          342 MB
<none>               <none>              00285df0df87        5 days ago          342 MB
ubuntu               18.04               329ed837d508        3 days ago          63.3MB
ubuntu               bionic              329ed837d508        3 days ago          63.3MB
```

> 列表包含了 `仓库名`、`标签`、`镜像 ID`、`创建时间` 以及 `所占用的空间`。
>
> 其中仓库名、标签在之前的基础概念章节已经介绍过了。**镜像 ID** 则是镜像的唯一标识，一个镜像可以对应多个 **标签**。因此，在上面的例子中，我们可以看到 `ubuntu:18.04` 和 `ubuntu:bionic` 拥有相同的 ID，因为它们对应的是同一个镜像。

#### 镜像体积

```shell
#镜像、容器、数据卷所占用的空间
$ docker system df

TYPE                TOTAL               ACTIVE              SIZE                RECLAIMABLE
Images              24                  0                   1.992GB             1.992GB (100%)
Containers          1                   0                   62.82MB             62.82MB (100%)
Local Volumes       9                   0                   652.2MB             652.2MB (100%)
Build Cache                                                 0B                  0B
```

#### 删除本地镜像

``` shell
#先将运行容器暂停删除才能删除镜像
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker image rm $(docker images)
$ docker image rm [选项] <镜像1> [<镜像2> ...]
# 我们需要删除所有仓库名为 redis 的镜像
$ docker image rm $(docker image ls -q redis)
# 删除所有在 mongo:3.2 之前的镜像
$ docker image rm $(docker image ls -q -f before=mongo:3.2)
```

#### dockerfile定制镜像

``` shell
$ mkdir mynginx
$ cd mynginx
$ touch Dockerfile
vi Dockerfile
#dockerfile 文件内容
FROM nginx
RUN echo '<h1>Hello, Docker!</h1>' > /usr/share/nginx/html/index.html
#构建镜像
build -t nginx:v3 .
```

docker还能通过git、tar压缩包进行构建相应的镜像

#### run执行命令

- *shell* 格式：`RUN <命令>`，就像直接在命令行中输入的命令一样。刚才写的 Dockerfile 中的 `RUN` 指令就是这种格式。
- *exec* 格式：`RUN ["可执行文件", "参数1", "参数2"]`，这更像是函数调用中的格式。

#### copy复制文件

- ``COPY [--chown=<user>:<group>] <源路径>... <目标路径>``
- ``COPY [--chown=<user>:<group>] ["<源路径1>",... "<目标路径>"]``

``` shell
COPY hom* /mydir/
COPY hom?.txt /mydir/
```

`<目标路径>` 可以是容器内的绝对路径，也可以是相对于工作目录的相对路径（工作目录可以用 `WORKDIR` 指令来指定）。目标路径不需要事先创建，如果目录不存在会在复制文件前先行创建缺失目录。

此外，还需要注意一点，使用 `COPY` 指令，源文件的各种元数据都会保留。比如读、写、执行权限、文件变更时间等。这个特性对于镜像定制很有用。特别是构建相关文件都在使用 Git 进行管理的时候。

#### add更高级的复制文件



#### docker compose

``` shell
#二进制安装
curl -L https://github.com/docker/compose/releases/download/1.27.4/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose

# 国内用户可以使用以下方式加快下载
 curl -L https://download.fastgit.org/docker/compose/releases/download/1.27.4/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose

 chmod +x /usr/local/bin/docker-compose
```



## docker 常用命令

``` shel
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
```

#### docker 实战wordpress

```shell
version: "3"
services:

   db:
     image: mysql:8.0
     command:
      - --default_authentication_plugin=mysql_native_password
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
     volumes:
       - db_data:/var/lib/mysql
     restart: always
     environment:
       MYSQL_ROOT_PASSWORD: 123456
       MYSQL_DATABASE: wordpress
       MYSQL_USER: wordpress
       MYSQL_PASSWORD: wordpress

   wordpress:
     depends_on:
       - db
     image: wordpress:latest
     ports:
       - "8000:80"
     restart: always
     volumes:
       - wp_data:/var/www/html
     environment:
       WORDPRESS_DB_HOST: db:3306
       WORDPRESS_DB_USER: wordpress
       WORDPRESS_DB_PASSWORD: wordpress
   nginx:
     depends_on:
       - wordpress
     image: nginx:latest
     ports:
       - "80:80"
       - "443:443"
     restart: always
     volumes:
       - ng_data:/etc/nginx
volumes:
    db_data:
    ng_data:
    wp_data:
```

```sh
docker-compose up -d
#后台执行
```
