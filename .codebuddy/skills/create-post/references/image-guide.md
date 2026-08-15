# 配图指南（第 7 步）

## 何时做图

文章需要插图、封面配图或技术图示时，用**子代理**调用相关做图技能/工具生成：

- **AI 概念与插画**：读取技能 `~/.agents/skills/ai-image-generation/SKILL.md`（生成配图、插画、产品 mockup 等）。
- **专业技术架构图**：读取技能 `~/.agents/skills/fireworks-tech-graph/SKILL.md`（生成软件架构图、流程图、时序图、C4、拓扑等，导出 SVG/PNG）。
  > 提示：生成架构图时建议同时导出高质量 PNG 或优先使用 PNG/WEBP，方便后续第 11 步无缝上传 ImgBB 图床。

### 子代理执行契约

- 派发专门的**绘图子代理**，在 Prompt 中指定需读取的对应技能路径。
- 生成的图片/SVG 直接写入磁盘目标路径。
- **子代理输出契约**：仅向主会话返回图片保存路径与 Markdown 引用代码（如 `![架构图](./my-dev-skill-stack-arch.svg)`），禁止将生图 prompt 的长篇中间交互或 SVG 原始长代码回传至主会话。

## 放置位置

生成图片**直接放在与文章同目录**（`src/content/posts/<YYYY-MM>/`，与 `<DD>-<slug>.md` 同级）。

## 命名（kebab-case 英文）

形式：`{article-slug}-{semantic-suffix}.{ext}`

- 以文章 slug 为前缀，后接描述图片内容/用途的英文短横线词组。
- 仅 ascii、小写、连字符分隔。
- 扩展名按实际类型：`.png` / `.jpeg` / `.gif` / `.svg` 等。

示例（slug = `my-dev-skill-stack`）：

- 封面：`my-dev-skill-stack-cover.png`
- 架构图：`my-dev-skill-stack-arch.svg`
- 流程示意：`my-dev-skill-stack-flow.png`

> 此命名可直接复用于第 11 步归档，保持一致。

## 正文引用

用相对于文章目录的相对路径引用，例如：

```md
![架构图](./my-dev-skill-stack-arch.svg)
```

并保留图片来源 / 版权说明。

## 注意

- 默认封面为 `image: "api"`（随机封面），由站点生成、非本地文件，**无需在此生成**。
- 仅当用户要求指定封面图时，才额外生成并在草稿期暂填本地相对路径（如 `image: "./{slug}-cover.png"`），待第 11 步上传图床后替换为 ImgBB 直链。
- **草稿期生命周期**：在文章未定稿发布前（`draft: true`），图片必须留在文章同级目录，供 `pnpm dev` 本地预览；直到确认发布（第 11 步）才执行 ImgBB 上传与归档。
