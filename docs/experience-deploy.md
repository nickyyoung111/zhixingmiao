# 知行喵体验版上线部署方案

这份文档用于把知行喵部署成一个别人可以通过网址完整体验的版本。

体验版目标：

- 用户可以打开一个公网前端网址。
- 可以使用游客体验进入产品。
- 首页任务、情绪打卡、三喵陪伴、成长庄园等核心功能可用。
- 后端数据保存到云端 PostgreSQL。
- AI Key 只放在后端部署平台，不暴露到前端或 GitHub。

推荐方案：

```text
前端：Vercel
后端：Render
数据库：Neon PostgreSQL
AI：DeepSeek API Key
```

最终结构：

```text
用户浏览器
  -> https://你的前端域名.vercel.app
  -> https://你的后端域名.onrender.com/api/v1
  -> Neon PostgreSQL
  -> DeepSeek API
```

## 1. 上线前安全检查

### 1.1 确认不要上传 .env

在项目根目录 `zhixing-miao-web` 确认 `.gitignore` 至少包含：

```gitignore
.env
.env.*
node_modules
dist
```

如果 `.env` 已经被提交到 GitHub，立刻做两件事：

1. 去 DeepSeek 后台重置 API Key。
2. 修改数据库密码或重新创建数据库连接串。

### 1.2 重新生成 DeepSeek Key

本地 `.env` 里的 Key 不要直接用于线上。上线前建议重新生成一个新的 Key，只填到 Render 环境变量里。

前端永远不要配置 `DEEPSEEK_API_KEY`。

## 2. 本地最终检查

在 `zhixing-miao-web` 目录运行：

```bash
npm install
npm run server:check
npm run build
```

两个检查都通过后再部署。

## 3. 创建云数据库 Neon

1. 打开 Neon：`https://neon.tech`
2. 新建 Project。
3. 创建 PostgreSQL 数据库。
4. 复制连接串，格式类似：

```text
postgresql://user:password@host/dbname?sslmode=require
```

后面 Render 的 `DATABASE_URL` 就填这个。

## 4. 部署后端到 Render

### 4.1 创建 Web Service

1. 打开 Render：`https://render.com`
2. New -> Web Service。
3. 连接 GitHub 仓库。
4. Root Directory 填：

```text
zhixing-miao-web
```

如果你的 GitHub 仓库根目录本身就是 `zhixing-miao-web`，Root Directory 可以留空。

### 4.2 Render 构建配置

Build Command：

```bash
npm install && npx prisma migrate deploy
```

Start Command：

```bash
npm run server:start
```

Environment：

```text
Node
```

### 4.3 Render 环境变量

在 Render 的 Environment Variables 中添加：

```env
DATABASE_URL=你的 Neon PostgreSQL 连接串
FRONTEND_ORIGIN=https://你的前端域名.vercel.app
JWT_ACCESS_SECRET=换成一串至少32位的随机字符串
JWT_REFRESH_SECRET=换成另一串至少32位的随机字符串
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的新 DeepSeek Key
QWEN_API_KEY=
NODE_VERSION=22
```

说明：Render 会自动注入 `PORT`，后端会优先读取 `PORT`。`API_PORT=3001` 只建议本地开发使用，Render 上不用填写。

如果前端还没部署，`FRONTEND_ORIGIN` 可以先填一个占位值，等 Vercel 前端部署完成后再回来改。

示例：

```env
FRONTEND_ORIGIN=https://zhixing-miao.vercel.app
```

### 4.4 验证后端

Render 部署成功后会得到一个地址，例如：

```text
https://zhixing-miao-api.onrender.com
```

API Base URL 是：

```text
https://zhixing-miao-api.onrender.com/api/v1
```

用浏览器打开：

```text
https://zhixing-miao-api.onrender.com/api/v1
```

根路径可能返回 404，这是正常的。真正要测试接口可以用 PowerShell：

先测试健康检查：

```powershell
Invoke-RestMethod -Method Get -Uri 'https://你的后端域名.onrender.com/api/v1/health'
```

再测试游客会话：

```powershell
Invoke-RestMethod -Method Post -Uri 'https://你的后端域名.onrender.com/api/v1/auth/guest' -ContentType 'application/json' -Body '{"deviceId":"deploy-check"}'
```

如果两个接口都返回 `ok: true`，说明后端、数据库和基础路由基本连通。

## 5. 部署前端到 Vercel

### 5.1 创建 Vercel Project

1. 打开 Vercel：`https://vercel.com`
2. Add New -> Project。
3. 选择 GitHub 仓库。
4. Framework Preset 选择 `Vite`。
5. Root Directory 填：

```text
zhixing-miao-web
```

如果仓库根目录就是 `zhixing-miao-web`，Root Directory 可以留空。

### 5.2 Vercel 构建配置

Build Command：

```bash
npm run build
```

Output Directory：

```text
dist
```

Install Command：

```bash
npm install
```

### 5.3 Vercel 环境变量

在 Vercel 的 Environment Variables 中添加：

```env
VITE_API_MODE=backend
VITE_API_BASE_URL=https://你的后端域名.onrender.com/api/v1
```

示例：

```env
VITE_API_BASE_URL=https://zhixing-miao-api.onrender.com/api/v1
```

注意：修改 Vercel 环境变量后，需要重新部署一次前端。

## 6. 回填后端 CORS

Vercel 部署完成后，会得到前端地址，例如：

```text
https://zhixing-miao.vercel.app
```

回到 Render 后端服务，把环境变量改成真实前端地址：

```env
FRONTEND_ORIGIN=https://zhixing-miao.vercel.app
```

保存后重新部署/重启后端。

如果不做这一步，浏览器可能报 CORS 错误，表现为前端页面能打开，但游客登录或 API 请求失败。

## 7. 公网验收清单

用无痕窗口或手机流量打开 Vercel 前端网址，完整检查：

- 登录页正常显示，不是纯 HTML 默认样式。
- 点击“游客体验”可以进入首页。
- 首页任务正常显示。
- 情绪小站可以点击“焦虑 / 难过 / 开心”等状态。
- 情绪响应卡片会变化。
- “现在优先做这两步”的推荐行动会变化。
- 右侧知行喵陪伴栏能发送消息。
- 三喵路由能区分：
  - `今天脑子像一团雾，什么都不想动` -> 安慰喵
  - `我准备比赛但不知道从哪开始` -> 知行喵
  - `我刚做完复盘，有点成就感，想再做一点` -> 鼓励喵
- 庄园页可以打开。
- 刷新页面后游客数据仍能从后端恢复。
- 浏览器控制台没有 CORS 或 500 错误。

## 8. 常见问题

### 8.1 前端能打开，但游客体验失败

优先检查：

```env
VITE_API_BASE_URL=https://你的后端域名.onrender.com/api/v1
FRONTEND_ORIGIN=https://你的前端域名.vercel.app
```

还要确认 Render 后端没有休眠或启动失败。

### 8.2 后端启动失败

检查 Render Logs，常见原因：

- `DATABASE_URL` 不正确。
- Neon 数据库没有开启或连接串缺少 `sslmode=require`。
- `npx prisma migrate deploy` 失败。
- Node 版本不兼容。

可以在 Render 环境变量中补充：

```env
NODE_VERSION=24
```

如果 Render 对 Node 24 支持不稳定，也可以先尝试：

```env
NODE_VERSION=22
```

### 8.3 Prisma migrate 失败

本地先确认迁移文件存在：

```text
prisma/migrations
```

然后在本地运行：

```bash
npx prisma validate
```

如果云数据库是空库，Render 构建命令应包含：

```bash
npx prisma migrate deploy
```

### 8.4 AI 没有走 DeepSeek

检查后端环境变量：

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的新 Key
```

也要在前端“我的/偏好”中确认 provider 不是 Mock AI。

如果 DeepSeek 暂时失败，后端会使用三喵风格的安全兜底回复，所以页面仍可体验。

### 8.5 Render 免费服务冷启动

Render 免费服务可能休眠。别人第一次打开时，后端请求可能慢 30 到 60 秒。

体验版可以接受；如果要更稳定，可以升级 Render 或换 Railway/Fly.io/云服务器。

## 9. 可以发给体验者的话术

部署完成并验收通过后，可以这样发：

```text
这是我正在开发的 AI 情感陪伴产品「知行喵」体验版：
https://你的前端域名.vercel.app

目前支持游客体验、情绪打卡、三喵 AI 陪伴、任务拆解和成长庄园。
这是体验版，部分数据、AI 能力和移动端细节还在继续迭代，欢迎试用核心流程并给我反馈。
```

## 10. 后续绑定自定义域名

等体验版稳定后，可以买域名并绑定：

```text
www.zhixingmiao.com -> Vercel 前端
api.zhixingmiao.com -> Render 后端
```

绑定后需要同步修改：

Vercel：

```env
VITE_API_BASE_URL=https://api.zhixingmiao.com/api/v1
```

Render：

```env
FRONTEND_ORIGIN=https://www.zhixingmiao.com
```

然后前后端都重新部署一次。
