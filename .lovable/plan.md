# 保质期记录应用 方案

## 目标
一个移动端优先的 Web 应用，简便地记录物品保质期，支持**语音添加**，打开应用时自动提醒即将过期的物品。先用本地存储快速上线，数据结构预留后续升级到云端（Lovable Cloud）同步。

## 核心功能
1. **物品列表（首页）**：按保质期临近程度排序，分三段展示——已过期 / 即将过期（7 天内）/ 正常。每项显示名称、分类、剩余天数、进度条颜色随紧急度变化。
2. **添加物品**：两种方式
   - **语音添加**（重点）：长按麦克风按钮录音 → 说话（如「牛奶 9 月 15 号过期」）→ 自动解析出名称、过期日期、可推断分类 → 预填到表单供用户确认/修改后保存。
   - **手动添加**：表单填写名称、分类、过期日期、数量/备注。
3. **应用内提醒**：首页顶部「即将过期」横幅 + 红色徽标计数，无需浏览器通知权限。
4. **物品管理**：点击编辑、左滑/按钮删除、标记已用完。

## 语音流程（技术关键）
- **客户端**：用 Web Audio API 录制麦克风音频，编码为 16kHz 单声道 WAV（兼容 iOS Safari，避免 MediaRecorder 分片问题）。上传到后端路由。
- **后端路由** `/api/voice-add`（server route，公开需校验来源）：
  1. 调用 Lovable AI 语音转文字 `openai/gpt-4o-mini-transcribe`（流式默认，本场景用单次返回即可）。
  2. 调用 Lovable AI 聊天补全，让模型把转写文本解析成结构化 JSON `{ name, expiryDate(YYYY-MM-DD), category, note }`，分类限定为 food/medicine/daily/other。
  3. 返回结构化结果给前端预填表单。
- 需要 `LOVABLE_API_KEY` 服务端密钥（存为 secret）。
- 录音为空 / 权限拒绝时给清晰提示，不调用接口。

## 数据模型（localStorage，预留云端字段）
```ts
type Item = {
  id: string
  name: string
  category: 'food' | 'medicine' | 'daily' | 'other'
  expiryDate: string   // YYYY-MM-DD
  createdAt: number
  note?: string
  usedUp?: boolean
}
```
存储 key：`expiry-tracker-items`。封装 `storage.ts`，后续升级云端只需替换实现层，组件不动。

## 页面/路由
- `/` 首页：物品列表 + 即将过期提醒横幅 + 底部「添加」按钮（含语音）。
- `/add` 添加页：语音按钮 + 手动表单（同一页，语音结果预填表单）。
- `/item/:id` 编辑/详情页。
移动端底部 Tab 导航：首页 /（添加是中间大按钮）/ 归档（已用完）。

## 设计方向
移动端优先，简洁清爽。采用「食品标签/购物清单」质感：圆角卡片、柔和暖色背景、紧急度用颜色编码（绿→黄→红）。具体视觉在构建时通过 design directions 与你确认。

## 技术栈
- TanStack Start + React 19 + Tailwind v4（已有）。
- 持久化：localStorage（本期）→ Supabase/Lovable Cloud（后续）。
- 语音：Lovable AI Gateway（speech-to-text + chat 补全解析）。
- shadcn/ui 组件复用（已有 Radix 依赖）。

## 里程碑
1. 基础 UI 框架 + localStorage CRUD + 首页列表与提醒横幅。
2. 手动添加/编辑/删除。
3. 语音添加：录音 + 后端转写解析 + 表单预填。
4. 打磨移动端交互、空状态、分类筛选。
5. （后续）接入 Lovable Cloud：账号 + 多设备同步 + 数据迁移。

## 需你确认 / 前置
- 启用 Lovable AI Gateway 并配置 `LOVABLE_API_KEY` secret（语音功能必需）。
- 是否接受「先本地存储」上线（单设备，无登录），后续再升级云端同步？
- 分类是否就用「食品 / 药品 / 日化 / 其他」四类？
