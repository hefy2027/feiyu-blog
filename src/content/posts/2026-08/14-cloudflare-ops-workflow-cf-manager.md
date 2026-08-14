---
title: "写代码用 Wrangler，日常运维进自建面板：我是怎么用爽 Cloudflare 的"
published: 2026-08-14
description: "官方后台、Wrangler CLI 和自建面板该怎么选？聊聊我是如何用 CF Manager 打通多账号配额大盘、一键跨号分发与 Cursor AI 网关的。"
image: "https://i.ibb.co/xKw9Qt78/cloudflare-ops-workflow-cf-manager-cover.png"
tags: ["Cloudflare", "CF Manager", "运维", "工作流", "开发者工具"]
category: "Cloudflare"
draft: true
lang: "zh-cn"
pinned: false
author: ""
sourceLink: ""
licenseName: ""
licenseUrl: ""
comment: true
password: ""
passwordHint: ""
slug: "cloudflare-ops-workflow-cf-manager"
prevTitle: ""
prevSlug: ""
nextTitle: ""
nextSlug: ""
---

> 作为每天重度依赖 Cloudflare 的开发者，我手里常年挂着 4 个不同的账号：一个放个人博客和主域名，一个专门跑实验性的 Workers 和无头浏览器爬虫，一个给朋友托管轻量静态站，还有一个专门薅 Workers AI 的免费神经元配额。
> 
> 很多朋友经常问我：**“Cloudflare 官方不仅有功能齐全的 Web Dashboard，还有极为强大的命令行工具 Wrangler CLI，你为什么还要折腾开源自建面板（CF Manager）？这三者到底该怎么选？”**
> 
> 其实工具之间从来不是非此即彼的替代关系。作为长期在一线折腾的开发者，今天想从实际使用场景聊聊：官方后台和命令行工具的边界在哪里，开源自建面板究竟补上了什么，以及我是如何把这三者组合成一套顺手运维流的。

---

## 1. 多账号下的真实痛点：官方工具链为什么会让人感到撕裂

在使用 Cloudflare 的早期阶段，大部分人只用官方后台就足够了。但当你的业务逐渐扩展，手里积累了多个独立账户、数十个域名和几十个 Worker 脚本时，你会发现官方工具链存在两个非常真实的体验断层：

1. **官方 Web Dashboard 的单账号设计**：
   官方后台是严格以「单账号（Account）」为维度的。如果你想看一下今天 4 个账号的 Workers 请求总数有没有超标，或者查一下哪个账号的 AI 神经元快见底了，流程基本是：**退出当前账号 → 重新登录/切换账号 → 点进 Analytics → 记下数据 → 再次切换**。来回切几次，原本想干啥都快忘了。
2. **Wrangler CLI 偏重写代码与构建**：
   Wrangler 是写代码和跑 CI/CD 的利器，本地开发体验极好。但它不是为了日常轻量运维设计的。你不可能为了临时给某个域名加一条 DNS 记录、给 Tunnel 调一下端口映射、或者随手测一下文生图效果，还专门开终端去敲命令。

所以才需要一个轻量面板，把这几个高频但繁琐的操作收敛到一个界面里。

---

## 2. 三款工具横向对比：各自适合干什么

为了理清它们各自最适合的场景，我们可以把这三款工具的核心能力拉平对比：

| 对比维度 | Wrangler CLI (官方命令行) | Cloudflare Dashboard (官方 Web) | CF Manager (自建开源面板) |
| :--- | :--- | :--- | :--- |
| **核心定位** | 本地代码开发、调试与 CI/CD 自动化 | 全功能权威底座、企业级网络配置 | 多账号资产聚合、日常高频运维与生态桥接 |
| **多账号管理** | 依赖本地环境配置切换，多号繁琐 | 严格单账号视图，跨号需反复切换 | **多账号拉平聚合**，一键秒切，全局大盘监控 |
| **Workers/Pages 部署** | 本地源码构建，灵活度最高，适合复杂工程 | 手动上传代码包或关联 Git 仓库 | **模板市场 + 跨账号一键批量分发**，支持只更新配置 |
| **DNS 与网络规则** | 需手写配置或调用 API | 功能最全但层级深，操作路径长 | **可视化域名矩阵**，内置 8 类规则引擎与穿透向导 |
| **AI 推理支持** | 仅供本地开发调用与代码绑定 | 仅提供控制台基础查看与简单 Playground | **内置 AI 工作台** + **多账号负载均衡与 OpenAI 兼容代理** |
| **浏览器渲染** | 需在 Worker 脚本中编写代码调用 | 无原生可视化调试与格式转换界面 | **5 种抓取与转换模式**（截图/Markdown/PDF/外链等） |
| **凭据与安全性** | 存储于本地机器配置文件 | 官方统一认证与权限管控 | **AES-GCM 本地加密**，支持代理隔离与伪装路径 |

![CF Manager 功能模块全景](https://i.ibb.co/svpmrfw5/cloudflare-ops-workflow-cf-manager-modules.png)

简单说：**Wrangler 负责写代码，官方 Dashboard 是底层底座，CF Manager 负责日常打理和多账号调度。**

---

## 3. 自建面板真正好用的 3 个地方

结合我长时间使用 Cloudflare 的经验，自建面板真正让人“用了就回不去”的地方，主要集中在以下三个方面：

### 痛点一：所有账号配额拉平，不用反复切号

日常用下来，最烦人的其实是查配额：
- 哪个测试账号的 Workers 每日 10 万次免费请求快用完了？
- 跑定时脚本的账号今天消耗了多少 Workers AI 神经元？
- 浏览器无头渲染额度还剩多少？

在官方后台，你必须一个账号一个账号点进去排查；而在 CF Manager 中，首页仪表盘把所有绑定账号的用量全部拉平展示。

![多账户仪表盘](https://i.ibb.co/Hp1sLz6J/cloudflare-ops-workflow-cf-manager-dashboard.png)

所有账户的实时状态一览无余。凭证采用 AES-GCM 算法在本地加密存储，即便是自建在边缘网络或本地容器里，也能确保 API Token 的安全性。

---

### 痛点二：同一个 Worker 跨账号一键分发

如果你写了一个好用的轻量小工具（比如一个统一的防盗链反代 Worker、一个测速前端页面、或者一个基于 D1 的短链接服务），想把它同时部署到 3 个不同域名的 Cloudflare 账户上：

- **传统做法**：你需要切换 3 次 Wrangler 登录凭据，或者打开 3 个浏览器标签页逐个上传脚本并重新配置环境变量。
- **自建面板解法**：通过内置的 **应用商店（Catalog）**，直接勾选目标账户，填入统一参数，一键就能并发分发到所有选中账户。

![应用商店模板一键跨账户批量分发](https://i.ibb.co/5XmNrgw1/cloudflare-ops-workflow-cf-manager-store-deploy.gif)

还有一个很实用的细节是**配置热更新机制**：如果你只是修改了某个环境变量或 KV 绑定，重部署时面板只会调用 Cloudflare Secrets/Bindings API 进行增量更新，不需要重新打包和上传代码包，快很多。

---

### 痛点三：把 Workers AI 变成标准的 OpenAI 接口

Cloudflare 的 Workers AI 提供了极其慷慨的免费神经元额度，支持 Llama 3.3、Qwen 2.5 Coder、Mistral 到各类开源生图、TTS 模型。

但有个尴尬的问题：**绝大多数常用开发工具（Cursor、沉浸式翻译、ChatGPT-Next-Web、ChatBox 等）只认 OpenAI 标准的 `/v1/chat/completions` 协议**。如果直接调 CF 原生 API，参数和鉴权根本接不上。

在面板内部，你可以通过自带的 **AI 工作台** 直接测试对话、文生图或语音合成：

![AI 工作台与多账号调度](https://i.ibb.co/60Xhn7jn/cloudflare-ops-workflow-cf-manager-ai-chat.png)

但更有价值的玩法是把它作为本地 IDE 的后端。CF Manager 内置了一个轻量级的 OpenAI 兼容网关层：

1. **对外暴露标准端点**：提供标准的 `/v1/chat/completions`、`/v1/images/generations`、`/v1/models` 等接口，支持流式 SSE 和非流式响应。
2. **多账号负载均衡与自动轮换**：当一个账户的神经元配额耗尽时，网关能自动切换到下一个可用账户，保证本地工具调用不中断。
3. **Prompt Caching 计费感知**：自动匹配官方的缓存命中计费逻辑，大幅降低上下文神经元开销。

同时，面板还提供了独立的 **AI 用量统计大盘**，所有账号消耗的神经元、Token 用量与模型调用分布一目了然，不用盲猜额度花哪儿了：

![多账号 AI 神经元与用量统计大盘](https://i.ibb.co/KjXmZxLq/cloudflare-ops-workflow-cf-manager-ai-stat.png)

实际配置非常简单：在 Cursor 的设置中开启 OpenAI API，将 `Base URL` 指向自建面板地址（如 `https://你的域名/admin/v1`），填入访问密钥，就可以直接在编辑器里调用 Cloudflare 的 Llama 3.3、Qwen 2.5 Coder 等模型进行代码补全和实时问答。

![在 Cursor 中直接配置自建 Base URL 调用 Workers AI 进行代码编写与问答](https://i.ibb.co/tTDNcdXd/cloudflare-ops-workflow-cf-manager-cursor.png)

不需要额外写胶水代码，就把免费的 Workers AI 变成了一个随叫随到的私有开发副驾驶。

---

## 4. 我的日常搭配：怎么分工最顺手

在实际开发和运维中，没必要只靠某一个工具。以下是我目前用着最舒服的分工方式：

![Cloudflare 终极运维工作流全景](https://i.ibb.co/qF4D6RDb/cloudflare-ops-workflow-cf-manager-workflow.png)

### 场景 1：本地编写复杂业务与核心架构 ➡️ 用 Wrangler
当我要开发一个具有复杂业务逻辑、多模块依赖、或者接入了 D1 ORM 的 Worker 服务时，我一定会打开 VSCode，使用 Wrangler 进行本地开发和热重载调试。写完后通过 Git 提交触发 CI/CD 自动部署。

### 场景 2：日常巡检、资源管理与外部接入 ➡️ 用 CF Manager
每天早晨打开浏览器，CF Manager 是我常驻的标签页之一：
- 扫一眼各账户的配额健康度；
- 偶尔需要临时把家里的内网服务穿透出去，直接在 Tunnel 模块中通过可视化向导配置 Ingress，3 步生成 CNAME 和回源规则；
- 需要把网页提取为清晰的 Markdown 文档供大模型阅读，直接点进 Browser Rendering 模块抓取；
- 本地 IDE 编码时，后台挂着自建的 OpenAI 兼容端点做代码补全和辅助推理。

### 场景 3：遇到极端冷门设置与企业级网络配置 ➡️ 回官方 Dashboard
当需要配置深度零信任（Cloudflare One）、申请特殊的企业级 mTLS 证书、或者查看全站原始攻击流量日志时，才会登录官方后台进行精细化微调。

---

## 5. 怎么部署？两套零门槛方案

如果你也管理着多个 Cloudflare 账户，部署一套属于自己的管理面板非常简单，主要有两种方式：

### 方式 A：Cloudflare Pages + D1（零服务器成本，推荐）
直接利用 Cloudflare 自身的 Pages 和 D1 数据库进行无服务器部署：
1. 在 GitHub 上 Fork 项目仓库；
2. 在仓库设置的 Environments 中配置加密密钥（`ENCRYPTION_KEY`）与面板访问密码（`API_SECRET`）；
3. 运行 Actions 工作流，一键自动发布到 Cloudflare Pages；
4. 绑定 D1 数据库执行基础表结构即可。

### 方式 B：Docker 一行命令拉起（适合已有 VPS 的玩家）
如果希望数据完全保存在自己的 VPS 上，直接在终端执行一行 Docker 命令即可：

```bash
docker run -d \
  --name cf-manager \
  -p 3000:3000 \
  -e ENCRYPTION_KEY=your-secure-random-encryption-key-min-16-chars \
  -e API_SECRET=your-strong-dashboard-password \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  hefy2027/cf-manager:latest
```

> 说明：端口 `3000` 可按需调整，数据与 SQLite 数据库默认自动持久化在当前目录的 `data` 文件夹下。

### 安全加固要点
在自建运维面板时，安全防护永远是第一位的：
- **路径隐藏与伪装**：默认根路径展示为标准 Nginx 欢迎页，真实的运维后台通过 `/admin/` 进入，并受到密码严格保护；
- **出口代理隔离**：支持为每个 Cloudflare 账户配置独立的网络出口 IP（支持配置 HTTP/SOCKS5 代理或 Resin 代理池），避免多账号并发调用 API 时触发风控限制；
- **SSRF 防御**：部署链路和浏览器渲染均内置了 IP 白名单与协议拦截机制，拒绝任何访问内部局域网的恶意请求。

---

## 写在最后

折腾工具这么久，最大的体会是没必要强行在命令行、官方后台和自建面板之间分个高下。

把写代码交给 Wrangler，底层安全交给官方，日常打理和多账号调用留在自建面板里，省下切号和重复配置的时间，才是真正提升效率的办法。

---

## 互动征集

CF Manager 目前依然在保持高频迭代。在日常折腾 Cloudflare 时，**你还遇到过哪些痛到不能忍的场景？或者你最希望在自建面板里看到什么新功能？**

欢迎在评论区聊聊你的实际运维痛点与功能需求！

> 项目开源地址、在线 Demo 与完整部署文档已整理好，后台回复「**cf-manager**」即可获取。

我是 AI非与，一尾随性游弋的鱼。
