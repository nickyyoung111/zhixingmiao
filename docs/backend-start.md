# 后端前置启动说明

这一阶段已经从数据库与 Prisma schema 前置准备，推进到 NestJS API 骨架。当前目标是让 Web MVP 先具备一条可落库的游客任务闭环，再逐步替换 localStorage mock。

## 已新增文件

- `docker-compose.yml`：本地 PostgreSQL 16 + Redis 7。
- `.env.example`：后端开发所需环境变量样例。
- `prisma/schema.prisma`：基于当前前端模型整理的 PostgreSQL schema 初稿。
- `prisma.config.ts`：Prisma 7 配置，负责读取 `.env` 中的 `DATABASE_URL`。
- `prisma/migrations/20260515142244_init/migration.sql`：已应用到本地 PostgreSQL 的初始迁移。
- `docs/backend-api-draft.md`：users、tasks、goals、moods、habits、manor、evidence_records 的 API 草案。
- `server/src`：NestJS API 骨架，已实现游客会话、当前用户、今日任务和完成任务接口。
- `tsconfig.server.json`：后端 TypeScript 检查配置。

## 本地数据库启动

复制环境变量：

```powershell
Copy-Item .env.example .env
```

启动 PostgreSQL 和 Redis：

```powershell
docker compose up -d
```

检查服务状态：

```powershell
docker compose ps
```

停止服务：

```powershell
docker compose down
```

清空本地数据库卷：

```powershell
docker compose down -v
```

## Prisma 命令

Prisma 依赖已安装，当前使用 Prisma 7.x。schema 已通过 `prisma format` 和 `prisma validate`，初始迁移已生成并应用。

常用命令：

```powershell
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
```

## NestJS API 启动

启动后端开发服务：

```powershell
npm run server:dev
```

一次性启动后端：

```powershell
npm run server:start
```

类型检查：

```powershell
npm run server:check
```

当前基础路径：

```text
http://localhost:3001/api/v1
```

## 前端连接后端

默认前端仍使用 localStorage mock 数据。若要让首页游客任务闭环连接 NestJS 后端，在 `.env` 中设置：

```powershell
VITE_API_MODE="backend"
VITE_API_BASE_URL="http://localhost:3001/api/v1"
```

然后分别启动后端和前端：

```powershell
npm run server:dev
npm run dev
```

当前已接入真实后端的前端动作：

- 游客体验/模拟登录：调用 `/auth/guest`，保存 `guest:<userId>`。
- 页面刷新：若本地存在游客 token，调用 `/me` 和 `/tasks/today` 恢复会话。
- 今日任务新增：调用 `/tasks`，把自定义任务保存到数据库。
- 今日任务完成：调用 `/tasks/:id/complete`，同步用户资产、任务状态和成长证据。
- 今日任务取消完成：调用 `/tasks/:id/reopen`，把任务放回今日清单。
- 三喵对话：调用 `/ai/chat`，后端按内容路由到知行喵、鼓励喵或安慰喵；未配置模型 Key 时自动回退到安全兜底回复。
- 个人中心设置：调用 `/me/preferences`，同步动效、轻陪伴和 AI provider 偏好。

尚未接入真实后端的动作仍走前端本地状态，例如情绪打卡、庄园兑换、探索页目标/习惯等。

已实现接口：

| Method  | Path                         | 用途                                              |
| ------- | ---------------------------- | ------------------------------------------------- |
| `POST`  | `/api/v1/auth/guest`         | 创建或恢复游客会话，并为新用户生成今日默认任务    |
| `GET`   | `/api/v1/me`                 | 获取当前游客用户与偏好                            |
| `PATCH` | `/api/v1/me/preferences`     | 更新当前游客用户偏好                              |
| `GET`   | `/api/v1/tasks/today`        | 获取今日任务                                      |
| `POST`  | `/api/v1/tasks`              | 创建今日任务                                      |
| `PATCH` | `/api/v1/tasks/:id`          | 编辑任务标题、领域、能量、日期标签或完成状态      |
| `POST`  | `/api/v1/tasks/:id/complete` | 完成任务，增加 XP、小鱼干、亲密度，并生成成长证据 |
| `POST`  | `/api/v1/tasks/:id/reopen`   | 取消完成任务，不撤回历史奖励                      |
| `POST`  | `/api/v1/ai/chat`            | 三喵 AI 对话路由，支持 Mock/DeepSeek/通义千问兜底 |

游客接口会返回临时 token：

```json
{
  "tokenType": "guest",
  "accessToken": "guest:<userId>"
}
```

后续请求先使用：

```text
Authorization: Bearer guest:<userId>
```

## AI 大模型配置

前端的 AI provider 仍在个人中心切换，真实调用统一由后端完成，避免 API Key 暴露在浏览器里。

```powershell
AI_PROVIDER="mock"
DEEPSEEK_API_KEY=""
QWEN_API_KEY=""
```

当前策略：

- `mock`：只使用后端关键词路由与安全兜底回复。
- `deepseek`：配置 `DEEPSEEK_API_KEY` 后，请求 DeepSeek OpenAI-compatible chat 接口。
- `qwen`：配置 `QWEN_API_KEY` 后，请求通义千问 DashScope compatible-mode chat 接口。
- 若 Key 未配置、接口失败或命中危机词，后端会回退到安全回复，不让页面中断。

当前还加入了免费额度控制，额度按游客用户、自然日和额度档位写入 PostgreSQL 的 `ai_usage_logs` 表。MVP 默认规则：

- 标准 AI 对话：20 次/天。
- 详细分析：5 次/天。
- DeepSeek Reasoner 深度思考：3 次/天。

个人中心可以切换 AI 提供方、DeepSeek Chat / DeepSeek Reasoner 模型，以及简洁陪伴 / 详细分析回复模式。每次真实模型调用会记录 provider、model、responseMode、quotaTier、成功/失败/超额状态、输入字符数和输出字符数。后续正式发布前，建议继续加入用户套餐、账单监控、后台配置和更精确的 token 统计。

## 设计说明

- 数据库仍使用 PostgreSQL。
- `Json` 字段用于 AI 拆解结果、后续周目标等半结构化数据。
- 当前前端的 number ID 是原型实现；后端 schema 已按 `uuid` 设计。
- `mockApi` 已返回 `ApiResponse<T>`，后续可以新增 `httpApi` 并复用同一方法命名。
- Redis 暂时只预留给会话、缓存、排行榜和 Bull 队列。

## 下一步建议

1. 为首页任务增加编辑入口，接入已实现的 `PATCH /tasks/:id`。
2. 再逐步接入 goals、moods、habits、manor、evidence_records。
