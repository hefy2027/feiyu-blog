import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "闲话",

	// 公告内容
	content: "一尾随性游弋的鱼，把这儿当另一个仓库——代码装不下的，就写在这里。这方小天地还新，且慢慢长。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "关于我",
		// 链接 URL
		url: "/about/",
		// 内部链接
		external: false,
	},
};
