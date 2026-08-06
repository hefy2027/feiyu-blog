# 配图指南（第 7 步）

## 何时做图

文章需要插图、封面配图或技术图示时，用**子代理**调用相关做图技能/工具生成：

- `@command://ai-image-generation`（用 `use_skill` 工具调用）：AI 配图、插画、产品 mockup 等。
- `@command://fireworks-tech-graph`（用 `use_skill` 工具调用）：软件架构图、流程图、时序图、C4、拓扑等（可导出 SVG/PNG/HTML）。

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
- 仅当用户要求指定封面图时，才额外生成并写入 `image` 字段或 `--image`。
