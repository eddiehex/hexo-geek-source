---
title: wordpress容器化部署
date: 2023-11-01
categories: 
  - Docker
tags: [wordpress, docker]
toc: true
excerpt: "Learn how to deploy WordPress using containerization. This guide provides step-by-step instructions for setting up and deploying WordPress with Docker, ensuring a scalable and efficient deployment process."
---

## 前记

早在大学期间就有接触过wordpress这个软件，当时纯粹是因为手头的vps仅仅是挂个代理有点没能做到物尽其用，便在网上各种搜寻，想着利用vps整点有意思的东西。不过当时通过wordpress搭建个人还是建非常繁琐的事情，啥啥不干就得下四个软件，中间各种配置连接测试令人头大；这两天闲来无事，便又开始捣鼓起了手上的vps，再加上最近docker成风，就寻思能否利用docker来进行搭建，一来docker独立于服务器中，不受环境影响，也不影响环境；二来docker的镜像安装卸载及其方便几条命令就能解决；三来也能学习学习。

## 正文

1. Docker环境的搭建

```shell
curl -fsSL https://get.docker.com | bash -s docker  #安装
systemctl start docker #启动docker
docker run hello-world #测试是否成功安装
```

docker 架构主要包括三个部分 镜像、仓库、容器；其中镜像可以理解成一个个root文件系统；容器就是运行镜像的一个载体，可以无限删除重建极为方便；仓库可以简单理解为镜像商店，可以从中pull各种镜像。

2. mysql安装

```shell
docker pull mysql #下载最新版mysql镜像
docker run -d --name mysql -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 mysql #运行mysql镜像
```

`-d 容器后台运行，否则运行完将直接退出`

`--name 容器定义别名 `

`-e 配置环境，新版mysql不设定root密码无法安装`

3. wordpress 安装

``` shell
docker pull wordpress
docker run --name wordpress --link mysql:mysql -d -p 8080:80 wordpress
```

`--link 因为容器和容器之间都是独立，link为连个容器创造连接`

到这通过 xxxx.xxx.xx.x:8080 便可登陆wordpress后台，但个人博客怎么能没有域名了，能通过域名进行访问的博客才是合格的

4.ngnix 安装反向代理

```shell
# ngnix 安装
docker pull nginx
docker run --name nginx --link wordpress:wordpress -p 80:80 -d nginx
```

```shell
# ngnix 配置
# 新建一个 xxx.conf
touch vhost.conf
vi vhost.conf
server {
  listen 80;
  listen [::]:80;

  # 域名
  server_name www.kygoho.win;

  location / {
    ## 定位到wordpress
    proxy_pass http://wordpress;

        proxy_http_version    1.1;
        proxy_cache_bypass    $http_upgrade;

        proxy_set_header Upgrade            $http_upgrade;
        proxy_set_header Connection         "upgrade";
        proxy_set_header Host                $host;
        proxy_set_header X-Real-IP            $remote_addr;
        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto    $scheme;
        proxy_set_header X-Forwarded-Host    $host;
        proxy_set_header X-Forwarded-Port    $server_port;
  }
}

```

```shell
# 将vhost.conf 拷贝至 nginx 容器 /etc/ngnix/conf.d/ 目录下
docker cp vhost.conf blog_nginx_1:/etc/nginx/conf.d
# 重启ngnix
docker restart blog_nginx_1
```



完成这一步稍等几分钟正常通过域名即可访问wordpress了。

## 后记&思考

```shell
docker exec -i -t ngnix bash #这条命令可以直接进入ngnix容器中，查看ngnix的各项内容
docker ps #查看容器状态
docker ps -a
docker images #查看镜像
dockeer run -v #挂在容器到本地文件夹 我还没用过
```

1. 在ngnix代理这一块一开始想着因为wordpress有映射到本地端口8080，所以在映射时直接转proxy_pass http://本地ip：8080，但发现不行。即域名访问80端口——ngnix——8080端口实现域名访问wordpress
2. 通过查找资料发现可以连接ngnix和wordpress两个容器，再通过配置实现域名直接访问。

docker 的link相关问题还需继续学习；

ngnix还要再学习！

> [从0使用docker搭建wordpress](https://mhy12345.xyz/tutorials/wordpress-tutorials/)
>
> [docker教程](https://www.runoob.com/docker/docker-architecture.html)
>
> [小白学习docker](https://juejin.cn/post/6844904117165359111)
>
> [使用docker搭建WordPress博客系统并配置HTTPS](https://leozl.site/linux/%E4%BD%BF%E7%94%A8docker%E6%90%AD%E5%BB%BAwordpress%E5%8D%9A%E5%AE%A2%E7%B3%BB%E7%BB%9F%E5%B9%B6%E9%85%8D%E7%BD%AEhttps/)
