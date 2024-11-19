---
title: 如何编写简易登陆脚本&&安装iterm2和oh-my-zsh&&配置oh-my-zsh
date: 2023-11-01
categories: 
  - Linux
tags: [iterm2, oh-my-zsh, zsh]
toc: true
excerpt: "Learn how to write a simple login script, install iTerm2 and oh-my-zsh, and configure oh-my-zsh. This guide provides step-by-step instructions for setting up a powerful and customized terminal environment."
---

最近看了几篇推荐mac软件的文章，其中多少有提到了iterm2再加上mac自带的终端相对有些局限就开始捣鼓iterm2和oh-my-zsh；

#### 安装iterm2和oh-my-zsh

- 安装iterm2

搜索并直接下载

- 安装oh-my-zsh

``` shell
#查看当前环境shell
echo $SHELL
#查看系统自带shell
cat /etc/shells
#安装zsh
yum install zsh # CentOS
brew install zsh # mac安装
#将zsh设置默认
chsh -s /bin/zsh # CentOS
# Mac如下
# 在 /etc/shells 文件中加入如下一行
/usr/local/bin/zsh
# 接着运行
chsh -s /usr/local/bin/zsh
```

``` shell
#安装oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)" #curl
sh -c "$(wget https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh -O -)" #wget
```

```shell
#在安装oh-my-zsh时会受到网络因素影响，故应先设置iterm2代理
export http_proxy=http://127.0.0.1:1087
export https_proxy=$http_proxy
#关闭
unset http_proxy https_proxy
#在安装zsh后也可以写入.zshrc中
alias goproxy='export http_proxy=http://127.0.0.1:1087 https_proxy=http://127.0.0.1:1087'
alias disproxy='unset http_proxy https_proxy'
#测试方式
curl cip.cc
```



- 配置zsh

zsh的配置文件为.zshrc 路径为 ``` ~/.zshrc ``` 文件中可进行主题、环境变量、alias修改

不过zsh的配置尽量在  ```  ~/.oh-my-zsh/custom/example.zsh  ``` 中进行修改

``` shell
#快速编辑配置文件
alias zshconfig="vim ~/.oh-my-zsh/custom/example.zsh"
#配置主文件夹bin的环境变量
export PATH=~/bin:"$PATH"
#启动配置文件
source ~/.oh-my-zsh/custom/example.zsh
```

#### 编写简易登陆脚本

上一次学会了如何设置ssh私钥登陆，但是每一次都要复制登陆命令，整个行为极度繁琐，索性就想学习制作一个简易脚本可以直接登陆；

- 编写shell文件

``` shell
#在主文件夹中创建一个文件夹bin 并创建一个文件 lg.sh ,并写入脚本
mkdir bin
touch lg.sh
vim lg.sh
```

```shell
#登陆脚本
#!/bin/bash
echo "1) hk server"
echo "2) jp_gigs server"
echo "3) jp_bwg server"
echo "please input your choice:"
read num
if test $num -eq 1
        then ssh root@121.xxx.xxx.96 -i /Users/eddieho/hx_for_hob/ssa/hk666
elif test $num -eq 2
	then ssh root@103.xxx.xxx.96 -i /Users/eddieho/hx_for_hob/ssa/gigs_jp
else ssh root@206.xxx.xxx.205 -p 26838 -i /Users/eddieho/hx_for_hob/ssa/bwg_jp
fi
```

- 为shell文件授予执行权限，并添加环境变量

``` shell
chmod +x ./lg.sh
# 正常文件路径下可以直接执行，但想要全局的话就得增加环境变量
# vshconfgi -- 最后添加下面这条命令
export PATH=~/bin:"$PATH"
```

这样就可直接用命令进行登陆了！！
