---
title: "CF Manager 开源两个月复盘：从论坛一个求助帖，到 160+ Star 与 73% 的超高 Fork 率"
published: 2026-08-15
description: "从 6 月 11 日在 LINUX DO 发帖吐槽多账号管理，到坛友一句「让他部署在 worker 上」促成双架构重构——记录 CF Manager 两个月迭代 16 个版本的真实经历、关键决策与增长复盘。"
image: "https://i.ibb.co/RpmsKQHx/cf-manager-panel.png"
tags: ["Cloudflare", "CF Manager", "开源", "复盘", "开发故事"]
category: "Cloudflare"
draft: false
lang: "zh-cn"
pinned: false
author: ""
sourceLink: ""
licenseName: ""
licenseUrl: ""
comment: true
password: ""
passwordHint: ""
slug: "cf-manager-two-week-review"
prevTitle: ""
prevSlug: ""
nextTitle: ""
nextSlug: ""
---

今天（8 月 15 日），距离我在本地写下第一行代码并把 [CF Manager](https://github.com/hefy2027/cf-manager) 开源，刚好过去了整整两个月。

两个月的时间，版本从最初简陋的 `v0.1` 迭代到了现在的 `v2.0.2`。没有找任何大 V 推广，也没有商业运作，它在 GitHub 上自己悄悄长了起来：

- **163 个 Star**，**119 个 Fork**；
- **Fork 率高达 73%**（通常开源项目的 Fork/Star 比例仅在 10%~15% 左右）；
- 累计发布 **16 个 Release**，合并 **45 次 PR**，处理并关闭了 **40 多个 Issue**。

趁着今天把这篇文章发出来，老老实实聊聊这个项目是怎么从一次“求助无果”的吐槽，演变成一个被真实人类高频使用的工具，以及这两个月里我到底经历了什么。

---

## 1. 源起：先求助，求助不到再自己解决

故事的起点是 6 月 11 日，我在 LINUX DO 社区发了一个求助帖：

> **《CF大善人多个账户你们都怎么管理的啊》**
> 
> “如题，自己使用了CF大善人的功能，绑定了一堆的域名，worker等等，但是账户多，管理起来太麻烦了！有什么项目或者什么方法能方便管理”

当时我手里常年挂着 3~4 个 Cloudflare 账号（一个放博客域名，一个跑 Workers AI，还有一个搞临时测试），每次查个配额或者改条解析，都要经历一遍极其反人类的操作：

> 退出登录 -> 输入另一个账号密码登录 -> 在漫长的层级菜单里翻找 -> 改完 -> 再退出来登另一个号。

**我发帖的初衷其实非常单纯：以为市面上早就有现成成熟的多账户管理工具了，想直接发帖求推荐、“抄作业”白嫖一个现成项目。**

然而等了一圈回复，发现大家面对多账号痛点时，要么用不同浏览器 Profile/无痕模式肉身硬切，要么用密码管理器死记。市面上根本没有一个工具能把多个 Cloudflare 账户的 DNS、Workers、存储和 AI 配额聚合在同一个面板里。

有坛友直接在楼下建议：

> *“建议 vibe coding 一个通过 API 管理的项目。”*

我回了一句：*“是的，在 Vibe Coding 看看能不能整个项目管理，主要是想白嫖其他的功能。”*

既然全网求助无果、找不到能解决痛点的现成轮子，那就只能自己动手造了。

说时迟那时快，6 月 13 日我立马开工手搓。最开始的想法非常纯粹：写个单页面板把 Token 填进去调官方 REST API，能够一键切号查 DNS 和配额。搓出最初的 Docker 版本后，我把开源地址回帖发到了社区里（那个链接后来被点击了 450 多次）。

---

## 2. 质变：坛友一句「原汤化原食」，催生了 Worker 版本

最初开源的版本是典型的传统全栈：**前端 Vue 3 + 后端 Node.js (Express 5) + 本地 SQLite**，打包成 Docker 镜像跑在私有服务器或 NAS 上。

刚发出来不久，帖子底下有位坛友发了条神回复：

> *“让他部署在 worker 上这样就完美了 🤣”*

紧接着又有坛友调侃：

> *“原汤化原食说是。”*

这两句话瞬间戳中了我：
**大家之所以喜欢 Cloudflare，很大程度就是看重它的 Serverless、免运维和免费额度。很多开发者根本没有自己的云服务器或 VPS，如果为了管免费的 Cloudflare 还要先去买台服务器跑 Docker，岂不是本末倒置？**

**“用 Cloudflare 自己的平台来管理 Cloudflare 自身”**，这才是最优雅、最符合极客哲学的方案！

于是，我开始了项目最大的一次架构重构：
1. **后端轻量化移植**：放弃 Node.js 原生依赖，用轻量级框架 **Hono** 完全重写了后端路由和业务逻辑，使其能跑在 Cloudflare Workers / Pages Functions 运行时上；
2. **存储适配**：原本的本地 SQLite 数据层，无缝适配为 **Cloudflare D1 边缘关系型数据库**；
3. **缓存与限流**：用 **Cloudflare KV** 处理并发保护与状态缓存；
4. **双引擎同构**：保持一套前端代码，同时兼容 **Docker 私有部署（Express + SQLite）** 与 **Cloudflare 纯边缘托管（Hono + D1 + KV）**。

这次重构直接彻底打开了项目的受众面。

---

## 3. 为什么 Fork 率会高达 73%？

很多朋友看我 GitHub 仓库时都会纳闷：一般项目的 Fork 数只有 Star 的十分之一左右，为什么 CF Manager 有 **119 个 Fork / 163 个 Star**？

原因非常纯粹：**我在 README 和部署文档里，把「Fork 一键部署（Option 1）」做成了最核心的默认交付方式。**

借助 Cloudflare Pages 和 GitHub Actions：
1. 用户不需要本地装 Node.js、配环境，也不需要买服务器；
2. 点击仓库右上角的 **Fork**；
3. 在自己 Fork 的仓库 Settings -> Environments 里填入 4 个 Cloudflare 密钥；
4. 点击 **Actions -> Run workflow**，GitHub Actions 就会自动编译前端和 Hono Worker，一分钟内直接把专属运维面板免费上线到用户自己的 Cloudflare Pages 上。

**交付门槛降到了极致，Fork 变成了用户的“一键安装包”。** 每一个 Fork，都代表着一个真实部署上线的面板实例。

---

## 4. 两个月的功能树演进：从单点到 14 个模块

在解决完多账号基础切换和 Worker 部署之后，在随后的两个月里，我根据自己和社区的需求把功能一步步扩充完整：

![CF Manager 功能模块全景](https://i.ibb.co/jPzCnNw6/cf-manager-modules-1.jpg)

1. **跨账户 Workers / Pages 批量运维**：可视化表单替代复杂的 JSON 配置，支持一键把同个脚本跨账号分发部署；
2. **内置 AI 工作台与 OpenAI 兼容网关**：Workers AI 免费推理额度可视化，并暴露 `/v1/chat/completions` 接口，方便本地 ChatBox / Continue 等插件直接连接；
3. **统一存储管理**：KV 键值管理、D1 可视化 SQL 查询、R2 桶文件上传/预览；
4. **内置应用商店（Catalog）**：聚合了 65+ 常见开源 Workers/Pages 模板，点一下就能直接拉取并部署到指定账号；
5. **浏览器渲染（Browser Rendering）**：跟进集成了 Cloudflare 最新的 Kitesurf 引擎，支持快照、Markdown 与 PDF 提取。

---

## 5. 社区驱动的高频迭代：16 个 Release 里的故事

从 `v1.0.0` 到现在的 `v2.0.2`，累计发布的 16 个版本基本都是被 Issues 里的真实反馈推着走的：

- **移动端与暗黑模式（#15 / #20）**：用户反馈用手机看仪表盘时表格挤压变形 -> 熬夜重构 UI，重写 Flex 响应式布局，全站支持明暗主题无缝切换；
- **多语言 i18n 支持（#19）**：收到海外开发者的反馈 -> 引入 `vue-i18n`，手翻了 1052 个中英文词条；
- **官方权限改版应急（#39）**：Cloudflare 官方后台改版权限体系，导致新建 Token 频繁报错 -> 连夜核对官方最新 API，整理出中英双语的详细 Token 权限最小集文档；
- **渲染引擎增强（#38）**：迅速跟进支持 Cloudflare Kitesurf 浏览器渲染引擎。

---

## 6. 复盘体会

回顾这两个月，我有三点最核心的感悟：

1. **最痛的需求往往来自真实的日常**：自己天天在用、切号切到抓狂，才会知道做成什么样最舒服；
2. **拥抱平台生态做“原汤化原食”**：Cloudflare 的生态有其独特文化，顺应用户的 Serverless 习惯做零成本部署，比强推 Docker 要有效得多；
3. **把交付做简单，别人才会留下来**：把复杂的部署浓缩成一次点击，就是最好的产品增长点。

感谢 LINUX DO 社区里最开始提出建议的朋友们，感谢每一个点过 Star、按过 Fork、提过 Issue 的人。

CF Manager 还会继续往前迭代，欢迎随时提需求和吐槽！

---

- **项目开源地址**：[https://github.com/hefy2027/cf-manager](https://github.com/hefy2027/cf-manager)
- **在线体验 Demo**：[https://mgrcf.pages.dev/admin/](https://mgrcf.pages.dev/admin/)（演示密码：`cfmgrbest`）

---

我是 AI非与，一尾随性游弋的鱼。
