---
title: CF Manager — 一站式 Cloudflare 多账户管理面板
published: 2026-07-30
description: 介绍 CF Manager 是什么、能做什么，以及如何最快 5 分钟完成部署。
image: "api"
tags:
  - Cloudflare
  - CF Manager
  - 工具
  - 开源
category: 技术
draft: false
lang: 'zh-cn'
slug: cf-manager-intro
---

## 为什么需要 CF Manager？

如果你和我一样，手里握着好几个 Cloudflare 账户——一个放博客，一个跑 Workers AI，还有一个挂 DNS……你会切身感受到「切换账户」有多烦。Cloudflare 官方后台每次只能管一个账户，看个配额得切来切去，批量部署 Worker 更是手动点到手酸。

CF Manager 就是为这个痛点而生：**把分散在多个账户、多种产品（DNS、Workers、Pages、存储、AI、渲染）的管理入口，整合到一个统一的私有化面板里**。

简单说，它是一个自托管的 Cloudflare 多账户运维面板。基于 Cloudflare 官方 API 构建，部署到你自己的服务器或 Cloudflare Pages 上，数据完全私有。

![仪表盘](/assets/images/cf-manager/dashboard.png)

> 在线演示：https://mgrcf.pages.dev/admin/（密码：`cfmgrbest`）

---

## 核心功能一览

| 模块 | 能做什么 |
|------|----------|
| **多账户管理** | API Token / Global API Key 双认证，AES 加密存储，账户间一键切换 |
| **仪表盘** | 实时展示各账户 Workers、AI、渲染等配额用量，可视化进度条 |
| **Workers / Pages** | 脚本和项目的增删改查、批量部署、绑定管理、环境变量、自定义域名 |
| **DNS 管理** | A / AAAA / CNAME / MX / TXT 记录管理，一键代理开关 |
| **Tunnel 管理** | 创建/删除 Tunnel，Ingress 可视化编辑器，一键回源向导 |
| **规则引擎** | 回源、URL 重写、请求头/响应头转换、缓存、防火墙、限速、重定向，共 8 类规则 |
| **存储管理** | KV 键值 CRUD、D1 SQL 查询、R2 文件上传/下载/预览 |
| **AI 推理** | Workers AI 全模型支持，流式对话，Prompt Caching 计费感知，多账户调度 |
| **浏览器渲染** | 截图 / HTML / Markdown / PDF / 链接提取，共 5 种模式 |
| **OpenAI 兼容 API** | `/v1/chat/completions`、`/v1/models`，流式 & 非流式，本地调试专用 |
| **应用商店** | 内置 65+ 模板，支持第三方源扩展，一键部署 Workers / Pages |
| **系统设置** | HTTP / SOCKS5 代理，缓存清除，定时任务 |

---

## 快速上手：三种部署方式

CF Manager 支持三种部署方式，从零门槛到完全自托管，选你喜欢的就行。

### 方式一：Fork 一键部署（最推荐，零成本）

全程在浏览器操作，不需要装任何工具，几分钟搞定。

1. **Fork 仓库**

   打开 [cf-manager](https://github.com/hefy2027/cf-manager)，点击右上角 **Fork** 到自己的账号下。

2. **配置 Secrets**

   进入你的 Fork → **Settings** → **Environments** → **New environment**，创建环境名 `production`，添加 4 个 Secrets：

   | 变量 | 说明 |
   |------|------|
   | `CF_API_KEY` | Cloudflare Global API Key（在 [这里](https://dash.cloudflare.com/profile/api-tokens) 获取） |
   | `CF_EMAIL` | 你的 Cloudflare 账户邮箱 |
   | `ENCRYPTION_KEY` | 加密密钥，至少 16 位随机字符串（建议拿密码管理器生成） |
   | `API_SECRET` | 登录管理面板的密码 |

   > 注意：使用 Global API Key 有较高权限，建议绑定专门的测试账户。生产环境推荐用 API Token 限制权限。

3. **触发部署**

   进入 **Actions** → 选择 **Deploy to Cloudflare Pages (Secrets)** → **Run workflow**，环境名填 `production`，点击运行。

4. **访问**

   部署完成后，访问 `https://cfmgr.pages.dev/admin/`，输入 `API_SECRET` 密码即可登录。

---

### 方式二：手动部署到 Cloudflare Pages

如果你更喜欢手动控制，也可以下载预构建包自行上传。

**步骤概览：**

1. 下载 [cf-manager.zip](https://github.com/hefy2027/cf-manager/releases/latest/download/cf-manager.zip)
2. 在 Cloudflare Dashboard 创建 D1 数据库（名称 `cf-manager`），执行 `worker/src/db/schema.sql`
3. Workers & Pages → 创建 → Pages → 上传资产 → 上传 zip 包
4. Settings → Bindings → 绑定 D1（变量名 `DB`）和 KV（变量名 `KV`）
5. 设置环境变量 `ENCRYPTION_KEY` 和 `API_SECRET`
6. 重新部署，访问 `https://你的项目.pages.dev/admin/`

---

### 方式三：Docker 自托管

适合有自己的服务器、想要完全掌控的用户。

```bash
# 1. 克隆项目
git clone https://github.com/hefy2027/cf-manager.git
cd cf-manager

# 2. 复制并编辑配置文件
cp .env.example .env
# 至少设置 ENCRYPTION_KEY，可选设置 API_SECRET、PROXY_URL

# 3. 一键部署
chmod +x deploy.sh
./deploy.sh

# 4. 访问 http://localhost:3000/admin/
```

Docker 版本后端使用 **Express 5 + SQLite**，前端使用 **Nginx 反向代理**，支持 `BASE_URL` 配置（如 `/admin/`）来隐藏管理路径。

---

## 登录后怎么用？

### 1. 添加第一个账户

进入「账户管理」→ 点击「添加账户」：

- **名称**：给自己看的别名，比如「主号」「测试号」
- **认证方式**：推荐用 **API Token**，范围选账户级，权限按需勾选（Workers、DNS、D1 等），具体勾选哪些见[附录](#附录api-token-权限配置对照)；如果你只是自己测试，也可以用 Global API Key
- **邮箱**：Cloudflare 登录邮箱

添加后，你的 API Key 会 **AES 加密存储**，不会明文落盘。

### 2. 探索各个模块

左侧菜单一目了然：

- **仪表盘** → 看各个账户的资源配额用量
- **Workers / Pages** → 管理脚本和项目，支持跨账户批量部署
- **DNS 管理** → 添加/修改 DNS 记录
- **存储管理** → 操作 KV、D1、R2
- **AI 推理** → 选模型、调参数、看 token 消耗
- **规则引擎** → 给域名配各种规则
- **应用商店** → 浏览模板，一键部署到你的 Worker / Pages

![Workers 管理](/assets/images/cf-manager/workers.png)

### 3. 试用 AI 推理

进入 AI 推理模块，选择一个模型（比如 `@cf/meta/llama-4-scout`），输入提示词就能直接在面板里对话。右侧会显示每次请求的 token 消耗和费用估算。

![AI 推理](/assets/images/cf-manager/ai-inference.png)

### 4. 浏览模板商店

模板商店（应用商店）汇集了 65+ 个开箱即用的 Cloudflare Worker / Pages 模板，按类型筛选，找到合适的直接一键部署到你的账户。

![模板商店](/assets/images/cf-manager/store.png)

### 5. 尝试 OpenAI 兼容 API

CF Manager 内置了一个 OpenAI 兼容接口，你可以用任何支持 OpenAI API 的工具（ChatBox、OpenCat、Continue 等）连接到它：

```
Base URL: http://localhost:3000/v1 （Docker）或 https://cfmgr.pages.dev/v1 （Pages）
API Key: 用面板里配置的账户 Token
```

模型列表通过 `/v1/models` 动态获取。注意这只是本地调试用，不要对外开放。

---

## 技术栈

| 层级 | Docker 部署版 | Cloudflare Pages 部署版 |
|------|-------------|------------------------|
| 前端 | Vue 3 + Naive UI + Pinia | 同左 |
| 后端 | Express 5 + Cloudflare SDK | Hono + Cloudflare REST API |
| 数据库 | SQLite (better-sqlite3) | Cloudflare D1 |
| 部署 | Docker Compose | Cloudflare Pages + D1 + KV |

---

## 最后

CF Manager 用了两套技术栈支持两种部署模式：Docker 版偏传统，适合有自己服务器的人；Pages 版利用 Cloudflare 本身的 Serverless 能力，适合零成本白嫖党。无论哪种，核心管理能力是一致的。

项目完全开源（MIT），目前迭代到 v1.4.1。如果你也是 Cloudflare 重度用户，不妨试试。

- GitHub 仓库（主）：https://github.com/hefy2027/cf-manager
- Gitee 镜像：https://gitee.com/hefy27/cf-manager
- 应用商店模板：https://github.com/hefy2027/cf-store

---

## 附录：API Token 权限配置对照

如果你使用 API Token 而非 Global API Key，创建 Token 时需要勾选以下权限（覆盖 CF Manager 所有功能模块）：

| # | 权限 | 级别 | 对应功能 |
|---|------|------|----------|
| 1 | `User Details:Read` | User | 验证 Token 有效性 |
| 2 | `Account Analytics:Read` | Account | 仪表盘用量统计 |
| 3 | `Workers Scripts:Edit` | Account | Workers 脚本 / Secrets / Cron / 域名 / 设置 |
| 4 | `Workers Tail:Read` | Account | Worker 日志查看 |
| 5 | `Workers KV Storage:Edit` | Account | KV 命名空间和键值管理 |
| 6 | `D1:Edit` | Account | D1 数据库管理及 SQL 查询 |
| 7 | `Workers R2 Storage:Edit` | Account | R2 存储桶和对象管理 |
| 8 | `Cloudflare Pages:Edit` | Account | Pages 项目和部署管理 |
| 9 | `Workers AI:Edit` | Account | AI 模型列表和推理 |
| 10 | `Browser Rendering:Edit` | Account | 浏览器渲染（5 种模式） |
| 11 | `Cloudflare Tunnel:Edit` | Account | Tunnel 创建 / 删除 / 配置管理 |
| 12 | `Zone:Read` | Zone | 区域列表读取 |
| 13 | `DNS:Edit` | Zone | DNS 记录管理 |
| 14 | `Workers Routes:Edit` | Zone | Workers 路由管理 |

**资源范围建议：**

- **Account Resources** → `All accounts`（或指定你希望管理的账户 ID）
- **Zone Resources** → `All zones`（或指定你希望管理的域名）

> **TIPS**：
> - 创建 Token 入口：[Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) → 创建令牌 → 自定义
> - TTL 建议设为 `Forever`（无过期），方便长期使用
> - 生成后**立即复制保存**，Token 只显示一次
> - 「Rulesets 规则引擎」无需额外权限，由 `Workers Routes:Edit` + `DNS:Edit` 覆盖
