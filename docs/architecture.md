# 网站架构说明

## 当前选择

网站当前采用纯静态架构：HTML 负责页面结构，CSS 负责视觉，JavaScript 负责交互和数据渲染。它与现有 GitHub + Vercel 发布方式兼容，也符合当前 MVP 阶段。

## 页面与资源关系

- `index.html` 引用 `assets/css/home.css`。
- `ai.html` 引用 `assets/css/finance-landscape.css`。
- `ai.html` 先加载 `assets/data/finance-data.js`，再加载 `assets/js/finance-landscape.js`。
- 数据文件保存能力域、任务、角色、AI 能力等内容；交互文件负责筛选、渲染、导出和本地状态。

## 兼容性约束

- `https://taoy91885.com/` 和 `https://taoy91885.com/ai.html` 是现有公开入口。
- 资源使用相对路径，保证本地预览和 Vercel 部署都能正常读取。
- 页面使用 UTF-8，不应用其他编码覆盖。

## 何时考虑升级架构

当出现以下一项或多项明确需求时，再评估是否引入网站框架或内容管理系统：

- 页面和共用组件数量显著增长。
- 需要在线编辑和发布大量内容。
- 需要用户注册、付费、权限或持久化数据。
- 需要稳定的自动化测试、构建或多环境发布。
