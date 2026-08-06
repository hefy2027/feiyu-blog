# Front-matter 字段说明

定义在 `src/content.config.ts` 的 `posts` 集合中。所有文章位于
`src/content/posts/<YYYY-MM>/<DD>-<slug>.md`。

**URL slug** 取自文件路径（`removeFileExtension(entry.id)`），因此文件名中的
`<slug>` 即为 URL 片段；front-matter 的 `slug` 字段则用于 wiki-link（`[[...]]`）
解析。两者应保持一致，否则内部链接会失效。

## 字段一览

| 字段           | 类型                | 必填 | 默认值   | 说明 |
|----------------|---------------------|------|----------|------|
| `title`        | string              | 是   | —        | 文章标题（可为任意语言）。 |
| `published`    | 日期（`YYYY-MM-DD`）| 是   | —        | 同时决定文件路径中的 `YYYY-MM/DD-`。 |
| `updated`      | 日期                | 否   | null     | 最后更新日期。 |
| `description`  | string              | 否   | `""`     | 摘要 / meta 描述。 |
| `image`        | string              | 否   | `""`     | `""` = 无封面；`"api"` = 随机封面；其余为图片 URL。 |
| `tags`         | string[]            | 否   | `[]`     | 通过 CLI 传入时用逗号分隔。 |
| `category`     | string \| null      | 否   | `""`     | 单个分类。 |
| `draft`        | boolean             | 否   | `false`  | 草稿不出现在列表中。 |
| `lang`         | string              | 否   | `""`     | 如 `zh-cn`、`en`。 |
| `pinned`       | boolean             | 否   | `false`  | 置顶。 |
| `author`       | string              | 否   | `""`     | 覆盖站点默认作者。 |
| `sourceLink`   | string              | 否   | `""`     | 原文链接（转载）。 |
| `licenseName`  | string              | 否   | `""`     | 许可证名称。 |
| `licenseUrl`   | string              | 否   | `""`     | 许可证链接。 |
| `comment`      | boolean             | 否   | `true`   | 是否开启评论。 |
| `password`     | string              | 否   | `""`     | 加密文章正文。 |
| `passwordHint` | string              | 否   | `""`     | 加密文章的提示。 |
| `slug`         | string              | 否   | 派生     | 用于 wiki-link 解析，应与文件名 slug 相同。须为贴合文章语义的英文 slug（非拼音）。 |
| `prevTitle` / `prevSlug` / `nextTitle` / `nextSlug` | string | 否 | `""` | 内部上下篇导航，一般留空（构建时自动填充）。 |

## 封面图

`image: "api"` 会从配置的 API 列表中选择随机封面（见
`src/config/coverImageConfig.ts`）。也可填入完整 URL 或站点相对路径
（`/images/...`）使用指定图片。留空则无封面。

## 示例

```md
---
title: "WorkerBuddy 搭建站点"
published: 2026-08-10
updated:
description: "用 WorkerBuddy 快速上线个人站点"
image: "api"
tags: [工具, 部署]
category: "教程"
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
slug: "workerbuddy-da-jian-zhan-dian"
prevTitle: ""
prevSlug: ""
nextTitle: ""
nextSlug: ""
---
```
