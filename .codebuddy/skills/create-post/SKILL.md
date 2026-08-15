---
name: create-post
description: Use when creating a new Firefly (Astro) blog post, drafting a technical article, or adding a blog post to this repository (e.g. "新建文章", "写一篇关于 X 的博客", "create a new post", "写草稿"). Automatically handles file paths, semantic slugs, front-matter, and subagent-delegated workflows.
---

# 新建文章（Firefly 博客）

## 概述

从零产出一篇成稿博客文章：先生成位置正确、front-matter 完整的 Markdown 骨架，再调研主题、给出大纲供确认、撰写正文，最后做图 / 去 AI 味 / 上传归档。弥补旧脚本 `scripts/new-post.js` 的不足（丢 `YYYY-MM/` 与 `DD-` 前缀、中文逐字拼音、无调研与正文）。

**技能依赖与目录说明**：流程中涉及的辅助能力均为外部 Agent Skill，统一位于用户目录 `~/.agents/skills/<skill-name>/SKILL.md`（Windows 环境为 `%USERPROFILE%/.agents/skills/<skill-name>/SKILL.md`）。主代理或子代理执行时，通过读取对应技能文件直接加载规范。

**上下文隔离原则**：重度检索、深度润色、绘图、长排版生成等**高上下文消耗任务必须指派子代理（Subagent）处理**，子代理就地操作文件或仅向主会话返回精简提炼结论，防止主对话 Context Window 膨胀。

编辑前先读 `references/schema.md` 了解 front-matter 字段。各步骤的详细子流程见对应 reference，**执行到该步再读入**，保持本清单始终在视线内。

## 何时使用

- 用户要求新建、添加一篇文章 / 草稿 / 博客内容。
- 用户给主题/标题，希望做成可发布的草稿。
- 用户要求将文章进行公众号排版或跨平台分发适配。

**不要**用于编辑已有文章、页面或其他非 post 内容类型（spec/dynamic 各自 schema）。

## 约定（必须遵守）

- **位置**：`src/content/posts/<YYYY-MM>/<DD>-<slug>.md`
  - `<YYYY-MM>` = `published` 年月；`<DD>` = `published` 日。
- **Slug（语义英文）**：仅 ascii，**按文章语义选取贴切英文单词**组成，不用拼音。文件名 slug 与 front-matter `slug` 一致，使 URL 与 `[[wiki-link]]` 解析到同一目标。
- **URL slug** 取自文件路径；**front-matter `slug`** 用于 wiki-link 解析——两者需相等。

## 工作流

1. **Grilling（明确方向，必须第一步执行）**：动手前**必须先读取并加载 `~/.agents/skills/grilling/SKILL.md` 技能**，由其提问确认主题定位、核心观点、目标读者、范围、风格深度，直至方向清晰（若用户已提供详尽大纲或明确诉求，可单轮收敛确认，避免过度打扰）。**禁止**用本地问题自行替代 grilling；只有当该技能确实无法加载（文件不存在 / 报错）时，才回退到 `references/clarify-direction.md`。其产出作为后续所有步骤输入。
2. **收集输入**：确认最终**标题/主题**（必填）。其余字段不询问、用默认值、由 AI 推断：发布日期=今天；`lang`=zh-cn；草稿=是（发布传 `--no-draft`）；封面=随机（`image:"api"`，指定传 `--image <url>`，无封面 `--image ""`）；标签/分类按内容自行创建或关联；`description` 据正文/大纲生成。
3. **生成语义 slug**：按文章语义取贴切英文单词，规则：小写、连字符、仅 ascii、精炼可读利于 SEO。例：「用 WorkerBuddy 上线站点」→ `workerbuddy-build-site`；「我的开发技能栈」→ `my-dev-skill-stack`；「开始写博客」→ `start-blogging`。
4. **运行脚本建骨架**：`--slug` 传英文 slug，并自行推断标签/分类传入。（**详见 `references/script-usage.md`**）
5. **调研主题（使用子代理，隔离检索上下文）**：
   - 派发 **调研子代理（Subagent）** 执行搜索与资料检索（利用 WebSearch/WebFetch、浏览器 MCP 或代码库探索）。
   - **子代理输入**：文章主题、核心观点、范围边界、需验证的事实清单。
   - **子代理输出契约**：仅返回**提炼后的核心论据、关键技术要点、权威数据与参考来源 URL 清单**（严禁将大段网页全文倒灌回主会话）。
   - 主代理接收精简结果，微调文章标签/分类。
6. **给大纲并请确认**：基于精简调研拟定结构（引言、核心章节、小结/行动建议），中文列出，**暂停等用户确认/修改**。确认前不写正文。
7. **撰写正文与配图**：
   - 确认大纲后，将占位内容替换为完整正文，据实引用来源，补全 `description`。
   - **站内内链注入**：扫描检索 `src/content/posts/` 下的已有文章，在正文中自然嵌入 1~2 处 `[[相关文章-slug|显示文本]]` 双向链接，优化站点内链互通与 SEO。
   - **配图/架构图生成（使用子代理）**：若需插图、架构图或流程图，派发**绘图子代理**。在 Prompt 中明确指派子代理读取对应技能文件 `~/.agents/skills/ai-image-generation/SKILL.md` 或 `~/.agents/skills/fireworks-tech-graph/SKILL.md`，图片生成后直接保存至文章同级目录 `src/content/posts/<YYYY-MM>/`，子代理仅向主会话返回生成路径与 Markdown 引用代码。（**详见 `references/image-guide.md`**）
8. **校验**：`pnpm dev` 预览 + `pnpm check`；要发布提交前再 `pnpm build`。
9. **用户审阅与迭代**：交用户审阅，**主动请提意见**；每条反馈逐步修改，每次改完请确认，满意前持续迭代。
10. **总体复核与去 AI 味（用户确认后，使用子代理）**：
    - 派发 **审校润色子代理（Subagent）** 处理文本优化，防止多轮润色大文本刷屏。在 Prompt 中明确要求子代理按顺序读取用户技能目录下的 `~/.agents/skills/wechat-mp-writer/SKILL.md`（进行选题/结构总体复核）与 `~/.agents/skills/humanizer-zh/SKILL.md`（去除 AI 腔与套路句式）。
    - 子代理读取文章文件，直接就地修订单篇 Markdown 文件。（**重点修复项见 `references/de-ai-checklist.md`**）
    - **子代理输出契约**：仅返回修改摘要（如：优化了哪几处空泛表述、去除了哪些套话、确认图片语法完整），不向主会话输出全文。
11. **图片上传与归档**：本地图片上传 ImgBB 得直链，替换正文引用（若有本地封面图同步替换 front-matter `image:`），原图移动归档 `archived-images/`。（**详见 `references/imgbb-upload.md`**）
12. **多渠道分发产物生成（必发环节，派发子代理分工处理）**：每篇文章成稿后，必须同步生成公众号及各大主流平台的发布产物至 `generated/` 目录：
    - **微信公众号排版（派发排版子代理）**：
      - 读取 `~/.agents/skills/gzh-design/SKILL.md` 技能；
      - 正文文末按需添加互动钩子（模式 A）与固定作者签名：`我是 AI非与，一尾随性游弋的鱼。`；
      - 将文章转为排版 HTML 写入 `generated/wechat/<slug>.html`，并按 `gzh-design` 规范生成带一键复制按钮的 `generated/wechat/<slug>_预览.html`；
    - **外部多平台草稿适配（可单派发或并行派发适配子代理）**：
      - 遵循 `references/platforms/common-rules.md` 通用规范；
      - 指派子代理**精准读取各自目标平台专属规则**进行独立改写与自检：
        - **CSDN**：读取 `references/platforms/csdn.md` → 写入 `generated/csdn/<slug>.md`（技术实战教程体）
        - **小红书**：读取 `references/platforms/xiaohongshu.md` → 写入 `generated/xiaohongshu/<slug>.md`（<=20字标题 + 300~600字种草体 + 文末 `#话题`）
        - **知乎**：读取 `references/platforms/zhihu.md` → 写入 `generated/zhihu/<slug>.md`（客观深度问答体）
        - **今日头条**：读取 `references/platforms/toutiao.md` → 写入 `generated/toutiao/<slug>.md`（高信息增量资讯）
        - **百家号**：读取 `references/platforms/baijiahao.md` → 写入 `generated/baijiahao/<slug>.md`（搜索优化干货）
    - **子代理输出契约**：仅向主会话返回生成成功的平台文件清单与自检合规状态，严禁倒灌大段 HTML/Markdown 文本。
13. **收尾与发布**：
    - **放开草稿**：**仅当用户明确说「可以提交」时**，才把 `draft: true` 改为 `draft: false`（或移除该字段），使文章对外可见。用户未确认前，始终保留 `draft: true`。
    - **发布前复校验**：放开草稿后、`pnpm build` 前，再跑 `pnpm check`/`pnpm build` 确认无 broken link（尤其图片引用已替换为 ImgBB URL）。
    - **提交内容选择**：`git add` 时**只提交文档与已归档图片**——
        - ✅ 文章 Markdown（`src/content/posts/<YYYY-MM>/<DD>-<slug>.md`）；
        - ✅ 已归档的图片（`archived-images/<YYYY-MM>/` 下本文相关的图片文件）；
        - ❌ **不提交** `generated/` 目录下的公众号排版 HTML 或各平台适配草稿（属一次性发布物，已被 `.gitignore` 忽略，不入仓库）。
    - 提交/部署后确认站点正常。

## 注意事项

- 草稿文章（`draft: true`）不出现在文章列表与站点地图。
- 加密文章需在 front-matter 设 `password` 及可选 `passwordHint`。
- 各 reference 仅在对应步骤执行时读入，保持本 `SKILL.md` 清单始终在视线内。
