---
title: CF大善人没做好的事，被一个开源项目干成了
published: 2026-08-02
description: '多账号切换、配额监控、批量部署……这些 Cloudflare 官方后台做不到的事，它全干了。而且开源、免费、一个页面管所有。'
image: 'https://i.ibb.co/RpmsKQHx/cf-manager-panel.png'
tags:
  - Cloudflare
  - CF Manager
  - 开源
  - 工具
category: Cloudflare
draft: true
lang: 'zh-cn'
slug: cf-manager-wechat
---

> 手里好几个 Cloudflare 账号，每次查配额、改 DNS、部署 Worker 都要来回切换后台，切到怀疑人生。最近在 GitHub 上翻到一个开源项目，把 Workers、Pages、DNS、KV/D1/R2、AI 推理、浏览器渲染全塞进一个面板，还支持多账户同时管。用了一阵，值得聊聊。

## 多账户的痛，谁用谁知道

说实话，我手里 Cloudflare 账号有点多。

一个放个人博客的域名，一个跑 Workers AI 做各种实验（翻车居多），一个挂着公司的 DNS，还有一个专门用来跑临时脚本。每次想干点啥——查个配额、改条 DNS 记录、部署个 Worker——流程是这样的：

打开 Cloudflare 后台 → 哦不对这是上一个账号 → 退出 → 重新登录 → 找到对应功能页 → 操作完 → 再切回来。

一天下来，光切换账号就能把耐心耗光。

更要命的是跨账号操作。比如「把同一个 Worker 部署到三个账号」或者「看一眼哪个账号的 AI 配额快爆了」，官方后台根本没有这种能力。你只能一个一个登进去看，手动记在小本本上（笑）。

![切账号切到怀疑人生](https://i.ibb.co/KzfBxqBB/cf-manager-pain.png)

> 盯着浏览器里七八个 Cloudflare 标签页发呆时，我总在想：**这事不该这么搞。**

然后我在 GitHub 上翻到了 CF Manager。

## 这是个啥？

简单说：**一个开源的多账户 Cloudflare 运维面板。**

> 项目地址和在线演示链接文末统一放，也可以直接 GitHub 搜「cf-manager」。

它把 Cloudflare 后台里那些散落各处的功能——Workers、Pages、DNS、KV、D1、R2、AI 推理、浏览器渲染——全塞进了一个面板。而且支持同时管理多个账号，不是那种「一次只能看一个」的半吊子多账户。

![CF Manager 功能模块全景](https://i.ibb.co/jPzCnNw6/cf-manager-modules-1.jpg)

下面说说几个我实际用下来觉得真正解决问题的地方。

## 实际用下来，这几个功能最香

### 配额总览——打开就知道谁快爆了

这是我打开最多的页面。

仪表盘上，所有账号的 Workers 请求数、AI 神经元用量、浏览器渲染次数，全用进度条列出来。谁快超额了、谁还有富余，扫一眼就清楚。

![多账户配额总览](https://i.ibb.co/d0313P3h/cf-manager-dashboard.png)

Cloudflare 后台你得一个账号一个账号进去看，CF Manager 把它们全拉平了。就这一点，已经值回票价。

### 批量部署 Worker——终于不用切三次号了

写了个 Worker 脚本，想同时上到三个账号？以前是：切号→上传→切号→上传→切号→上传。现在勾选三个账号，点一下「批量部署」，搞定。

![Worker 部署弹窗](https://i.ibb.co/fGGPNRCy/cf-manager-worker-deploy.png)

更狠的是它还支持从 URL 拉取脚本批量部署（当然有 SSRF 防护），以及从模板商店一键部署——对，就是下面要说的这个。

### 应用商店——模板一键部署，真的爽

这个功能是 1.3.5 版本加的，说实话，是整个项目最让我惊喜的地方。

CF Manager 内置了一个 Catalog 模板市场，长得跟应用商店差不多。每个模板里预定义好了 Worker/Pages 的代码源、绑定哪些资源（KV/D1/R2）、环境变量、定时任务——整套配置。

![模板商店](https://i.ibb.co/GvMr6807/cf-manager-store-list.png)

你要做的就是：选模板 → 选目标账号 → 填上必要的密钥（比如 API Key） → 点部署。

然后呢？下载代码、创建 Worker、配绑定、上传静态资源、注册 cron——全自动跑完。

![AI 推理部署弹窗](https://i.ibb.co/93Hq6xnw/cf-manager-store-deploy.png)

而且部署前会跑一轮**预检**：检查 Worker 是不是已经存在、配置有没有冲突、Secrets 缺不缺。不会傻乎乎地把已有部署给覆盖掉，这个细节挺用心的。

> 模板市场支持自定义源，团队可以搭私有模板仓库，内部共享部署配方。这其实很适合小团队用。

### AI 推理 + OpenAI 兼容接口

CF Manager 还封装了 Workers AI，支持全模型流式对话，Reasoning 思考过程也能可视化。

![AI 推理对话界面](https://i.ibb.co/kV4j2dTd/cf-manager-ai.png)

但真正实用的是它暴露了一个 OpenAI 兼容的 `/v1/chat/completions` 接口。啥意思呢？Cherry Studio、ChatBox、LobeChat 这些客户端，只要支持自定义 OpenAI Base URL，填上 CF Manager 的地址，就能直接用 Cloudflare 的 AI 模型了。

![Postman 调用 OpenAI 兼容接口](https://i.ibb.co/PvWWj4kS/cf-manager-postman.png)

多账户调度是自动的：一个号配额用完了自动切下一个，还做了 Prompt Caching 感知的软粘性路由来提升缓存命中率。细节拉满。

> ⚠️ 这个接口**仅限内网本地调试用**，别暴露到公网对外提供服务，不然可能违反 Cloudflare 服务条款。

## 架构上有个挺妙的设计

CF Manager 的架构有点意思——它搞了个**双后端对称架构**。

同一套业务逻辑，分别用 Express（Docker 部署）和 Hono（Cloudflare Pages 部署）各实现了一遍，共享一个 Vue 3 前端。

![CF Manager 双后端架构](https://i.ibb.co/bjSWXwwp/cf-manager-arch.jpg)

为啥这么折腾？因为两种部署场景确实不一样：

- **Docker 版**：适合自己有服务器的人，功能最全，定时任务、代理转发啥的都有。
- **Pages 版**：零成本，Fork 仓库、配几个 Secret 就能跑。不想维护服务器的话，选这个。

两端的路由、服务、中间件功能对称，新增功能同步改。共享配置（AI 模型定价、Catalog Schema 这些）放在 `shared/` 目录，脚本同步到两端，不用两边各维护一份。

说白了，这个设计让项目既能零成本在 Cloudflare 上跑，也能自己搭服务器做深度定制。挺聪明的。

## 安全方面：该想到的都想到了

做这种涉及 API Key 的工具，安全问题绕不开。CF Manager 在这块下了不少功夫：

**凭证加密**：所有 API Token / Global API Key 用 AES-GCM 加密后存数据库。密钥是用户自己设的 `ENCRYPTION_KEY`，数据库就算被人拖走了，没有密钥也解不开。

**SSRF 防护**：从 URL 拉脚本部署、Catalog 源拉取，都会过 `ssrfGuard` 校验——只允许 HTTPS、拒绝私网/环回地址、重定向逐跳检查、Content-Type 限制、响应大小限制。一层套一层。

> 说到 SSRF，项目 CHANGELOG 里记了个小故事：1.1.2 版本时，北邮网安学院的两位同学负责任地披露了一个 SSRF 漏洞，项目方当天就修了还公开致谢。开源社区这种安全协作，挺让人踏实的。

**路径伪装**：根路径给你看一个假的 nginx 欢迎页，真正的管理界面藏在 `/admin/` 下。扫端口的人不知道路径，还以为就是个普通 nginx。

**认证加固**：没配 `API_SECRET` 的时候不会静默跳过认证了，而是生成随机临时密码并发告警；演示账户受保护，不能删也不能改。

**审计日志**：所有操作可追溯，还能按操作类型和日期筛。出了事能查是谁干的。

## 怎么部署？最简单的办法

### Fork 一键部署（零成本）

1. 给项目点个 Star（顺便的事），然后 Fork 仓库
2. 在 Fork 仓库的 Settings → Environments 里建个环境，加 4 个 Secret：`CF_API_KEY`、`CF_EMAIL`、`ENCRYPTION_KEY`、`API_SECRET`
3. Actions 里跑「Deploy to Cloudflare Pages (Secrets)」工作流
4. 部署完访问 `https://你的项目名.pages.dev/admin/`

全程浏览器操作，不用装任何东西。对不想折腾的人来说够友好。

> Pages 手动部署和 Docker 部署的详细步骤见项目 `docs/deploy.md`，文档写得很清楚。

## 说在前面的合规提醒

写到这儿必须认真说一句：**这个工具仅供学习、技术研究、以及你自己合法拥有的账户运维使用。**

- 遵守 Cloudflare 服务条款，**别**拿它对外提供公共 AI/渲染中转、转售或分摊算力。
- 只添加你自己或已明确授权的账户，别碰别人的。
- 多账户切换是给你自己多个号用的；批量挂账号自动分摊 AI 配额可能违规，不建议搞。
- OpenAI 兼容接口就内网本地调着玩，别暴露公网。

工具是中性的，怎么用是你的事。自己对自己负责。

## 最后

CF Manager 从 1.0 一路迭代到现在的 1.4.2，从最初只能管 Workers 脚本，慢慢扩展到 DNS、存储、隧道、规则引擎、AI、浏览器渲染、应用商店。项目还在持续更新，CHANGELOG 记得挺细。

如果你也跟我一样，被多账户切来切去烦得不行，真的可以试试。

项目地址和在线演示链接，关注公众号「**AI非与**」，后台回复「**cf-manager**」获取。部署文档在仓库 `docs/deploy.md` 里，跟着走就行。

有啥使用上的问题或者想法，评论区见。

觉得有用的话，点个「在看」，转给也在用 Cloudflare 的朋友。你们的支持是我继续写的动力。
