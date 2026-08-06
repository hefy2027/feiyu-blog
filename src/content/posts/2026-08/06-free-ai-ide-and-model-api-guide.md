---
title: "公司逼我用免费 AI，我顺手盘出这份当前还能用的清单"
published: 2026-08-06
description: "公司说能用免费 AI 就用免费 AI，这篇就是把这句话落地的清单——截至 2026-08 还真正免费用的编码 IDE 和模型 API 都在这里，哪些是坑也一并标了。"
image: "https://i.ibb.co/TDW2940L/free-ai-ide-and-model-api-guide-cover.png"
tags: ["AI", "免费", "工具", "API"]
category: "工具"
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
slug: "free-ai-ide-and-model-api-guide"
prevTitle: ""
prevSlug: ""
nextTitle: ""
nextSlug: ""
---

老实说，AI 编码工具这半年比模型变得还快。我前阵子还在一个工具上写得好好的，某天醒来额度直接没了，才意识到这事儿真的不靠谱（别问我怎么知道的）。

起因是公司一句话：能用外部免费 AI 就用外部免费 AI，别动不动就走内部付费通道。要求好提，真落地才知道坑有多少——免费额度在哪、哪些模型真的免费用、API 怎么拿。这篇就是把这条要求落到实处：把截至 2026 年 8 月还能免费用到的 AI 编码 IDE 和模型 API 列出来，不免费的不写，只是"很便宜"的也不写，只列真免费用的。每个都尽量写出到底能用哪些模型，方便你照着选。

先分类，再细说。

## 先分个类

免费拿到 AI 编码能力，基本就三条路：

1. 自带免费额度的 IDE：注册登录就用，厂商替你出模型钱，里面直接能选免费模型。
2. 开源且内置免费模型的编码工具：软件免费，里面就能直接调到免费模型，不用自己另买 key。
3. 免费模型 API：白嫖调大模型，可以直接接给上面的开源工具，也能自己写代码调。

下面挨个说，每个都标了能免费用哪些模型。

## 一、自带免费额度的 AI IDE（注册即用）

这几种最省事，打开就能写，模型直接在界面里切。

> 腾讯能跨产品攒积分（比如 WorkBuddy 的积分能通到 CodeBuddy），比海外那些 IDE 实在。

### CodeBuddy（腾讯）

注册登录就到账。混元 Hy3 限时免费到 2026-08-31，同生态的 WorkBuddy 每天签到给 100 积分、做新手任务还能拿更多，积分两边通用。

我实测的内置模型（截图为准）：

- 腾讯混元：Hy3（限免）、混元代码大模型
- 智谱 GLM：GLM-5.2（夜间折扣）、GLM-5.1、GLM-5v-Turbo
- Moonshot：Kimi-K3、Kimi-K2.7-Code、Kimi-K2.6
- MiniMax：MiniMax-M3
- DeepSeek：DeepSeek-V4-Flash、DeepSeek-V4-Pro
- 还有 `Auto` 自动路由

![CodeBuddy 内置模型列表](https://i.ibb.co/gQqksvW/codebuddy-models.png)

新用户每月 500 额度。除了 Hy3 限免，其余都吃积分，不过积分靠签到就能白拿，等于不花钱。

### JoyCode（京东云）

限时免费，每月大约 1 万积分，到 joycode.jd.com 下载登录就能用。内置模型：JoyAI-Code-1.5、MiniMax-M3、MiniMax-M2.7、Kimi-K2.6、GLM-5.1、GLM-5、DeepSeek-V4-Pro、Doubao-Seed-2.0-pro（含 Auto 自动路由）。

![JoyCode 内置模型列表](https://i.ibb.co/nHyy4rg/joycode-models.png)

### CatPaw（美团）

美团自研的 LongCat 和 GLM-5.2 免费用，支持多模型混合调用，到 catpaw.meituan.com 下载。

> 注意它是按对话次数算的，不是按 token。新用户给 500 次对话，比按 token 计费耐用不少，再配上 feedback-angel 能撑更久。

![CatPaw 内置模型列表](https://i.ibb.co/ym65j740/catpaw-models.png)

### Qoder（阿里）

国内 CN 版个人社区版免费，内置 Qwen 全系列（Qwen3、Qwen3-Coder、Qwen3.8-Max），轻量模型里也有 GLM-5、Kimi-K2.5。

> 正好赶上 Qoder 一周年加上 Qwen3.8-Max 上线：新注册能领 800 次 Qwen3.8-Max 免费调用，下单再叠 2000 次，错峰时段 5 折。

用阿里云主账号登录，VS Code / JetBrains 插件或 Qoder IDE 都行。国际版免费额度少得可怜，这篇说的都是 CN 版。

![Qoder 一周年 × Qwen3.8-Max 限时活动](https://i.ibb.co/BHrrgXX9/qoder-qwen38max-event.png)

> 免费额度和能用的免费模型随时在变，一切以各官网的 Pricing / 模型列表页为准。

## 二、开源免费的编码工具（怎么 0 元用起来）

这类软件本身免费开源，要不要花钱，看你接的模型：接它俩自带的免费模型就不花钱，接你自己的付费 key 才花钱。

- OpenCode 和 Cline 都内置了免费模型：装好或登录之后，模型列表里直接就有，开箱即用。

### OpenCode（终端 Agent，开源）

登录 opencode.ai/zen（用 GitHub 登录）就能用。Zen 免费池现在的模型：

- North Mini Code Free（Cohere，30B / 3B）
- LongCat-2.0 Free（美团，1.6T / 48B）
- Ling-3.0-flash Free（蚂蚁百灵，124B / 5.1B）
- Laguna S 2.1 Free（Poolside，118B）
- DeepSeek V4 Flash Free
- Big Pickle Free
- Nemotron 3 Ultra Free（NVIDIA）

![OpenCode Zen 免费池模型列表](https://i.ibb.co/9kpDYQDm/opencode-models.png)

### Cline（VS Code 插件，开源）

VS Code 插件，装好就用。自带限时免费模型（单独算，不吃 ClinePass 额度）：deepseek/deepseek-v4-free、poolside/laguna-s-2.1-free、stepfun/step-3.7-flash-free。

![Cline 内置模型列表](https://i.ibb.co/mrHvP0jF/cline-models.png)

> OpenCode 和 Cline 都自带一部分免费模型，装好或登录就能直接用，不用另外买 key。

> 想图省事直接用 OpenCode，自带免费池上车即用；想自由一点就 Cline 配第三类的免费 API，一样不用花钱。

## 三、免费模型 API（怎么白嫖调大模型）

这类的 API 是前面那些工具调用模型的来源。下面每家都不用花钱（或者新用户送的额度够用很久），顺手列出具体能白嫖的模型。

### 开箱即用的免费 API（注册 / 拿 key 即用）

> 这几家只要注册拿 key，不用自己部署。建议多备几个 key 换着用，单平台限流太常见了。

### OpenRouter

注册就得一个 key。免费池的模型都是 `:free` 变体（输入、输出都是 $0 / 百万 token，截至 2026-08）：

- nvidia/nemotron-3-ultra-550b-a55b:free（NVIDIA，1M 上下文，编码首选）
- nvidia/nemotron-3-super-120b-a12b:free（NVIDIA，1M 上下文）
- google/gemma-4-31b-it:free（Google，262K，多语言 / 通用，能看图）
- google/gemma-4-26b-a4b-it:free（Google，262K，轻量通用）
- cohere/north-mini-code:free（Cohere，256K，写代码专用）
- openai/gpt-oss-20b:free（OpenAI，131K，轻量编程 / 推理）
- inclusionai/ling-3.0-flash:free（蚂蚁百灵，262K）
- poolside/laguna-s-2.1:free / poolside/laguna-xs-2.1:free（Poolside，262K，编程 Agent）
- nvidia/nemotron-3-nano-30b-a3b:free、nvidia/nemotron-nano-12b-v2-vl:free、nvidia/nemotron-nano-9b-v2:free、nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free、nvidia/nemotron-3.5-content-safety:free
- 懒得指定模型就用自动路由 openrouter/free

限额大概 20 RPM、每天约 200 次，超了返回 429，按模型分别计数、每天重置。免费模型清单以 OpenRouter 模型页的免费筛选器为准。

![OpenRouter 免费模型列表](https://i.ibb.co/BKT2790W/openrouter-models.png)

### Cloudflare Workers AI

Workers Free 计划每天给 10,000 Neurons，到 Cloudflare 控制台拿 API token。50 多个模型，兼容 OpenAI 格式，主要有这些系列：Llama（llama-3.2-1b/3b/11b-vision-instruct、llama-3.1-8b/70b-instruct、llama-4-scout-17b-16e-instruct）、Mistral（mistral-7b、mistral-small-3.1-24b）、DeepSeek（deepseek-r1-distill-qwen-32b）、Qwen（qwq-32b、qwen2.5-coder-32b-instruct、qwen3-30b-a3b-fp8）、Gemma（gemma-3-12b-it、gemma-4-26b-a4b-it）、granite-4.0-h-micro、gpt-oss-20b/120b、nemotron-3-120b-a12b、glm-4.7-flash 等等。

不过 kimi-k2.6、kimi-k2.7-code、glm-5.2 要 Workers Paid 才给用，免费档没有。

![Cloudflare Workers AI 模型列表与免费额度](https://i.ibb.co/LDz99FVM/cloudflare-workers-ai-models.png)

### NVIDIA NIM

用 NVIDIA 开发者账号拿 nvapi- key，Free Endpoint 大概 40 RPM。能用的模型：GLM-5.2、MiniMax-M3、Kimi-K2.6、DeepSeek-V4-Flash、DeepSeek-V4-Pro、Qwen3-Next-80B-A3B-Instruct 等等，更多去官网看。

![NVIDIA NIM Free Endpoint 模型](https://i.ibb.co/x8H6kP74/nvidia-nim-models.png)

### 商汤科技 SenseNova（日日新）

Token Plan 免费公测，到商汤开放平台注册就给额度，兼容 OpenAI 格式。能用 SenseNova 日日新系列（比如 SenseNova 6.7 Flash-Lite），文字 / 图片 / 视频都能处理。具体额度以官网为准。

![商汤 SenseNova 模型列表](https://i.ibb.co/4RzmrBJ9/sensenova-models.png)

### Agnes AI

官方说永久免费、不限量，注册就给 API key。Agnes / Echo / Pavo 系列覆盖了文字、图片、视频（比如 Agnes 2.5 Flash），兼容 OpenAI 格式。具体范围看官网，政策变了以公告为准。

![Agnes AI 模型列表](https://i.ibb.co/8gcgrW02/agnes-ai-models.png)

### 免费算力：自己部署模型

> Modal 给的是免费算力，不是现成的 API，适合想自己部署开源模型的人（比如用 vLLM 跑 DeepSeek / Llama）。

### Modal.com

每月 30 美元免费计算额度（Free Tier），注册就到账。它不提供托管模型 API，得自己用 vLLM 之类的把 DeepSeek / Llama 等开源模型跑起来，在免费额度内跑就不花钱。

![Modal 控制台与免费额度](https://i.ibb.co/DfpsZ7vG/modal-dashboard.png)

另外推荐个聚合站：free-model.com 整理了 147 多个验证过的免费 LLM API，还能直接生成 Claude Code 这些客户端的配置，找免费源挺方便。

![free-model.com 免费 API 聚合站](https://i.ibb.co/dw3vGNcx/freemodel-screenshot.png)

## 避坑

- 免费层和能用的免费模型都有时效性：送的额度、免费档、能免费用的模型说变就变，真别把生产环境绑死在免费额度上（到时候哭都来不及）。
- 密钥也算是 key：免费 API key 别提交到 GitHub、别发到图床、别截图外传。用 .env 管，仓库里加 .gitignore。
- 别拿免费额度干重活：大批量和超长上下文一起上，免费层很快就被限流。

## 小结 & 行动清单

想不花钱用上 AI 编码，照下面这个顺序来就行：

1. 先装一个自带免费额度的 IDE：国内用户直接上 CodeBuddy / CatPaw / JoyCode / Qoder CN，开箱即用，模型随便选。
2. 想更自由就上 Cline 或 OpenCode（开源免费，自带或可接免费模型），再接 OpenRouter 或 Workers AI 的免费模型。
3. 自己写代码调模型，就去 OpenRouter / Cloudflare Workers AI / NVIDIA NIM / 商汤 SenseNova / Agnes AI 领个免费 key。

哪天某个停了，就换上面列的另一个。免费的东西，多备几个后手总没错。

关注公众号「**AI非与**」，后台回复「**免费AI**」获取文中提到的全部工具与模型清单（含每个平台的免费额度细节和申请入口），省得你一个个去翻。

我是 **AI非与**，一尾随性游弋的鱼。
