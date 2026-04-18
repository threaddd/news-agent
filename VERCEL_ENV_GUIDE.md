# Vercel 环境变量配置指南

## 问题原因
"Failed to fetch" 错误是因为前端无法直接调用 CodeBuddy API，存在跨域限制。

## 解决方案
通过 Vercel Serverless Function 作为代理来解决。

---

## 需要添加的环境变量

在 Vercel 项目 Settings → Environment Variables 中添加以下变量：

### 1. CODEBUDDY_API_KEY
```
值: 你的 CodeBuddy API Key
```
**如何获取：**
1. 访问 https://www.codebuddy.ai
2. 登录后进入个人设置
3. 找到 API Keys 部分
4. 创建或复制现有的 API Key

### 2. CODEBUDDY_API_BASE_URL
```
值: https://api.codebuddy.ai/v1
```

---

## 操作步骤

### 方法 1: 通过 Vercel Dashboard（推荐）

1. 打开 https://vercel.com/dashboard
2. 选择你的 `news-agent` 项目
3. 点击顶部的 **Settings**（设置）
4. 左侧菜单找到 **Environment Variables**（环境变量）
5. 点击 **Add New**（添加新变量）

| Name | Value | Environments |
|------|-------|--------------|
| `CODEBUDDY_API_KEY` | `你的API密钥` | Production, Preview, Development |
| `CODEBUDDY_API_BASE_URL` | `https://api.codebuddy.ai/v1` | Production, Preview, Development |

6. 点击 **Save**（保存）

### 方法 2: 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 进入项目目录
cd news-agent

# 添加环境变量
vercel env add CODEBUDDY_API_KEY
vercel env add CODEBUDDY_API_BASE_URL

# 部署
vercel --prod
```

---

## 部署后

1. 添加环境变量后，Vercel 会自动重新部署
2. 或者手动触发：在 Deployments 页面点击 **Redeploy**

---

## 验证是否生效

1. 访问你的 Vercel 部署地址
2. 进入设置页面
3. 如果显示 "API Key 已配置"，说明配置成功
4. 发送一条消息测试

---

## 如果仍然报错

可能是 CodeBuddy 没有公开的 REST API。请联系 CodeBuddy 官方获取正确的 API 使用方式。

或者，如果你有其他 AI 服务的 API Key（如 OpenAI、Claude 等），可以修改代码来支持它们。
