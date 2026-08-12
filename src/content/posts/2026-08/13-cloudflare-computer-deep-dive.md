---
title: "Cloudflare 疯了：要给每个 AI Agent 都发一台电脑？"
published: 2026-08-13
description: "Cloudflare Computer 宣称「Agent 需要的是电脑，不是容器」。本文拆解它的 Workspace 架构、read/write/exec 等能力、免费与付费边界，也聊聊官方没说的扩展性、FUSE 与安全代价，帮你判断它到底是不是你的那张牌。"
image: "https://i.ibb.co/wFnphFyk/cloudflare-computer-deep-dive-cover.png"
tags: ["AI", "Agent", "Cloudflare", "云端电脑"]
category: "技术解析"
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
slug: "cloudflare-computer-deep-dive"
prevTitle: ""
prevSlug: ""
nextTitle: ""
nextSlug: ""
---

## 一个让人后背发凉的瞬间

先讲个真事。

有位做 AI 应用的朋友，让 Agent 帮他跑点本地任务。问题来了：Agent 要读写文件，你不给它权限，它直接卡死；你真给了，它差点把他整个项目目录删光。

他想用沙箱把 Agent 隔开。本地 Docker 吧，太吃机器资源；云端沙箱吧，会话一结束状态全丢，下次又得从零搭环境、重新下载依赖、重新跑一半的进度。

这大概就是现在不少 Agent 开发者的两难：既不想让 Agent 碰到自己的真机器，又受不了一会儿一重建的「一次性环境」。

说白了，Agent 需要的不是一只用完即弃的容器，而是一个**能长期用、关了还能接着用的工作环境**。

## Cloudflare 的回答：给 Agent 一台「电脑」

2026 年 8 月，Cloudflare 在 Agents Week 甩出了一个开源项目，叫 **Cloudflare Computer**（仓库在 [github.com/cloudflare/computer](https://github.com/cloudflare/computer)），口号很直白——"Give your agent a computer"（给 Agent 一台电脑）。

它背后的核心主张也很锋利："Your agent needs a computer, not a container"（你的 Agent 需要的是电脑，不是容器）。言下之意：别再假装每个 Agent 都非得配一台完整 Linux 机器了。

不过先泼盆冷水，免得被话术带偏。它叫「电脑」，技术本质其实是一个持久化的工作空间（Workspace），不是给人远程连桌面的云主机，而是面向程序调用的一整套「文件 + 可选执行环境 + 工具接口」。

那它比传统方案强在哪？一张对照表看明白：

| | 本地 Docker | 临时云端沙箱 | Cloudflare Computer |
|---|---|---|---|
| 状态持久性 | 有，但占本地资源 | 会话结束即丢 | 跨会话持久保存 |
| 成本 | 吃本地算力 | 重建开销大 | 算力按需、即用即走 |
| 隔离性 | 强 | 强 | 边缘隔离 + 权限可控 |

核心差异：前两者把「硬盘」和「CPU」绑死在一次短命的生命周期里，Computer 把「硬盘」单独拎出来，钉在了网络上。

## 它是怎么做到的

用个生活类比就好懂了。先看官方给的架构全景：

![Agent Harness 架构](https://i.ibb.co/4n4BZctr/cloudflare-computer-deep-dive-arch-harness.webp "用户发出指令后，Agent Harness（跑在 Isolate 里）按需调用 MCP、浏览器、或容器沙箱执行任务。来源：Cloudflare 官方博客")

**Workspace 就是这台电脑的「硬盘」。** 它的权威状态存在 Cloudflare 边缘的 Durable Object 里（底层是 SQLite 数据库）。因为状态在边缘、不在某次运行的进程里，所以你断线、重启、关终端，再连上来，文件都还在。

**三种执行后端，相当于给这台电脑换「运行模式」：**

- **Container（容器）**：给你一整套真 Linux 用户空间，能跑 npm、原生二进制、真实网络。能力最全，但也最贵，Cloudflare 自己说它目标只覆盖不到 10% 的工作。
- **Isolate Shell（隔离 Shell）**：在一个轻量的 Worker 里跑 bash，没有完整 Linux 假设，启动最快、最便宜，适合文本处理类任务。
- **Isolate JS（隔离 JavaScript）**：在全新的 Worker 里跑单个 JS 模块，支持结构化输入输出，适合让 Agent 直接生成代码并执行。

所有这些后端共用同一个入口 `exec()`。模型会按任务挑最便宜、够用的那个；真需要原生二进制或完整 `$PATH` 了，再回退到容器。开发者不用操心「这次该起哪种环境」。Cloudflare 的设计目标，是让 Isolate + Container 的组合同时落在「快、便宜、安全」的甜区里：

![Fast / Cost Effective / Secure 维恩图](https://i.ibb.co/5gNSH7hW/cloudflare-computer-deep-dive-venn.webp "Isolate 处理大部分工作（快且便宜），Container 只在需要时兜底，组合后三者兼得。来源：Cloudflare 官方博客")

说到底，**状态（硬盘）永远钉在边缘，算力（CPU）按需即插即用、用完即走。**

## 它到底给你哪些能力（工具与命令）

讲完「硬盘」和「三种运行模式」，再看 Agent 手上到底有哪些家伙。Computer 把能力封装成一组标准工具，模型按需取用，开发者不用自己造轮子：

- **read / write / edit**：读文件、写文件、改文件里某一处。Agent 改代码、存笔记基本靠这三个。
- **ls**：列出目录里有什么，相当于在文件夹里扫一眼。
- **exec**：执行命令，是里面最灵活的一个。它背后接的就是前面说的三种后端——模型说「跑个 `npm install`」或「执行这段 JS」，exec 就把它派到合适的运行模式。
- **publish**：把产物发布出去（比如生成好的报告、网页），变成一条可访问的链接。

除了这套工具，Workspace 还直接给了 Agent 几个「原生技能」：

- **一套类文件系统的 API**（叫 `ws.fs`，用法接近 Node.js 的 `fs/promises`）：Agent 能像写普通程序一样 `await ws.fs.writeFile('/notes.md', ...)` 去读写自己的目录，不必绕道命令行。
- **内置 Git**：底层用 isomorphic-git，直接操作那套 SQLite 文件系统，不依赖 shell。clone、commit、push 都能做，所以代码 Agent 留下的不是临时文件，而是正经的 git 仓库。
- **R2 只读挂载 + Artifacts 发布**：能把对象存储挂进来当只读资料库，也能把生成结果直接发布成对外链接。

一句话概括 Agent 的操作面：**文件增删改查（read / write / edit / ls）+ 执行（exec）+ 发布（publish），外加 Git 和存储挂载**。接上 AI SDK 这套工具，Agent 就能真正「动手」而不是只动嘴。

## 它能干啥：四个 Agent 的画面

能力有了，落到真实场景看看：

**代码 Agent**：每个 Agent 对应一个独立工作空间，读仓库、改文件、跑测试、提交 Git。有意思的是，它的 Git 不依赖 shell，而是直接对那套 SQLite 文件系统做 clone/commit，所以留下的是可继续修改的真实目录，而不是一堆临时文件。

**研究 Agent**：把检索到的资料、摘要、表格都存进工作空间。下次再调用，不用重建上下文，上次攒的东西还在。

**数据处理 Agent**：上传文件 → 脚本清洗 → 生成报告 → 发布成链接。这里能用上 R2 只读挂载和 Artifacts 发布，把产物直接外送。

**多步骤流水线**：收集、处理、检查分属不同 Agent，但共享同一个受控文件区，各自按任务配执行能力。

贯穿这些场景的是一条链：**读取 → 生成 → 检查 → 发布**。Agent 第一次能在一个环境里「留下真正的东西」，而不是干完活拍拍屁股走人、什么都不剩。

下面是官方演示里一个 Agent 真实执行的过程：从 clone 仓库、列文件、读内容、webfetch、打补丁，到最后用 Container 跑 `npm install`，全程在同一个 Workspace 里完成：

![Agent 真实执行示例](https://i.ibb.co/gM6bk1Ty/cloudflare-computer-deep-dive-execution.webp "Agent 在同一 Workspace 中依次执行：ISOLATE_GIT clone → ISOLATE_ls → read → webfetch → apply_patch → CONTAINER npm install。来源：Cloudflare 官方博客")

## 为什么算一次范式转移

比「三种后端」更本质的，是那句**「文件 ≠ 执行」**的设计哲学：硬盘永驻边缘，CPU 即插即用。这恰恰是过去容器思路没解开的点。

旧范式下，每只 Agent 约等于一个常驻容器。可全球云算力根本撑不起「每用户每 Agent 一容器」的并发量级，真这么干，账单会先爆。

新范式则把**「大脑」（模型循环）和「手」（执行环境）彻底分开**。Computer 就是那双标准化的「手」，Agent 想用就用、用完就还，基础设施细节对开发者透明。

官方用一张图把这种演进说得很清楚：

![BEFORE / TODAY / NEXT 范式演进](https://i.ibb.co/jvMfR20x/cloudflare-computer-deep-dive-evolution.webp "BEFORE：所有东西塞进一个 Container；TODAY：Isolate Harness 与 Container Sandbox 分离；NEXT：Isolate 为主力，Container 仅在需要原生能力时兜底。来源：Cloudflare 官方博客")

对写代码的人意味着什么？你不用再自己管文件系统、不用反复重配沙箱，AI SDK 那套标准工具（read / write / edit / ls / exec）开箱即用。而且这不只是 Cloudflare 一家在走：行业整体都在往「多租户 Agent 托管」收敛，思路出奇地一致。

## 冷静的另一面：官方没说的几个问题

夸完得泼点冷水。上面这套叙事很美好，但官方博客只讲它能做什么，有几个绕不开的问题它不会主动摊开讲。

**第一，扩展性的账没算给你看。** 每个 Agent 一个 Workspace，底层是一个 Durable Object 实例；而 Agent 一旦爆量，Durable Object 实例数跟着爆炸。更现实的是那 10GB 存储上限是跟 Durable Object 共享的——你一个账号下所有 Workspace 加起来才这么多，大量 Agent 长期居留时，这块「硬盘」怎么分摊？官方一句「水平扩展」带过了，但持久化状态天然不好水平扩展，这才是真麻烦。

**第二，FUSE 挂载的体验落差。** Container 后端是靠 FUSE 把 SQLite 投影成真文件系统再挂进容器的。小文件读写没问题，可一旦碰上 `node_modules` 这种成千上万碎文件的场景，FUSE 的元数据开销就显出来了，往往比直接跑在真磁盘上慢。官方说「给 Agent 一台真 Linux」，但文件系统这一层是有代价的，别把它当成裸金属。

**第三，持久化是把双刃剑。** 官方把「状态跨会话保留」当卖点，但换个角度想：你给了 Agent 一个**长期据点**——它比一次性容器更难被「用完好清理」。权限、网络、审计如果不当初设计好，这个常驻工作空间就是个长期敞开的风险面，比「用完即焚」的沙箱更考验你的安全功底。

**第四，赛道里不是只有它一个。** 「给 Agent 一个隔离运行环境」是 2026 年最挤的赛道：E2B、Fly.io Machines、Vercel 的沙箱、甚至裸 Docker，都在做同一件事。Cloudflare 的差异化是「边缘 + Durable Object 持久化 + 三种后端统一」，但代价是**深度绑定 Cloudflare 全家桶**（Workers、Durable Objects、Containers、R2）。如果你不想被锁死在这套体系里，迁移成本得先掂量。

**第五，结论偏「Cloudflare 最优」。** 官方说目标是「容器只用于不到 10% 的工作」，这话成立的前提是你的任务恰好以轻量文件/JS 为主。一旦你的 Agent 重度依赖原生二进制、编译、GUI 类操作，那 10% 之外的大头反而成了常态，这时它和「直接给容器」的差距就没那么性感了。

说这些不是劝退，而是提醒：它是一手好牌，但是不是你的牌，得看你的场景、你的栈、你对锁定的容忍度。

## 它和「Computer Use」不是一回事

顺手澄清一个容易混的点，因为两者都带 computer 这个词。

Anthropic Claude、OpenAI Codex 讲的 **Computer Use**，是让模型去操控真实的桌面和软件界面，看屏幕、点按钮、填表单，本质是「拟人地操作 GUI」。

Cloudflare Computer 是给 Agent 一个**程序可调用的虚拟工作空间**，文件系统加执行后端，本质是「对内的基础设施底座」。

一个对外，一个对内，差了整整一个层级。下次看到「computer」先别激动，得看清它到底指的是哪一头。

## 冷静提醒：现在能上车吗

先把预期压住：**官方明确标注 PREVIEW ONLY（仅预览）**。API 不稳定，设计随时可能变，**当前不适合生产环境**。

### 免费还是付费：哪些能白嫖，哪些得上付费计划

Computer 本身没单独收费，但它躺在一堆 Cloudflare 平台资源上，这些资源有免费门槛。按底层规则捋一遍：

- **Workspace 的「硬盘」= Durable Object（含 SQLite 存储）**：Free 计划和 Paid 计划都能用。所以基础的持久化工作空间，免费账户就能开。
- **Isolate Shell / Isolate JS 两种后端**：跑在 Durable Object / 动态 Worker 上，同样 Free 计划可用。换句话说，**轻量的「跑段 bash、执行个 JS」这条路，免费就能试**。
- **Container 后端**：依赖 Cloudflare Containers 提供完整 Linux 运行环境，而 **Containers 仅限 Workers Paid（付费）计划**。想给 Agent 一整套真 Linux、跑原生二进制？这一步得先升级付费。

一句话：**免费账户能体验 Computer 的核心（持久化工作空间 + 轻量执行）；要上完整的真 Linux 容器，得 Worker Paid。** 当然别忘前提——整项目前还是 PREVIEW ONLY。

再给几个具体的现实约束，决定上生产前先想清楚：

- 存储上限大约 **10GB**，还跟 Durable Object 共享额度；
- 容器端的文件系统是内存承载的，装大 `node_modules`、解压大文件会比真磁盘慢；
- FUSE / WebSocket 这类同步机制带来 I/O 损耗风险，元数据繁重的场景尤其要留意。

还有一点负责任的文章都该提：**安全边界必须先设计**。你一旦给了 Agent 读写文件 + 执行命令的能力，目录权限、网络访问、操作审计就得提前规划好。否则它不过是把一个权限过大的自动化程序，从你本地挪到了云端，风险一点没少。

所以谁适合现在用？——被「状态总丢、又不敢给 Agent 碰本地文件」折磨的开发者，拿它做实验和原型最划算。

## 带走的三句话

1. Agent 的「工作环境」该是持久化的电脑 / 工作空间，不是用完就扔的容器。
2. Cloudflare 用它最擅长的边缘存储（Durable Object），把那块「硬盘」钉在了网络上。
3. 现在只是尝鲜期，别拿它扛生产；但「电脑而非容器」这个判断，值得你记下来。

---

我是 AI非与，一尾随性游弋的鱼。

## 参考资料

- Cloudflare 官方博客《Your agent needs a computer, not a container》：<https://blog.cloudflare.com/cloudflare-computer/>
- Cloudflare Computer 仓库（含 README、`docs/` 设计规格、`examples/` 可运行示例）：<https://github.com/cloudflare/computer>
- npm 包 `@cloudflare/computer`（安装与入口映射、fs / runtime 用法）：<https://www.npmjs.com/package/@cloudflare/computer>
- Cloudflare 官方博客（Agents Week 2026 系列）：<https://blog.cloudflare.com/>
- Durable Objects 文档（Free/Paid 均可用，含 SQLite 存储上限）：<https://developers.cloudflare.com/durable-objects/>
- Cloudflare Containers 文档（仅 Workers Paid 计划可用）：<https://developers.cloudflare.com/containers/>
