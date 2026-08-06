#!/usr/bin/env node
// 按本仓库约定新建一篇 Firefly（Astro）博客文章。
//
// 输出路径：<base>/YYYY-MM/DD-<slug>.md
//   - YYYY-MM : published 的年月
//   - DD      : published 的日（两位数）
//   - <slug>  : 由调用方提供的、贴合文章语义的英文 slug（仅含 ascii）。
//               slug 同时写入 front-matter 的 `slug`，使 URL 与 wiki-link 一致。
//
// 注意：本脚本不做中文→拼音的机械转写。中文标题的 slug 必须由调用方
// （AI）根据文章语义给出贴切的英文 slug，并通过 --slug 传入。
//
// 用法：
//   node create-post.mjs "文章标题" [选项]
//
// 选项：
//   --date YYYY-MM-DD     发布日期（默认：今天）
//   --slug <slug>         自定义 URL slug（中文标题必填，需为贴切的英文）
//   --tags a,b,c          逗号分隔的标签
//   --category <cat>      分类名称
//   --lang <lang>         语言代码（默认：zh-cn）
//   --description <desc>  一句话摘要
//   --image <image>       封面图：""（无）、"api"（随机）或一个 URL
//   --author <name>       作者名
//   --draft               标记为草稿（默认即为草稿，此参数可省略）
//   --no-draft            发布而非草稿
//   --dir <path>          文章基础目录（默认：src/content/posts）
//   --force               若目标文件已存在则覆盖

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const CJK = /[一-鿿]/;

// 将任意字符串清洗为合法的 ascii slug：小写、非字母数字转连字符、去首尾连字符。
function slugify(text) {
	const slug = text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return slug;
}

// 极简参数解析：支持 `--key value` 与布尔型 `--draft` / `--force`。
function parseArgs(argv) {
	const args = { positional: [], flags: {} };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a.startsWith("--")) {
			const key = a.slice(2);
			if (key === "draft" || key === "force") {
				args.flags[key] = true;
				continue;
			}
			const next = argv[i + 1];
			if (next === undefined || next.startsWith("--")) {
				args.flags[key] = true;
			} else {
				args.flags[key] = next;
				i++;
			}
		} else {
			args.positional.push(a);
		}
	}
	return args;
}

function todayStr() {
	const d = new Date();
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function yamlArray(arr) {
	if (!arr.length) return "[]";
	return "[" + arr.map((x) => JSON.stringify(x)).join(", ") + "]";
}

function yamlStr(s) {
	return JSON.stringify(s ?? "");
}

async function main() {
	const { positional, flags } = parseArgs(process.argv.slice(2));
	const title = positional.join(" ").trim();
	if (!title) {
		console.error(
			'错误：必须提供标题。\n用法：node create-post.mjs "文章标题" [选项]',
		);
		process.exit(1);
	}

	const date = flags.date || todayStr();
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		console.error(`错误：--date 必须是 YYYY-MM-DD，收到 "${date}"`);
		process.exit(1);
	}
	const [yyyy, mm, dd] = date.split("-");

	// 确定 slug：
	//  - 提供了 --slug：清洗后使用（推荐，尤其是中文标题）。
	//  - 未提供且标题为纯英文/拉丁：从标题派生。
	//  - 未提供且标题含中文：无法确定语义，要求调用方显式传入 --slug。
	let slug;
	if (flags.slug) {
		slug = slugify(flags.slug);
	} else if (!CJK.test(title)) {
		slug = slugify(title);
	} else {
		console.error(
			"错误：中文标题必须提供 --slug，请按文章语义给出贴切的英文 slug。\n" +
				'示例：--slug workerbuddy-build-site',
		);
		process.exit(1);
	}
	if (!slug) {
		console.error("错误：无法从标题或 --slug 生成有效 slug。");
		process.exit(1);
	}

	const base = flags.dir || "src/content/posts";
	const dir = resolve(process.cwd(), base, `${yyyy}-${mm}`);
	const file = join(dir, `${dd}-${slug}.md`);
	const rel = join(`${yyyy}-${mm}`, `${dd}-${slug}.md`);

	if (existsSync(file) && !flags.force) {
		console.error(`错误：文件已存在：${rel}\n如需覆盖请加 --force。`);
		process.exit(1);
	}

	const tags = (flags.tags || "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	const category = flags.category || "";
	const lang = flags.lang || "zh-cn";
	const description = flags.description || "";
	// 默认随机封面（image: "api"）；传具体 URL 或 `--image ""` 可覆盖。
	const image = flags.image !== undefined ? flags.image : "api";
	const author = flags.author || "";
	// 默认新建文章为草稿（--no-draft 可发布）。
	const draft = flags["no-draft"] ? false : true;

	const fm = [
		"---",
		`title: ${yamlStr(title)}`,
		`published: ${date}`,
		`updated: `,
		`description: ${yamlStr(description)}`,
		`image: ${yamlStr(image)}`,
		`tags: ${yamlArray(tags)}`,
		`category: ${yamlStr(category)}`,
		`draft: ${draft}`,
		`lang: ${yamlStr(lang)}`,
		`pinned: false`,
		`author: ${yamlStr(author)}`,
		`sourceLink: ""`,
		`licenseName: ""`,
		`licenseUrl: ""`,
		`comment: true`,
		`password: ""`,
		`passwordHint: ""`,
		`slug: ${yamlStr(slug)}`,
		`prevTitle: ""`,
		`prevSlug: ""`,
		`nextTitle: ""`,
		`nextSlug: ""`,
		"---",
		"",
		"> 在这里开始撰写正文……",
		"",
	].join("\n");

	await mkdir(dir, { recursive: true });
	await writeFile(file, fm, "utf8");

	const relUrl = rel.replace(/\\/g, "/");
	console.log(`已创建文章：${rel}`);
	console.log(`  slug：${slug}`);
	console.log(`  url： /posts/${relUrl.replace(/\.md$/, "")}`);
	console.log("\n下一步：运行 `pnpm dev` 预览，然后撰写正文内容。");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
