---
title: Cloudflare 多账户管理：从痛点分析到开源方案实践
published: 2026-07-30 15:03:27
description: 分享 Cloudflare 多账户统一管理的技术方案，涵盖 DNS、Workers、存储和 AI 推理的集中运维实践。
image: "./images/cf-manager-cover.png"
tags:
  - Cloudflare
  - Workers
  - 运维
  - 开源
category: Cloudflare
draft: false
lang: 'zh-cn'
slug: cf-manager-arch
---

## 背景

日常开发中经常同时用到多个 Cloudflare 账户——一个放博客域名，一个跑 Workers AI，还有一个管理十几条 DNS 记录。官方后台各功能分散在不同页面，切换账户需要反复登录，查配额、部署 Worker 这些操作非常繁琐。

于是做了一个开源工具来解决这个问题，把 Cloudflare 官方后台分散在多个页面、多个账户的功能，全部收到一个面板里。下面分享它的架构设计和技术实现。

---

## 整体架构

![仪表盘](./images/dashboard.png)

核心思路很简单：**通过 Cloudflare API 统一对接所有账户的资源，前端用一个 SPA 面板集中呈现和操作。**

### 架构选型

项目支持两套后端，共用同一套前端和业务逻辑：

| 方案 | 后端 | 数据库 | 适用场景 |
|------|------|--------|----------|
| Docker 自托管 | Express 5 | SQLite | 本地/私有服务器，数据处理在本地 |
| Cloudflare Pages | Hono | D1 | 零运维，数据存在 Cloudflare 边缘 |

两种方案的选择主要看对数据的控制需求。Docker 方案的凭证和操作日志完全在本地，适合对数据隐私要求高的场景；Pages 方案无须维护服务器，适合个人快速使用。

前端统一使用 **Vue 3 + Naive UI + Pinia**，API 层做了适配层，同一套前端代码可以无缝对接两种后端。

### 凭证安全

Cloudflare API 支持两种认证方式：**API Token**（细粒度权限）和 **Global API Key**（全局权限）。工具同时支持这两种，推荐使用 API Token，可以精确控制每个 Token 能访问的资源和操作类型。

所有凭证在前端提交后，后端使用 **AES-256-CBC** 加密存入数据库，加密密钥由部署者自己设定，不经过任何第三方服务。

---

## 核心模块设计

从域名 DNS 到边缘计算，从对象存储到 AI 推理，整个面板覆盖了 Cloudflare 运维的主要链路。

### 多账户切换机制

多账户管理的核心难点在于 **凭证隔离** 和 **上下文切换**。

实现上，每个账户的 API Token 独立加密存储，用户登录面板后可以添加多个账户。切换账户时，前端只切换当前会话的 `accountId` 上下文，后端根据该上下文选择对应的加密凭证解密后调用 Cloudflare API。操作审计日志也按账户维度记录，方便追溯。

![Workers 管理](./images/workers.png)

### Workers / Pages 批量部署

跨账户部署 Worker 是最常用的功能之一。Cloudflare 官方 API 的部署流程是：上传脚本 → 配置绑定 → 设置路由 → 绑定域名，每一步都要单独调 API。

这里做了两件事：
1. **结构化表单**：把 JSON 配置转为可视化表单，KV 绑定、环境变量、路由规则都在表单里完成，降低手写 JSON 的出错过率。
2. **批量调度**：选择多个账户后，构造部署任务队列，按账户串行、按步骤并行执行，失败自动回滚。

### AI 推理网关

Workers AI 提供了不错的免费推理额度，但官方没有提供用量统计和配额监控。这个模块的核心设计点：

- **全模型支持**：通过 Workers AI 的 REST API 列出所有可用模型，按文本生成、图像生成、嵌入等分类。
- **流式对话**：基于 Server-Sent Events 实现流式推理，前端用 Naive UI 的对话组件展示，支持 Reasoning 过程可视化。
- **OpenAI 兼容层**：暴露 `/v1/chat/completions` 和 `/v1/models` 两个端点，响应格式完全兼容 OpenAI API。这样本地的 ChatBox、OpenCat、Continue 等工具可以直接连上来，配置 `base_url` 为本机地址即可。
- **用量监控**：汇总展示所有账户的 Workers AI 日配额消耗情况，方便了解各账户的推理用量。

![AI 推理](./images/ai-inference.png)

### 规则引擎

Cloudflare 的 Rulesets API 相当复杂，涉及多种规则类型（Transform Rules、Cache Rules、Firewall Rules 等），每种规则的 Phase 和表达式语法都有差异。

实现上做了两层抽象：
- **规则模板层**：把 8 种常用规则类型（回源改写、URL 重写、请求头转换、缓存控制、防火墙、限速、重定向）抽象为结构化表单，用户填字段即可。
- **表达式生成层**：根据表单配置自动生成 Cloudflare Rulesets API 所需的表达式语法，支持嵌套条件组合。

### 隧道管理

Cloudflare Tunnel 的配置链路比较长：创建 Tunnel → 配置 Ingress → 添加 DNS 记录，三者环环相扣，漏一步就无法正常回源。

这里做了一个 **一键回源向导**：用户只需输入内网服务地址和域名，工具自动完成 Tunnel 创建、Ingress 规则写入、DNS CNAME 记录添加三步操作，并提供可视化的 Ingress 编辑界面。

---

## 模块总览

| 模块 | 功能说明 |
|------|----------|
| 实时仪表盘 | 各账户 Workers、AI、渲染配额实时展示，操作审计记录 |
| DNS 管理 | A / AAAA / CNAME / MX / TXT 全记录类型，代理开关，批量操作 |
| Workers / Pages | 脚本 CRUD，单/跨账户批量部署，KV 绑定、环境变量、路由、自定义域名 |
| 隧道管理 | Tunnel 创建/删除，Ingress 可视化编辑，一键回源向导 |
| 规则引擎 | 8 种规则类型（回源/重写/头转换/缓存/防火墙/限速/重定向），表单化配置 |
| AI 推理 | Workers AI 全模型，流式对话 + Reasoning 可视化，多账户配额调度 |
| 浏览器渲染 | 截图 / HTML / Markdown / PDF / 链接提取，5 种模式，内建 SSRF 防护 |
| 存储管理 | KV 键值 CRUD、D1 SQL 查询、R2 文件上传/下载/预览 |
| OpenAI 兼容 API | `/v1/chat/completions`、`/v1/models`，流式 + 非流式 |
| 安全 | API Token AES-256-CBC 加密，可选登录密码，`/admin/` 路径隐藏，审计日志 |

![模板商店](./images/store.png)

---

## 部署实践

### Cloudflare Pages 部署（推荐）

利用 GitHub Actions 自动部署到 Cloudflare Pages，全程浏览器操作：

| 步骤 | 操作 |
|------|------|
| 1 | Fork 仓库，打开你的 Fork → **Settings** → **Environments** |
| 2 | 创建 `production` 环境，添加 4 个 Secrets（见下表） |
| 3 | **Actions** → **Deploy to Cloudflare Pages (Secrets)** → Run workflow，环境名填 `production` |
| 4 | 部署完成后访问 `https://cfmgr.pages.dev/admin/`，输入 `API_SECRET` 登录 |

| 变量 | 说明 |
|------|------|
| `CF_API_KEY` | Cloudflare Global API Key |
| `CF_EMAIL` | Cloudflare 账户邮箱 |
| `ENCRYPTION_KEY` | 至少 16 位随机字符串（AES 加密密钥） |
| `API_SECRET` | 面板登录密码 |

> 生产环境推荐用 API Token 替代 Global API Key，只授予必要的权限，具体权限列表见[附录](#附录)。

### Docker 自托管

```bash
git clone https://github.com/hefy2027/cf-manager.git
cd cf-manager && cp .env.example .env
chmod +x deploy.sh && ./deploy.sh
# 访问 http://localhost:3000/admin/
```

修改 `.env` 中的 `ENCRYPTION_KEY` 和 `API_SECRET` 后启动即可。支持 HTTP/SOCKS5 代理，适合需要固定出口 IP 的环境。

---

## 技术栈总结

| 层 | Docker 方案 | Cloudflare Pages 方案 |
|----|------------|----------------------|
| 前端 | Vue 3 + Naive UI + Pinia | 同左 |
| 后端 | Express 5 | Hono |
| 数据库 | SQLite (better-sqlite3) | Cloudflare D1 |
| 部署 | Docker Compose | GitHub Actions → Pages |

---

## 参考资料

- GitHub 仓库：https://github.com/hefy2027/cf-manager

---

## 附录：API Token 权限配置对照

使用 API Token 时，创建自定义 Token 需要勾选以下 14 项权限：

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
| 11 | `Cloudflare Tunnel:Edit` | Account | Tunnel 管理 |
| 12 | `Zone:Read` | Zone | 区域列表读取 |
| 13 | `DNS:Edit` | Zone | DNS 记录管理 |
| 14 | `Workers Routes:Edit` | Zone | Workers 路由管理 |

**资源范围**：Account Resources → `All accounts`，Zone Resources → `All zones`。

**创建入口**：[Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) → 创建令牌 → 自定义。TTL 建议 `Forever`，生成后**立即复制保存**。
