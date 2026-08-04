---
title: 零服务器、零成本，我是怎么搭起个人站点的
published: 2026-08-10
description: '用 WorkerBuddy 在 Cloudflare Workers 上一键部署个人站点，并绑定自定义域名，几分钟就能上线。'
image: 'api'
tags:
  - Cloudflare
  - WorkerBuddy
  - Workers
  - 站点部署
category: 建站
draft: true
lang: 'zh-cn'
slug: workerbuddy-build-site
---

## 1. 域名接入 Cloudflare

- 注册/登录 Cloudflare，添加站点
- 在域名注册商处修改 NS 记录，指向 Cloudflare
- 等 DNS 生效，Cloudflare 面板确认 Active 状态

## 2. 安装 WorkerBuddy

- WorkerBuddy 是什么：基于 Cloudflare Workers 的站点部署工具
- `npm install -g workerbuddy` 安装
- `workerbuddy login` 授权
- `workerbuddy init` 初始化项目

## 3. 写一个 HTML 站点

- 最简单的 `index.html` 个人主页示例
- 多页面时加对应的 html 文件即可

## 4. 部署到 Cloudflare Workers

- `workerbuddy deploy` 一键部署
- 生成 `*.workers.dev` 免费预览域名
- 或者手动在 Cloudflare Dashboard 创建 Worker 粘贴代码

## 5. 绑定自定义域名

- Workers → 触发器 → 自定义域 → 添加域名
- Cloudflare 自动配置 DNS 和 SSL

## 6. 收尾

- 验证：浏览器访问域名，看到站点上线
- 后续玩法：KV 存储、D1 数据库等
