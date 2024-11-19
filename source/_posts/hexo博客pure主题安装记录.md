---
title: hexo博客pure主题安装记录
date: 2023-11-01
categories: 
  - Hexo
tags: [hexo, theme]
toc: true
excerpt: "A detailed guide on installing the Pure theme for your Hexo blog. Follow these step-by-step instructions to customize and enhance your Hexo blog with the Pure theme."
---

## hexo插件安装

其实在dockerfile定制安装了一部分插件，但由于当时使用的教程和目前使用的主题不一致故导致部分插件未能安装。

- hexo-wordcount 文章数字计算
- hexo-generator-json-content 内部搜索

安装代码：

```shell
npm install hexo-wordcount --save
npm install hexo-generator-json-content --save
```

> 需要注意的是安装路径需在博客文件根目录下即～/blog/hexo（这个坑一开始我没注意）

## 修改icon和avatar 图像地址

主题中图像都从本地路径加载。

因上传麻烦且占用服务器资源故直接选择图传连接

`avatar: https://od.xxxx.cf/api/raw/?path=/picture/Icon/fish.png`

## 将Links（友链）改为service（服务）

- 处理主题文件夹下的_config.yml文件

```yaml
menu:
  Home: .
  #Archives: archives  # 归档
  Categories: categories  # 分类
  #Tags: tags  # 标签
  #Repository: repository  # github repositories
  #Books: books  # 豆瓣书单
  Services: links  # Links 改成Service
  About: about  # 关于

# Enable/Disable menu icons
menu_icons:
  enable: true  # 是否启用导航菜单图标
  home: icon-home-fill
  archives: icon-archives-fill
  categories: icon-folder
  tags: icon-tags
  repository: icon-project
  #books: icon-book-fill
  services: icon-project
  about: icon-book-fill
```

- 修改links index.md 路径：～/blog/hexo/source/links/index.md

```markdown
---
title: 服务
layout: links
comments: true
sidebar: none
---
```

- 修改语言文件

```yaml
Services: 服务
links-desc: 服务描述
```

## 删除文章版权信息

修改layout/_partial/post/copyright.ejs 文件

- 添加 `style="display: none;"`
- 修改条件判断`if(theme.profile && theme.profile.articleSelfBlock)`

## 关闭评论板块

修改_config.yml文件 将type 改成 false

```yaml
comment:
  type: false  # 启用哪种评论系统
```

## 文章目录开启

根据sidebar.ejs的判断语句:

```ejs
if (!index && theme.config.toc && post.toc)
```

我们可以看出需要满足三个条件:

- 不是index文件

- 主题config toc 需要开启为true

- post toc 需为true 即需要在每篇文章开头

  ``` markdown
  ---
  title: hexo博客pure主题安装记录
  categories: code
  tags: hexo
  toc: true #这个
  ---
  ```

## 添加服务

在source/_data/links.yml中按照格式添加即可

```yaml
Jupyter:
  link: https://hexo.kygoho.win/py
  avatar: /images/favatar/chuangzaoshi-logo.png
  desc: jupyter-notebook

Monitor:
  link: https://cloud.kygoho.win/
  avatar: https://od.wadaho.cf/api/raw/?path=/picture/Icon/star.png
  desc: service monitor panel

RSS:
  link: https://rss.009100.xyz
  avatar: https://od.wadaho.cf/api/raw/?path=/picture/Icon/read.png
  desc: RSS online reader
```



