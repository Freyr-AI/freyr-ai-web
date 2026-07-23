# Freyr AI Web 项目协作指南

## 项目范围

- 本仓库用于 Freyr AI 公司网站的开发与维护。
- 所有项目代码、资源、配置和文档均保存在本仓库中。
- 修改应围绕用户提出的需求进行，避免无关重构或大范围格式化。

## 技术栈

- 运行环境：Node.js `>=22.13.0`，使用 npm 和 `package-lock.json` 管理依赖。
- 应用框架：Next.js `16.2.6`、React/React DOM `19.2.6`。
- 开发语言：TypeScript `5.9.3`。
- 样式系统：Tailwind CSS `4.2.1`，通过 PostCSS 集成。
- 构建工具：Vite `8.0.13`、vinext `0.0.50`。
- 代码质量：ESLint `9.39.4`、`eslint-config-next`。
- 部署运行时：Cloudflare Workers，启用 `nodejs_compat`。
- 数据能力：已包含 Drizzle ORM 和 D1/R2 接入结构，但当前未启用数据库或
  对象存储。
- 托管：OpenAI Sites；项目标识保存在 `.openai/hosting.json`。

## 常用命令

- 安装锁定版本的依赖：`npm ci`
- 本地开发：`npm run dev`
- 生产构建：`npm run build`
- 启动构建产物：`npm run start`
- 代码检查：`npm run lint`
- 构建并测试：`npm test`
- 生成 Drizzle 迁移：`npm run db:generate`

## 主要目录

- `app/`：Next.js 页面、布局和全局样式。
- `public/`：静态资源。
- `worker/`：Cloudflare Worker 入口。
- `db/`、`drizzle/`：数据库结构和迁移。
- `tests/`：自动化测试。
- `.openai/hosting.json`：Sites 项目及可选 D1/R2 逻辑绑定。

## 开发流程

1. 开始工作前检查当前分支、工作区状态和远程更新。
2. 阅读现有代码与文档，遵循项目已经采用的目录结构、命名和设计风格。
3. 优先进行小而清晰、便于审查和回退的修改。
4. 不覆盖用户尚未提交的更改；发现冲突或不明确的需求时先说明。
5. 新增依赖前确认必要性，并使用项目现有的包管理器。

## 质量要求

- 页面应兼顾桌面端和移动端，并保持基本的可访问性。
- 不得把密码、令牌、私钥或其他敏感信息提交到仓库。
- 完成修改后运行项目已有的格式检查、静态检查、测试和构建命令。
- 若仓库暂时没有自动化检查，应至少确认修改后的文件有效且应用能够正常启动。
- 交付时说明修改内容、验证结果和仍存在的限制。

## Git 约定

- 提交前使用 `git diff` 和 `git status` 审查变更。
- 每个提交只包含一组相关修改。
- 提交信息使用简洁明确的英文，推荐 Conventional Commits：
  - `feat: add company homepage`
  - `fix: correct mobile navigation`
  - `docs: update project instructions`
- 除非用户明确要求，不重写共享分支历史，不强制推送。
- 完成并验证需求后，将提交推送到已配置的远程仓库。

## 文档维护

- 当技术栈、目录结构、开发命令或发布流程确定或发生变化时，同步更新本文件。
- 项目初始化后，应在本文件中补充安装、开发、测试、构建和部署命令。
