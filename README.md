# News Agent - AI 新闻助手

基于记者人格的新闻生产流程智能代理助手，支持新闻稿撰写、采访提纲生成、录音转录等采编功能。

## 功能特性

- 🤖 **AI 对话** - 基于意图分类的记者人格助手
- 📝 **新闻工具台** - 采访提纲、新闻稿、标题生成等专业工具
- 🎨 **AI 生图** - 基于腾讯混元大模型的图像生成（需配置 API Key）
- 🔊 **录音转录** - 自动整理录音内容
- 📱 **响应式设计** - 支持深色模式

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# CodeBuddy API Key（必需）
CODEBUDDY_API_KEY=your_codebuddy_api_key

# 腾讯混元生图 API Key（可选，用于生图功能）
HUNYUAN_API_KEY=your_hunyuan_api_key

# 服务器端口（可选，默认 3000）
PORT=3000
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到云服务器

### 使用 Docker（推荐）

```bash
# 构建镜像
docker build -t news-agent .

# 运行容器
docker run -d -p 3000:3000 \
  -e CODEBUDDY_API_KEY=your_api_key \
  -v $(pwd)/data:/app/data \
  news-agent
```

### 使用 Docker Compose

```bash
docker-compose up -d
```

## 项目结构

```
news-agent/
├── server/           # 后端服务
│   ├── index.ts      # Express 服务器
│   ├── db.ts         # 数据库操作
│   └── types.ts      # 类型定义
├── src/              # 前端应用
│   ├── components/   # React 组件
│   ├── pages/        # 页面组件
│   ├── hooks/        # 自定义 Hooks
│   └── utils/        # 工具函数
├── data/             # SQLite 数据库存储
└── dist/             # 构建输出
```

## 获取 API Key

### CodeBuddy API Key

1. 访问 [CodeBuddy](https://codebuddy.ai)
2. 登录后进入设置页面
3. 创建新的 API Key

### 腾讯混元生图 API Key

1. 访问 [腾讯云控制台](https://cloud.tencent.com)
2. 搜索"混元生图"服务
3. 创建 API Key

## 技术栈

- **前端**: React 18 + TypeScript + Vite + TDesign + TailwindCSS
- **后端**: Node.js + Express + TypeScript
- **数据库**: SQLite（better-sqlite3）
- **AI**: CodeBuddy Agent SDK

## License

MIT
