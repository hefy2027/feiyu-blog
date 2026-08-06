# 图片上传与归档（第 11 步）

将本文关联的所有本地图片（即文章同目录 `src/content/posts/<YYYY-MM>/` 下的图片文件）上传并归档。

## 步骤

1. **上传**：用 `use_skill` 工具调用 `ImgBB API`（或 `@command://ImgBB API`）逐一上传，获取可分享直链。
2. **替换引用**：把正文中的图片引用 `./xxx.png` 等**替换为上传后的 URL**。
3. **归档（移动）**：将原始图片文件**移动（move，非复制）**到仓库 `archived-images/` 目录。

## 归档位置

`archived-images/<YYYY-MM>/`，`<YYYY-MM>` 与本文 `published` 年月一致（如 2026-08 发布归入 `archived-images/2026-08/`）。

## 归档命名（kebab-case 英文）

`{article-slug}-{semantic-suffix}.{ext}`：

- 以文章 slug 为前缀，后接描述图片内容/用途的英文短横线词组；仅 ascii、小写、连字符分隔。
- 示例（slug = `my-dev-skill-stack`）：`my-dev-skill-stack-cover.png`、`my-dev-skill-stack-arch.svg`、`my-dev-skill-stack-flow.png`。
- 扩展名按实际类型（`.png` / `.jpeg` / `.gif` / `.svg` 等）。
- 同名冲突时加序号或细化后缀避免覆盖（如 `my-dev-skill-stack-cover-2.png`）。

## 注意

- 归档是移动，原图移走后文章目录下不再保留。
- 随机封面 `image: "api"` 与 `--image <url>` 指定的封面均为远程图，不属本地图片，不处理。
- 若为**草稿且暂不公开**，可暂缓上传、保留本地引用，待发布时再执行本步；原图仍留在文章目录。
