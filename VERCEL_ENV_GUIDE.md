# Vercel 环境变量配置指南

## 支持的免费/低成本 AI 提供商

| 提供商 | 免费模型 | 获取方式 |
|--------|----------|----------|
| **Groq** | Llama 3.3 70B, Mixtral 8x7B, Gemma 2 9B | https://console.groq.com |
| **Gemini** | Gemini 1.5 Flash, Gemini 2.0 Flash | https://aistudio.google.com |
| **DeepSeek** | DeepSeek V3 | https://platform.deepseek.com |
| OpenRouter | Claude, GPT-4, 多种模型 | https://openrouter.ai |
| Together AI | Llama 3 70B | https://api.together.xyz |

---

## 推荐：使用 Groq（完全免费）

### 1. 获取 Groq API Key

1. 访问 https://console.groq.com
2. 注册/登录账号
3. 点击左侧 **API Keys**
4. 点击 **Create API Key**
5. 复制密钥

### 2. 在 Vercel 中配置

在 Vercel Settings → Environment Variables 添加：

| Name | Value |
|------|-------|
| `GROQ_API_KEY` | `gsk_xxxxxxxxxxxx` |

---

## 其他提供商配置

### Gemini (Google)

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | 你的 Gemini API Key |

获取地址: https://aistudio.google.com/app/apikey

### DeepSeek

| Name | Value |
|------|-------|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key |

获取地址: https://platform.deepseek.com

### OpenRouter

| Name | Value |
|------|-------|
| `OPENROUTER_API_KEY` | 你的 OpenRouter API Key |

获取地址: https://openrouter.ai/keys

---

## 操作步骤

1. 打开 https://vercel.com/dashboard
2. 选择 `news-agent` 项目
3. 点击 **Settings**
4. 左侧菜单点击 **Environment Variables**
5. 点击 **Add New**
6. 添加对应的环境变量
7. 保存后自动部署

---

## 本地开发

复制 `.env.example` 为 `.env.local` 并填入你的 API Key：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
GROQ_API_KEY=gsk_your_key_here
```

---

## 验证配置

1. 访问网站
2. 进入设置页面
3. 选择 **Groq** 提供商
4. 点击模型（如 Llama 3.3 70B）
5. 发送消息测试
