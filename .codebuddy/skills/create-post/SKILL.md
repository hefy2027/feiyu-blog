---
name: create-post
description: 在本仓库中新建一篇 Firefly（Astro）博客文章。当用户想新增文章、草稿或博客内容时使用，例如「写一篇关于 X 的文章」「新建 post」「加一篇博客」「create a new post」。脚本会自动处理文件位置、URL slug 以及完整的 front-matter，使文章符合本仓库 `src/content/posts/YYYY-MM/DD-<slug>.md` 的约定。
---

# 新建文章（Firefly 博客）

## 概述

从零产出一篇成稿博客文章：先生成位置正确、front-matter 完整的 Markdown 骨架，再调研主题、给出大纲供确认、撰写正文，最后做图 / 去 AI 味 / 上传归档。弥补旧脚本 `scripts/new-post.js` 的不足（丢 `YYYY-MM/` 与 `DD-` 前缀、中文逐字拼音、无调研与正文）。

编辑前先读 `references/schema.md` 了解 front-matter 字段。各步骤的详细子流程见对应 reference，**执行到该步再读入**，保持本清单始终在视线内。

## 何时使用

- 用户要求新建、添加一篇文章 / 草稿 / 博客内容。
- 用户给主题/标题，希望做成可发布的草稿。

**不要**用于编辑已有文章、页面或其他非 post 内容类型（spec/dynamic 各自 schema）。

## 约定（必须遵守）

- **位置**：`src/content/posts/<YYYY-MM>/<DD>-<slug>.md`
  - `<YYYY-MM>` = `published` 年月；`<DD>` = `published` 日。
- **Slug（语义英文）**：仅 ascii，**按文章语义选取贴切英文单词**组成，不用拼音。文件名 slug 与 front-matter `slug` 一致，使 URL 与 `[[wiki-link]]` 解析到同一目标。
- **URL slug** 取自文件路径；**front-matter `slug`** 用于 wiki-link 解析——两者需相等。

## 工作流

1. **Grilling（明确方向，必须第一步执行）**：动手前**必须先用 `use_skill` 工具加载 `grilling` 技能**（若环境支持也可在对话中以 `@command://grilling` 触发），由其多轮提问确认主题定位、核心观点、目标读者、范围、风格深度，直至方向清晰。**禁止**用本地问题自行替代 grilling；只有当 `grilling` 确实无法加载（环境报错 / 未安装）时，才回退到 `references/clarify-direction.md`。其产出作为后续所有步骤输入。
2. **收集输入**：确认最终**标题/主题**（必填）。其余字段不询问、用默认值、由 AI 推断：发布日期=今天；`lang`=zh-cn；草稿=是（发布传 `--no-draft`）；封面=随机（`image:"api"`，指定传 `--image <url>`，无封面 `--image ""`）；标签/分类按内容自行创建或关联；`description` 据正文/大纲生成。
3. **生成语义 slug**：按文章语义取贴切英文单词，规则：小写、连字符、仅 ascii、精炼可读利于 SEO。例：「用 WorkerBuddy 上线站点」→ `workerbuddy-build-site`；「我的开发技能栈」→ `my-dev-skill-stack`；「开始写博客」→ `start-blogging`。
4. **运行脚本建骨架**：`--slug` 传英文 slug，并自行推断标签/分类传入。（**详见 `references/script-usage.md`**）
5. **调研主题**：用联网/检索工具（WebSearch/WebFetch、浏览器 MCP、或其它外部信息工具）获取权威来源与最新数据；项目细节用代码库检索（Task 子代理、`search_content`、`read_file`）；必要时 RAG。记录来源链接，避免编造。调研后可微调标签/分类。
6. **给大纲并请确认**：基于调研拟定结构（引言、核心章节、小结/行动建议），中文列出，**暂停等用户确认/修改**。确认前不写正文。
7. **撰写正文**：确认后替换占位 `> 在这里开始撰写正文……` 为完整正文，据实引用来源，补全 `description`。（**配图见 `references/image-guide.md`**）
8. **校验**：`pnpm dev` 预览 + `pnpm check`；要发布提交前再 `pnpm build`。
9. **用户审阅与迭代**：交用户审阅，**主动请提意见**；每条反馈逐步修改，每次改完请确认，满意前持续迭代。
10. **总体复核与去 AI 味（用户确认后）**：用 `use_skill` 工具调用 `wechat-mp-writer` 复核 + `humanizer-zh` 去味（或对话中 `@command://wechat-mp-writer` / `@command://humanizer-zh`）。（**重点修复项见 `references/de-ai-checklist.md`**）
11. **图片上传与归档**：本地图片上传 ImgBB 得直链，替换正文引用，原图移动归档 `archived-images/`。（**详见 `references/imgbb-upload.md`**）
12. **收尾**：发布则 `pnpm build` + 提交/部署，且发布前再跑 `pnpm check`/`pnpm build` 确认无 broken link（尤其图片引用已替换为 ImgBB URL）；草稿保持 `draft: true`。

## 注意事项

- 草稿文章（`draft: true`）不出现在文章列表与站点地图。
- 加密文章需在 front-matter 设 `password` 及可选 `passwordHint`。
- 各 reference 仅在对应步骤执行时读入，保持本 `SKILL.md` 清单始终在视线内。
