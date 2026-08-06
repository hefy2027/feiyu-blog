# 创建脚本用法（create-post.mjs）

路径：`.codebuddy/skills/create-post/scripts/create-post.mjs`

在**仓库根目录**执行。

## 命令示例

```bash
node .codebuddy/skills/create-post/scripts/create-post.mjs "用 WorkerBuddy 上线站点" \
  --slug workerbuddy-build-site \
  --tags 教程,部署 \
  --category 教程
```

不带参数运行可查看用法说明。

## 参数

- `--date YYYY-MM-DD`：发布日期（默认今天）。
- `--slug <slug>`：**中文标题必填**，需为贴合语义的英文 slug；纯英文标题未提供时从标题派生。
- `--tags a,b,c`：逗号分隔的标签。
- `--category <cat>`：分类名称。
- `--lang <lang>`：语言代码（默认 `zh-cn`）。
- `--description <desc>`：一句话摘要。
- `--image <image>`：封面图——`""`（无）、`"api"`（随机，默认）、或一个 URL。
- `--author <name>`：作者名。
- `--no-draft`：发布而非草稿（默认即为草稿）。
- `--dir <path>`：文章基础目录（默认 `src/content/posts`）。
- `--force`：目标文件已存在则覆盖。

## 脚本默认填充的 front-matter 值

- `published`：今天；`updated`：空（null）
- `image`：`"api"`（默认随机封面）；传具体 URL 或 `--image ""` 可覆盖
- `tags` / `category`：脚本默认 `[]` / `""`，通过 `--tags` / `--category` 传入；可由 AI 按内容推断
- `lang`：`zh-cn`；`draft`：`true`（默认草稿），`--no-draft` 可发布
- `comment: true`；`pinned: false`；`password/passwordHint`：`""`
- `slug`、`prev/next*`、`sourceLink`、`license*`、`author`：派生/留空

完整字段含义见 `references/schema.md`。

## 注意事项

- 目标文件已存在时脚本拒绝覆盖，除非传 `--force`。
- 脚本**不做**拼音转写：中文标题必须由调用方（AI）经 `--slug` 提供贴合语义的英文 slug，未提供则报错退出。
- 输出的文件 URL 使用正斜杠，可直接粘贴预览。
