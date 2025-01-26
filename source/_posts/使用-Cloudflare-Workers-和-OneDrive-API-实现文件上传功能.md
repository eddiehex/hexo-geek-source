---
title: 使用 Cloudflare Workers 和 OneDrive API 实现文件上传功能
date: 2023-11-01
categories: 
  - Javascript
tags: [api, js, cloudflare, onedrive]
toc: true
excerpt: "Learn how to implement file upload functionality using Cloudflare Workers and OneDrive API. This guide provides step-by-step instructions for setting up and integrating these services to enable efficient file uploads."
---



在现代网络应用中，文件上传是一个常见的需求。在本文中，我们将介绍如何使用 Cloudflare Workers 和 OneDrive API 实现一个简单而强大的文件上传功能。我们将创建一个基于 HTML 和 JavaScript 的用户界面，允许用户选择文件并将其上传到 OneDrive 存储中。

> 本文作者：Chat-gpt

## 代码概览

首先，让我们来看一下实现文件上传功能的关键代码。这段代码使用 Cloudflare Workers 提供的 `addEventListener` 函数来监听请求事件，然后调用 `handleRequest` 函数处理请求。

```javascript
// 以下为前文代码，省略部分与 OneDrive API 无关的代码

// 处理 POST 请求
else if (request.method === 'POST') {
  try {
    // 解析上传的文件
    const formData = await request.formData();
    const file = formData.get('file');

    // 获取 OneDrive 访问令牌
    const accessToken = await getAccessToken();

    // 构建 OneDrive API 请求
    const apiUrl = `https://graph.microsoft.com/v1.0/users/eddie@412zml.onmicrosoft.com/drive/root:/Public/picture/blog/${file.name}:/content`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
    };
    const options = {
      method: 'PUT',
      headers: headers,
      body: file,
    };

    // 发送文件到 OneDrive
    const response = await fetch(apiUrl, options);

    if (response.ok) {
      // 返回成功响应
      const jsonResponse = await response.json();
      return new Response(JSON.stringify({ success: true, response: jsonResponse }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // 处理上传失败情况
      console.error('File upload failed:', response.statusText);
      console.error('OneDrive API Error:', await response.json());
      return new Response(JSON.stringify({ success: false, error: response.statusText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    // 处理上传过程中的错误
    console.error('Error uploading file:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 以下为前文代码，省略部分与 OneDrive API 无关的代码
```

上述代码展示了如何使用 OneDrive API 将文件上传到 OneDrive 存储。首先，我们获取用户上传的文件，然后通过 OneDrive API 的 `PUT` 请求将文件上传到指定位置。上传成功后，返回相应的 JSON 数据。

## OneDrive API 访问令牌获取

在上述代码中，我们通过 `getAccessToken` 函数获取 OneDrive API 的访问令牌。以下是获取访问令牌的实现逻辑。

```javascript
async function getAccessToken() {
  // 在这里实现获取 Azure AD 访问令牌的逻辑，使用你的应用程序凭据等信息
  // 返回获取到的访问令牌
  const clientId = 'YOUR_CLIENT_ID'; // 替换为你的应用程序的客户端 ID
  const clientSecret = 'YOUR_CLIENT_SECRET'; // 替换为你的应用程序的客户端密钥
  const tenantId = 'YOUR_TENANT_ID'; // 替换为你的 Azure AD 租户 ID

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const requestBody = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default', // 这个 scope 取决于你的应用程序和所需的权限
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody,
  };

  try {
    const response = await fetch(tokenUrl, options);
    const tokenData = await response.json();

    if (response.ok) {
      const accessToken = tokenData.access_token;
      return accessToken;
    } else {
      throw new Error(`Failed to get access token: ${tokenData.error_description}`);
    }
  } catch (error) {
    throw new Error(`Error getting access token: ${error.message}`);
  }
}
```

在该函数中，我们使用应用程序的客户端 ID、客户端密钥和租户 ID 构建访问令牌请求，然后通过 `fetch` 函数发送请求获取访问令牌。获取到的访问令牌将用于构建 OneDrive API 请求的授权头部。

## 前端界面

用户界面是与用户交互的关键部分。在上面的代码中，我们通过 HTML 和 JavaScript 创建了一个简单的上传界面。用户可以选择文件，然后点击上传按钮。

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 省略部分头部信息和样式 -->
</head>
<body>
  <h1>鲨鱼上传</h1>
  <label for="fileInput" class="custom-file-upload">FILE HERE</label>
  <input type="file" id="fileInput" style="display:none;" />
  <button onclick="uploadFile()">Upload</button>
  <!-- 省略部分界面元素 -->
  <script>
    // 省略部分 JavaScript 代码
  </script>
</body>
</html>
```

在界面中，我们使用了一个简单的表单，包含文件选择框、上传按钮以及一些用于显示上传结果的元素。

## 文件上传逻辑

文件上传逻辑主要由 JavaScript 代码实现。当用户点击上传按钮时，`uploadFile` 函数被调用，该函数负责获取用户选择的文件，构建 OneDrive API 请求，并发送文件到 OneDrive 存储。

```javascript
async function uploadFile() {
  // 省略部分代码
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    const response = await fetch('/', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      //

 处理成功上传的情况
      const data = await response.json();
      const resultUrl = document.getElementById('webUrl');
      const resultName = document.getElementById('fileNamePlaceholder');
      resultUrl.href = data.response.webUrl;
      resultUrl.textContent = data.response.webUrl;
      resultName.textContent = data.response.name;
      // 移除弹跳动画类
      h1Element.classList.remove('bounce-animation');
    } else {
      // 处理上传失败的情况
      console.error('File upload failed:', response.statusText);
    }
  } catch (error) {
    // 处理上传过程中的错误
    console.error('Error uploading file:', error);
  }
}
```

在这个函数中，我们首先创建一个 `FormData` 对象，将用户选择的文件附加到该对象中。然后，使用 `fetch` 函数发送 POST 请求，将文件上传到 Cloudflare Workers。在 Cloudflare Workers 中，我们再次使用 `fetch` 函数将文件传递给 OneDrive API。最终，将上传结果显示在界面上。

## 结语

通过结合 Cloudflare Workers 和 OneDrive API，我们实现了一个简单而有效的文件上传功能。这种方案具有低延迟、高可用性和强大的性能，为用户提供了良好的体验。在实际应用中，你可以根据需要进行扩展，添加更多功能和安全性措施，以满足特定的业务需求。希望本文能够帮助你理解如何使用 Cloudflare Workers 构建强大的文件上传服务。