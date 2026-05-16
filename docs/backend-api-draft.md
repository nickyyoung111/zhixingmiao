# 知行喵后端 API 草案

本草案用于把当前 Web MVP 的 localStorage 数据模型收口成后端接口合同。后续启动 NestJS + Prisma + PostgreSQL 时，优先按这里拆模块，不再让页面直接依赖本地 session 结构。

## 1. 通用约定

基础路径：`/api/v1`

统一响应：

```ts
type ApiResponse<T> = {
  ok: boolean;
  data: T;
  message?: string;
};
```

认证策略：MVP 阶段保留游客会话；后端阶段使用 JWT。前端当前的 `mockApi` 已模拟 REST 适配层返回结构。

ID 策略：前端原型使用 number/string，后端落库统一使用 PostgreSQL `uuid`。接口返回前端可继续使用字符串 ID，迁移时再调整 UI 类型。

时间策略：数据库使用 `timestamptz`，接口使用 ISO string。

## 2. users

对应当前类型：`UserProfile`、`UserPreferences`、`AppSession.user`。

数据库建议：

- `users`: id, openid, nickname, avatar_url, level, xp, fish_coin, intimacy, active_skin_id, streak_days, created_at, updated_at
- `user_preferences`: user_id, motion_enabled, quiet_mode, provider, dark_mode, sound_enabled, updated_at

接口草案：

| Method  | Path              | 用途                                           |
| ------- | ----------------- | ---------------------------------------------- |
| `GET`   | `/me`             | 获取当前用户、偏好、基础资产                   |
| `PATCH` | `/me/preferences` | 更新动效、轻陪伴、AI provider 等偏好（已实现） |
| `POST`  | `/auth/guest`     | 创建或恢复游客会话                             |
| `POST`  | `/auth/wechat`    | 微信扫码登录，后续实现                         |
| `POST`  | `/auth/refresh`   | 刷新 JWT                                       |

`PATCH /me/preferences` 请求：

```json
{
  "motionEnabled": true,
  "quietMode": false,
  "provider": "mock"
}
```

## 3. tasks

对应当前类型：`Task`。

数据库建议：

- `daily_tasks`: id, user_id, goal_id, title, area, energy_level, is_completed, scheduled_date, completed_at, created_at, updated_at

接口草案：

| Method  | Path                  | 用途                                                 |
| ------- | --------------------- | ---------------------------------------------------- |
| `GET`   | `/tasks/today`        | 获取今日任务列表（已实现）                           |
| `POST`  | `/tasks`              | 创建任务，目标拆解、活动加入、习惯计划共用（已实现） |
| `PATCH` | `/tasks/:id`          | 编辑任务标题、能量、日期（已实现）                   |
| `POST`  | `/tasks/:id/complete` | 完成任务，触发小鱼干和成长证据（已实现）             |
| `POST`  | `/tasks/:id/reopen`   | 取消完成，不触发奖励（已实现）                       |
| `PATCH` | `/tasks/reorder`      | 拖拽排序预留                                         |

完成任务响应应返回最新首页所需聚合数据：

```json
{
  "ok": true,
  "data": {
    "task": {},
    "user": {},
    "evidenceRecord": {},
    "catEvent": {
      "persona": "encourage",
      "message": "收到一个行动反馈，小鱼干先记账。"
    }
  }
}
```

## 4. goals

对应当前类型：`Goal`，当前由 `goalPlanner` 生成 3 个任务。

数据库建议：

- `goals`: id, user_id, title, category, reason, horizon, progress, smart_content jsonb, deadline, status, created_at, updated_at

接口草案：

| Method   | Path               | 用途                            |
| -------- | ------------------ | ------------------------------- |
| `GET`    | `/goals`           | 获取最近目标（已实现）          |
| `POST`   | `/goals`           | 创建目标并生成 3 个任务（已实现） |
| `PATCH`  | `/goals/:id`       | 更新目标进度、状态（已实现）    |
| `DELETE` | `/goals/:id`       | 归档或删除目标                  |

`POST /goals` 请求：

```json
{
  "title": "这个月养成每天学习复盘的习惯",
  "horizon": "month"
}
```

当前版本使用规则拆解，创建目标后会自动生成 3 个关联今日任务；后续可升级为后端 AI 拆解。

## 5. moods

对应当前类型：`MoodRecord`、`MoodSupportAction`。

数据库建议：

- `mood_checkins`: id, user_id, mood_type, intensity, note, ai_advice, created_at
- `mood_support_logs`: id, user_id, action_id, title, reward_fish, created_at

接口草案：

| Method | Path                                  | 用途                           |
| ------ | ------------------------------------- | ------------------------------ |
| `GET`  | `/moods/recent`                       | 获取最近情绪记录（已实现）     |
| `POST` | `/moods/checkins`                     | 情绪打卡，返回角色路由建议（已实现） |
| `GET`  | `/moods/support-actions`              | 获取情绪补给动作模板           |
| `POST` | `/moods/support-actions/:id`          | 完成补给，触发小鱼干和成长证据（已实现） |

## 6. habits

对应当前类型：`HabitTemplate`、`ActiveHabit`。

数据库建议：

- `habit_templates`: id, title, area, cue, tiny_action, reward, energy_level, is_active
- `habits`: id, user_id, template_id, name, category, target_days, current_streak, created_at
- `habit_logs`: id, habit_id, completed_date, created_at

接口草案：

| Method | Path               | 用途                            |
| ------ | ------------------ | ------------------------------- |
| `GET`  | `/habit-templates` | 获取习惯模板库（已实现）        |
| `GET`  | `/habits`          | 获取用户已开启习惯（已实现）    |
| `POST` | `/habits`          | 从模板开启习惯，并生成 3 天任务（已实现） |
| `POST` | `/habits/:id/logs` | 习惯打卡，后续支持热力图        |

`POST /habits` 请求：

```json
{
  "templateId": "study-review"
}
```

当前版本启动服务后会自动 upsert 内置习惯模板；后续可迁移为运营后台配置。

## 7. manor

对应当前成长庄园、商店、小鱼干兑换。

数据库建议：

- `manor_buildings`: id, user_id, building_type, level, position_x, position_y, unlocked_at
- `shop_items`: id, title, description, cost, category, effect, tone, asset_path, is_active
- `user_shop_items`: user_id, shop_item_id, acquired_at

接口草案：

| Method  | Path                       | 用途                                  |
| ------- | -------------------------- | ------------------------------------- |
| `GET`   | `/manor`                   | 获取庄园状态、建筑、装饰、用户资产（已实现） |
| `GET`   | `/shop/items`              | 获取商店物品（已实现）                |
| `GET`   | `/shop/purchases`          | 获取已兑换物品 ID（已实现）           |
| `POST`  | `/shop/items/:id/purchase` | 兑换装饰，扣除小鱼干（已实现）        |
| `PATCH` | `/manor/buildings/:id`     | 更新建筑位置/等级，后续用于 2.5D 庄园（已实现） |

当前版本启动服务后会自动 upsert 内置商店物品；购买会写入 `user_shop_items`，扣除 `users.fish_coin`，并生成 `REWARD_CLAIMED` 成长证据。
当前版本读取 `/manor` 时会自动创建三座核心建筑，并为已兑换装饰生成可摆放的庄园对象。

## 8. evidence_records

对应当前类型：`GrowthEvidence`，当前显示在个人中心成长档案。

数据库建议：

- `evidence_records`: id, user_id, title, category, note, source_type, source_id, fish_earned, created_at

接口草案：

| Method | Path                        | 用途                                     |
| ------ | --------------------------- | ---------------------------------------- |
| `GET`  | `/evidence-records`         | 获取成长档案列表（已实现）               |
| `POST` | `/evidence-records`         | 手动创建成长证据，后续可用于实践复盘     |
| `GET`  | `/evidence-records/summary` | 获取档案统计：数量、实践次数、累计小鱼干（已实现） |
| `POST` | `/evidence-records/export`  | 数据导出预留                             |

自动生成来源：

- 完成任务：`source_type = task`
- 加入活动：`source_type = activity`
- 完成情绪补给：`source_type = mood_support`
- 完成情景训练：`source_type = scenario_practice`
- 领取奖励：`source_type = mission_reward`

## 9. 前端适配计划

当前已完成：

- `src/types/shared/*` 已按后端域模型拆分。
- `src/types/app.ts` 保留为兼容出口，避免页面 import 大面积抖动。
- `mockApi` 已改为 REST-like 适配层，返回 `ApiResponse<T>`。

后续替换路径：

1. 新增真实 `httpApi`，方法名对齐 `mockApi`。
2. 使用环境变量选择 `mockApi` 或 `httpApi`。
3. 页面和业务 action 只依赖 API adapter，不直接访问 localStorage。
4. 启动 NestJS 后，逐个 endpoint 替换 localStorage 实现。

## 10. 后端启动前置条件

开始 NestJS + Prisma + PostgreSQL 前，应先完成：

- PostgreSQL 表结构草案评审。
- Prisma schema 初稿。
- API response/error 规范。
- JWT/游客会话策略。
- 前端 `mockApi` 与后端 endpoint 命名对齐。
