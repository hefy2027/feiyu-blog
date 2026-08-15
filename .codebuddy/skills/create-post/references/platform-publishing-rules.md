# 跨平台多渠道发布与分发规则索引

为防止跨平台适配子代理（Subagent）受到其他平台规则干扰产生幻觉，**所有平台的审核红线与适配要点已全部独立拆分至 `references/platforms/` 目录下**。

各子代理执行分发时，**只需读取对应的规则文件**：

## 1. 通用基础规范
- [通用规则、图床机制与头部格式规范](./platforms/common-rules.md)

## 2. 各平台专属规则与 Checklist
- [CSDN 规则与技术教程改写](./platforms/csdn.md)
- [小红书 20字标题与短笔记种草体](./platforms/xiaohongshu.md)
- [知乎 深度问答体与客观论证](./platforms/zhihu.md)
- [今日头条 信息增量干货与防诱导](./platforms/toutiao.md)
- [百家号 百度长尾搜索与版权图审核](./platforms/baijiahao.md)
- [微信公众号 排版与私域互动钩子](./platforms/wechat.md)
