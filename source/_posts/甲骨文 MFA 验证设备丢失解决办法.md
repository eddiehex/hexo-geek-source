---
title: 甲骨文MFA验证设备丢失解决办法
date: 2023-11-01
categories: 
  - Others
tags: [MFA, Oracle]
toc: true
excerpt: "Learn how to resolve issues when your Oracle MFA verification device is lost. This guide provides step-by-step solutions to regain access and secure your account."
---

### 背景：

旧手机处理后发现oracle authentictor 忘记迁移，oracle cloud 无法登陆；

### 解决方案：


先进登录页面，然后在输入邮箱和密码页面中记下以`` https://idcs-********.identity.oraclecloud.com/`` 开头的网址

现在修改该 网址，如下所示

``https://idcs-*****.identity.oraclecloud.com/ui/v1/myconsole?root=my-info&my-info=my_profile_security``

在此新网址中，可以禁用 MFA 的选项，或获取绕过代码，或任何可以恢复的此类选项。

> [来源](https://community.oracle.com/customerconnect/discussion/710608/lost-my-access-2fa)

