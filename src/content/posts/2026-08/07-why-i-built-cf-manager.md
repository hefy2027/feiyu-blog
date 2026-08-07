---
title: "一个面板管完 Cloudflare 全家桶：多账户、DNS、AI、渲染全搞定"
published: 2026-08-07
description: "从多账户切换的日常崩溃，到 14 个功能模块一点点长出来的过程——一个 Cloudflare 多账户统一管理面板的开发故事。"
image: "https://i.ibb.co/bRLdvh3Y/why-i-built-cf-manager-cover.png"
tags: ["Cloudflare", "CF Manager", "开源", "运维", "开发故事"]
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
slug: "why-i-built-cf-manager"
prevTitle: ""
prevSlug: ""
nextTitle: ""
nextSlug: ""
---

## 我是怎么被 Cloudflare "套牢"的

说起来跟 Cloudflare 打交道也有几年了。

最早只是把它当 CDN 和 DNS 托管用——域名解析快、免费、还带 DDoS 防护，对小站长来说简直是白捡的。后来 Workers 出来了，发现能在边缘跑代码，就开始把一些轻量服务迁过去。再后来 Workers AI 开放，免费额度还大方，连 AI 推理都往上面跑了。

用得越多，账户也就越多——业务隔离、免费额度最大化、新功能灰度测试，理由一大堆。不知不觉就攒了三个。（别问我为什么知道，这就是 Cloudflare 的套路——免费的东西用着用着就上瘾了。）

## 三个账户，三套后台

然后问题就来了。

官方 Dashboard 功能是挺全的，但它设计的时候就没考虑过"一个人管多个账户"这个场景。Wrangler CLI 能打，但更适合写代码部署，不适合日常运维——看个配额、改条规则、清个缓存，你不会想打开终端敲命令。

市面上也有一些第三方工具，但要么只管 DNS，要么只管 Workers，没有哪个能把 Cloudflare 的核心产品线串起来。

所以有了 CF Manager。不是要替代官方 Dashboard，而是把**多账户日常高频操作收敛到一个界面里**——看一眼就知道所有账户的状态，操作一次就能跨账户执行。

![多账户管理](https://i.ibb.co/HLWSxVDy/why-i-built-cf-manager-accounts.png)

![多账户仪表盘](https://i.ibb.co/Y714zbgV/why-i-built-cf-manager-dashboard.png)

## 从 DNS 开始，一路长出来的功能树

最开始其实只想做一个 DNS 管理面板。

因为 DNS 是多账户场景里最烦人的——十几条记录散落在不同 Zone 里，改个 CNAME 得先找到它在哪个账户，再切过去操作。于是第一版只有一个功能：**多账户 Zone 汇总 + DNS 记录 CRUD**。

但做着做着就停不下来了。你能看到记录，自然想改 Zone 设置；改了设置，自然想清缓存；清了缓存，自然想暂停激活 Zone 看效果。于是 Zone 的**批量创建/删除、SSL/TLS 模式切换、缓存清除、暂停/激活**这些功能就顺着需求一路长出来了。

![DNS 管理](https://i.ibb.co/JWjZzNtP/why-i-built-cf-manager-dns.png)

后来加上了 **Workers & Pages 管理**。这是 Cloudflare 最核心的产品线，跨账户批量部署是刚需——你不可能同一个脚本手动往三个账户各部署一遍。（试过的都知道，三个标签页切来切去，部署到第二个就忘了第一个配了什么。）现在的部署流程是：多选目标账户 → 填脚本名 → 一键部署，失败账户还能单独重试。环境变量、KV/D1/R2 绑定、路由、自定义域名这些配置也都能在面板里直接改，不用打开 wrangler.toml。还有一个实用的细节：**重部署时可以只更新配置**——如果你只是改了个环境变量，后端只调 secrets API 不重传代码，快很多。

![Workers 管理](https://i.ibb.co/7dy6ptL4/why-i-built-cf-manager-workers.png)

![部署配置](https://i.ibb.co/5XXZsB0D/why-i-built-cf-manager-deploy-config.png)

**存储管理**是配套基建。KV 键值增删改查、D1 直接写 SQL 改表结构、R2 文件上传下载预览——你不用离开面板就能完成存储层的日常操作。

![存储管理](https://i.ibb.co/b5YZdPC0/why-i-built-cf-manager-storage.png)

再往后是**隧道和回源**。Cloudflare Tunnel 是个好东西，但配置 Ingress 规则（域名 → 服务映射）的时候要在 JSON 里手写一堆 `hostname`、`service`、`originRequest`，容易拼错。我做了个可视化编辑界面，子域名拆分、协议选择、端口配置，六列直观编辑。还有一键回源向导：新建或复用 Tunnel → 自动创建 DNS CNAME → 配置 Ingress，三步搞定。

![隧道管理](https://i.ibb.co/tTQzs1Tv/why-i-built-cf-manager-tunnels.png)

**规则引擎**算是进阶功能。Cloudflare 的 Rulesets API 功能很全，但上手门槛也高——回源、URL 重写、请求头/响应头转换、缓存、防火墙、限速、重定向，八种规则类型，API 格式各不相同。我做了两层：默认是**结构化表单**（小白模式），下拉选规则类型，填几个关键参数就行；需要精细控制时切到**高级模式**，直接写 JSON。还内置了表达式生成器——选匹配类型、填子域名和路径，自动生成 Cloudflare 表达式，不用去翻文档查语法。

![规则引擎](https://i.ibb.co/6czTbKL5/why-i-built-cf-manager-rules-engine.png)

## AI 和渲染：最让我兴奋的两个模块

前面那些是"运维刚需"，AI 工作台和浏览器渲染才是真正好玩的。

Cloudflare Workers AI 其实很香——免费额度大方，模型覆盖广，从对话到文生图到语音合成到翻译都有。但官方没有一个统一的调试界面，你得自己搭 API 调用，想多账户轮换还得自己写调度逻辑。

AI 工作台把这些全塞进了一个界面：**对话、文生图/图生图、TTS 语音合成、翻译**四个 Tab 一键切换，自动多账户调度，哪个账户额度充足走哪个。还做了 Prompt Caching 感知的神经元计费——缓存命中的 token 按约 1/5 价格算，跟官方计费逻辑对齐。每张生成的图片、每段合成的语音都会显示实际消耗的神经元数（⚡ neurons），让你对用量心里有数。

![AI 对话](https://i.ibb.co/qMLG3kxJ/why-i-built-cf-manager-ai-chat.png)

![AI 文生图](https://i.ibb.co/k27Tj2NV/why-i-built-cf-manager-ai-image.png)

更实用的是它对外暴露了一套 **OpenAI 兼容 API**：`/v1/chat/completions`、`/v1/images/generations`、`/v1/audio/speech`、`/v1/translations`、`/v1/models`，流式和非流式都支持。这意味着你可以把 CF Manager 当作本地工具链的 AI 后端——Cursor、Continue、Aider 这些工具配个 base_url 就能用，完全走 Cloudflare 的免费额度。当然，这个接口仅限内网本地调试，不是对外服务。

**浏览器渲染**是另一个实用的模块。Cloudflare Browser Rendering 可以远程控制无头浏览器，做截图、生成 PDF、提取链接这些事。我封装了五种模式：截图、HTML 内容提取、Markdown 转换、PDF 生成、链接提取，内置令牌桶限流和配额管理。用来做网页截图、文章转 PDF、批量链接采集都很方便。安全方面也做了 SSRF 防护，不会被人利用去扫内网。

![浏览器渲染](https://i.ibb.co/xS9Q4Mpq/why-i-built-cf-manager-browser-render.png)

## 双后端架构：两个场景，一套代码

CF Manager 支持两种部署方式：Docker 自建和 Cloudflare Pages 零成本部署。

这背后是两套完全不同的运行环境——Docker 版用 Express + SQLite，跑在你的 VPS 上；Pages 版用 Hono + D1，跑在 Cloudflare 的边缘网络里。但前端是**同一套 Vue 代码**，API 接口格式完全一致。

![双后端架构图](https://i.ibb.co/xqXrNFyx/why-i-built-cf-manager-arch.jpg)

关键设计是 `shared/` 共享数据层。AI 模型定价、Catalog Schema 这些"唯一真实来源"放在共享目录里，通过脚本自动同步到 backend 和 worker 两端，保证数据一致性。你切换部署方式，体验完全一样。

加密这块也踩了坑。Node.js 端用 crypto 模块做 AES 加密没问题，但 Worker 端没有 Node crypto，必须换 @noble/hashes 这套纯 JS 实现。两端算法要完全一致，不然存进去的密钥换一端就读不出来了。

多语言国际化也折腾了一番。vue-i18n 本身不难用，但 1000+ 个词条的提取、翻译、维护是个体力活。有些 Cloudflare 专有名词（比如 "Zone"、"Ingress"、"Ruleset"）在中文场景下要不要翻译也纠结了很久——最后决定保留英文术语，界面文案用中文，避免翻译后反而增加理解成本。（你想象一下把 "Ingress" 翻成"入口"，把 "Ruleset" 翻成"规则集"，用户第一反应肯定是"这啥？"）

还有一个容易被忽略但实际很重要的东西：**网络出口管理**。多账户场景下，不同账户走不同的出口 IP 能让访问更稳定。CF Manager 支持全局网络出口配置，也支持**账户级独立配置**——每个账户可以绑不同的出口 IP。还集成了 Resin 代理池，配置后自动为每个账户生成 sticky IP，一个账户一个稳定出口，互不干扰。优先级是：账户专属 > Resin 代理池 > 全局配置 > 直连。

## 踩过的坑

说几个印象深的。

**SSRF 漏洞**。早期版本 Worker 部署功能里直接用了裸 `fetch(url)` 去拉脚本文件，被北邮网安学院的同学提了个安全报告——如果有人传一个内网地址，面板就会去请求内网资源。后来做了完整的 ssrfGuard：协议白名单只放 HTTPS、拒绝环回和私网 IP、逐跳重定向校验、Content-Type 检查、响应大小限制 5MB，双后端对称实现。安全这事，永远不能嫌麻烦。

**Worker 端加密算法的兼容**。前面提过了，Node crypto 和 Web Crypto API 是完全不同的体系。在 Worker 端做 AES-GCM 加密，得用 @noble/hashes 重新实现一遍，还得保证加密结果跟 Node 端完全一致。不然账户密钥存进去，换个部署方式就读不出来了。

**国际化词条维护**。1052 个词条，中英文各一份。每加一个新功能，就要同步更新两个语言包。后来养成了习惯：写代码的时候就顺手把 i18n key 加好，攒到一定量再统一翻译，比事后补轻松很多。

## 还在路上

CF Manager 已经迭代了十几个版本，最近刚发了 2.0。AI 图片生成、语音合成、翻译整合进了统一工作台，加了双语界面，Zone 管理也从简单的 DNS 记录扩展到了完整的生命周期管理。

应用商店是另一个在发育的方向——内置了 Catalog 模板市场，支持第三方源，可以一键部署 Workers/Pages 应用。配合独立的 [cf-store](https://github.com/hefy2027/cf-store) 模板仓库，理论上可以把"发现 → 部署 → 管理"这条链路完全打通。

![应用商店](https://i.ibb.co/TDNzL3XV/why-i-built-cf-manager-store.png)

如果你也管着多个 Cloudflare 账户，或者在折腾 Workers AI 和浏览器渲染，不妨试试。项目开源在 [GitHub](https://github.com/hefy2027/cf-manager)，Docker 一行命令拉起，或者 Fork 到自己的 Pages 上零成本部署。

有什么想法或建议，欢迎提 issue，一起把这个工具做得更好用。

---

> 关注公众号「**AI非与**」，后台回复「**cf-manager**」获取项目地址、在线演示与部署文档。

我是 AI非与，一尾随性游弋的鱼。
