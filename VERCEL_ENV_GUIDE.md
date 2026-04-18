# Vercel 环境变量配置指南

## 已修复的问题
已将 CodeBuddy API 替换为 **OpenAI 兼容 API**，现在支持：
- OpenAI (GPT-4, GPT-4o, GPT-3.5)
- Claude (通过 OpenRouter 等兼容层)
- 任何支持 OpenAI 格式的 AI 服务

---

## 需要添加的环境变量

在 Vercel 项目 Settings → Environment Variables 中添加：

### 1. OPENAI_API_KEY (必填)
```
值: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**获取方式：**
1. 打开 https://platform.openai.com/api-keys
2. 登录/注册 OpenAI 账号
3. 点击 "Create new secret key"
4. 复制生成的 API Key

### 2. OPENAI_API_BASE_URL (可选)
```
值: https://api.openai.com/v1
```

如果你想使用 Claude 或其他模型，可以使用 OpenRouter：
```
值: https://openrouter.ai/api/v1
```

### 3. OPENAI_MODEL (可选)
```
值: gpt-4o
```

常用模型：
- `gpt-4o` - OpenAI 最新模型（推荐）
- `gpt-4o-mini` - 轻量级版本
- `claude-3-5-sonnet-20241022` - Claude 3.5 (通过 OpenRouter)
- `claude-3-5-haiku-20241022` - Claude 3.5 Haiku (通过 OpenRouter)

---

## 操作步骤

### 1. 打开 Vercel 项目设置

访问 https://vercel.com/dashboard
→ 选择 `news-agent` 项目
→ 点击 **Settings**

### 2. 添加环境变量

左侧菜单点击 **Environment Variables**

点击 **Add New** 添加以下变量：

| Name | Value | Environments |
|------|-------|--------------|
| `OPENAI_API_KEY` | `sk-你的密钥` | Production, Preview, Development |
| `OPENAI_API_BASE_URL` | `https://api.openai.com/v1` | Production, Preview, Development |
| `OPENAI_MODEL` | `gpt-4o` | Production, Preview, Development |

### 3. 部署

添加后会自动重新部署，或手动点击 **Redeploy**

---

## 使用 Claude API (可选)

如果你想使用 Claude 而不是 OpenAI：

1. 注册 OpenRouter: https://openrouter.ai
2. 获取 API Key
3. 设置环境变量：

| Name | Value |
|------|-------|
| `OPENAI_API_KEY` | `sk-or-xxxxx你的OpenRouter密钥` |
| `OPENAI_API_BASE_URL` | `https://openrouter.ai/api/v1` |
| `OPENAI_MODEL` | `anthropic/claude-3.5-sonnet` |

---

## 验证是否生效

1. 访问部署的网站
2. 进入设置页面
3. 如果显示 "API Key 已配置"，说明配置成功
4. 发送消息测试
