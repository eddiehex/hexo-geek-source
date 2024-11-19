---
title: 修改hexo代码块主题样式
date: 2024-11-20
categories: 
  - css
  - js
tags: [hexo, js, css]
toc: true
excerpt: "The article describes the process of redeploying a Hexo blog and customizing its theme. Issues with code block rendering using the prism library were resolved by removing the hexo-prism-plugin, disabling Hexo's built-in highlighting, and manually integrating prism.js and prism.css. Configuration changes were made in _config.yml and layout.ejs to ensure proper code block display."
---

## 背景
最近在重新部署了Hexo博客，利用`bolt.new`重写了一个主题，整体效果就是现在这个博客的样子。在处理代码块这部分内容时出现了部分问题导致一直不断在重试报错，今天借机做一个小的总结。

## Prism
Prism 是用于语法高亮的 JavaScript 库。它主要用于在网页上以一种美观和易读的方式显示代码段。起初在引入`prism`是通过hexo插件`hexo-prism-plugin`来处理的，代码实现是：
- 安装
```shell
npm install hexo-prism-plugin --save
```
- 使用
配置`_config.yml`文件
```yaml
prism_plugin:
  mode: 'preprocess'    # realtime/preprocess
  theme: 'tomorrow'
  line_number: true    # default false
```
但这样配置完会出现花括号渲染成转义符号。

现在的解决方案是：
- 删除`hexo-prism-plugin`从`package.json`
- 修改`_config.yml`文件
    ```yaml
     # prism_plugin:
     #   mode: 'preprocess'    # realtime/preprocess
     #   # theme: 'tomorrow'
     #   line_number: true    # default false
     highlight:
     enable: false

     prismjs:
     enable: true
     line_number: true
    ```
- 增加`prism.js`文件和`prism.css`文件
    可从网站上进行下载
    [js](https://prismjs.com/download.html#themes=prism-coy&languages=markup+css+clike+javascript)
    [css](https://raw.githubusercontent.com/PrismJS/prism-themes/refs/heads/master/themes/prism-duotone-forest.css)

- 修改`layout.ejs`文件
    ```ejs
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <title><%= config.title %></title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/prism-code.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="icon" href="https://od.009100.xyz/api/raw/?path=/picture/Icon/shark.png" type="image/x-icon">
    </head>
    <body>
    <header>
    </header>

    <main>
    </main>

    <footer>
        <p>&copy; 2024 <%= config.title %></p>
    </footer>

    <script src="/js/search.js"></script>
    <script src="/js/main.js"></script>
    <script src="/js/copy-code.js"></script>
    <script src="/js/prism.js"></script>

    </body>
    </html>
    ```

