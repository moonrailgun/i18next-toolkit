# Prompt 翻译测试脚本 — 设计文档

日期：2026-07-08

## 目标

提供一个脚本，用于人工检查 OpenAI 翻译 prompt 的实际效果。脚本会：真实调用 LLM，
把待翻译内容发出去，并打印出**完整的 system prompt** 和**返回的翻译结果**，方便肉眼评估
prompt 好不好。

关键约束：脚本使用的 prompt 必须**直接引用源码里的 prompt**，不能复制粘贴，避免源码改了
而测试脚本没跟上导致漂移。

## 现状

目标 prompt 位于 `packages/cli/src/translator/openai.ts:63-73`，是内联写死在
`translateWithOpenAI` 里的 system message，当前**无法被 import 引用**。

## 方案

### 1. 重构源码（不改变行为）

在 `packages/cli/src/translator/llm.ts` 中新增一个导出函数：

```ts
export function generateOpenAITranslateSystemPrompt(locale: string): string {
  return `You are a professional translation tool ...'${locale}'...`.trim();
}
```

把 `openai.ts` 里内联的 system prompt 字符串**原样搬进**该函数，然后
`translateWithOpenAI` 的 `content:` 改为调用 `generateOpenAITranslateSystemPrompt(locale)`。

这样源码与测试脚本共用同一份 prompt，永不漂移。此改动是纯提取重构，运行行为不变。

### 2. 新增测试脚本 `packages/cli/scripts/testPrompt.ts`

- **用法**：`ts-node ./scripts/testPrompt.ts <json文件路径> <目标locale>`
- **输入**：命令行第一个参数为待翻译 JSON 文件路径（扁平 `Record<string,string>`），
  第二个参数为目标 locale（单一语言）。
- **流程**：
  1. 用 `dotenv` 加载 `.env`（与现有 `openai.spec.ts` 一致）。
  2. 读取 JSON 文件。
  3. 调用源码的 `generateOpenAITranslateSystemPrompt(locale)` 得到 system prompt。
  4. 自建 OpenAI client（复用 `openai.ts` 里的 config / apiKey / baseURL / ProxyAgent
     初始化逻辑），把 system prompt + 用户 JSON 作为 user message 发出去。
  5. 打印：完整 system prompt、输入 JSON、返回的翻译结果、token 用量。
- **为什么自建调用而非复用 `translateWithOpenAI`**：`translateWithOpenAI` 不暴露实际
  发送的 prompt 文本；而本脚本的目的就是"检查 prompt 效果"，需要看到 prompt 全文。
  prompt 来源仍是源码导出的函数，因此不违反"直接引用源码"的约束。

### 输出示例

```
=== System Prompt (ja) ===
You are a professional translation tool ...
=== Input ===
{ "k112a7174": "用法" }
=== Translation ===
{ "k112a7174": "使用法" }
Tokens: 156
```

## 错误处理

- 缺少参数：打印用法并退出。
- 缺少 apiKey：沿用源码的报错信息。
- JSON 文件不存在 / 非法：打印清晰错误并退出。

## 测试

脚本本身是手动运行的验证工具，不纳入自动化测试。重构后运行现有 `openai.spec.ts`
（在 `TEST_OPENAI` 环境下）确认行为未变。
