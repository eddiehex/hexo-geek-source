---
title: git 知识
date: 2023-11-01
categories: 
  - Git
tags: [git, tutorial]
toc: true
excerpt: "Master Git with this comprehensive guide. Learn the basics of version control, how to set up and use Git, and best practices for managing your code repositories efficiently."
---
## git环境配置
```shell
ssh -T git@github.com
--首先配置config
git config --global user.name "your name"
git config --global user.email "your_email@youremail.com"

git config --global credential.helper store
git pull /git push 
```
> **caution** git 密码目前不能使用只能使用口令

## 推送文件

```shell
# 推文件
git init
git add . / 任意文件/文件夹（但必须非空）
git commit -m "    "
git remote add origin git@github.com:yourName/yourRepo.git
git push origin master
```
## 删除文件
```shell
-- 删文件
rm file --先将文件删除
git status --查看状态
# 如果文件是误删 可以通过版本进行恢复
git checkout
# 如果需要将远程删除
git rm file.name
git commit -m ""
git push origin master
```



## 拉文件
```shell
git clone repo.addr
git pull repo.addr
```

