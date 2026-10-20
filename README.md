# 文稿室 · Writing Style Helper

离线可运行的产品演示：把写作风格做成显式控制，把最终文字的所有权留给人。

An interview demo of controllable generation plus a human finalize gate. Drafts are fixture text. No model API and no API key.

## 快速开始

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

浏览器打开终端里显示的本地地址（默认 `http://localhost:5173`）。

```bash
npm run build
npm run preview
```

`npm run build` 会先做类型检查，再产出 `dist/`。

更完整的演示路径、30 秒讲稿和产品边界见 [使用说明书.md](使用说明书.md)。

## 演示在讲什么

1. **显式控制**：主题、受众、风格预设、篇幅、结构、必须出现、必须避开，都是参数。
2. **多切角草案**：同一份简报生成三份提案，每份带参数回执。
3. **人工闸门**：可以「驳回，要求重写」，也可以「采纳并编辑」。只有确认定稿之后才能导出 Markdown。

导出的 Markdown 正文在前，稿签和决策记录在后。定稿前没有导出入口。

## 技术

- Vite + React + TypeScript
- 草案由本地规则按参数拼装，不上传简报
- 会话状态只留在当前浏览器的 `sessionStorage`

## 许可

[MIT](LICENSE)
