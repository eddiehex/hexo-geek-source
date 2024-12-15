---
title: Automate to Create a New Post Template
date: 2024-12-13
categories:
  - Shell
tags: [Shell,markdown]
toc: false
excerpt: "Use Shell script to automately create a new post template containing the meta information."
---

好的，这是一个可以创建 Markdown 文档模板的 Shell 脚本：

```bash
#!/bin/bash

# 检查是否提供了文件名参数
if [ -z "$1" ]; then
  echo "用法: $0 <文件名>"
  exit 1
fi

name="$1"
current_date=$(date +%Y-%m-%d)

cat << EOF > "$name".md
---
title: $name
date: $current_date
categories:
  - {optional}
tags: [{optional}]
toc: true
excerpt: "{optional}"
---
EOF

echo "已创建文件: $name.md"
```

**脚本解释:**

1.  `#!/bin/bash`:  指定脚本使用 Bash 解释器执行。
2.  `if [ -z "$1" ]; then ... fi`: 检查是否提供了文件名参数。 `$1` 代表脚本的第一个参数，`-z` 用于检查字符串是否为空。 如果没有参数，则输出用法信息并退出。
3.  `name="$1"`: 将第一个参数赋值给变量 `name`。
4.  `current_date=$(date +%Y-%m-%d)`: 使用 `date` 命令获取当前日期，并格式化为 `YYYY-MM-dd`，然后赋值给变量 `current_date`。
5.  `cat << EOF > "$name".md ... EOF`:  使用 `cat` 命令和 Here 文档 (`<< EOF ... EOF`) 将多行文本输出到以 `name` 变量命名的 `.md` 文件中。
6.  `echo "已创建文件: $name.md"`: 输出一个确认信息，告知用户文件已创建。

**如何使用:**

1.  **保存脚本:** 将上面的代码保存为一个文件，例如 `create_md.sh`。
2.  **添加执行权限:** 使用命令 `chmod +x create_md.sh` 为脚本添加执行权限。
3.  **运行脚本:** 在终端中，使用以下命令运行脚本，并将要创建的 Markdown 文件名作为参数：

    ```bash
    ./create_md.sh my-new-document
    ```

    这将会创建一个名为 `my-new-document.md` 的文件，其中包含预定义的元数据。

**示例输出:**

如果执行命令 `./create_md.sh my-blog-post`，将会生成一个名为 `my-blog-post.md` 的文件，内容如下：

```markdown
---
title: my-blog-post
date: 2023-10-27
categories:
  - {optional}
tags: [{optional}]
toc: true
excerpt: "{optional}"
---
```

**说明:**

*   `{optional}` 部分是占位符，你需要根据实际情况修改它们。
*   这个脚本创建的文件名会自动添加 `.md` 后缀。
