# 发布规范

本仓库按“一个 GitHub 仓库同时承载标准 Agent Skill、Codex plugin manifest、Claude Code plugin manifest”的方式初始化。

## 已采纳规范

1. Agent Skills 标准
   - skill 是一个目录，至少包含 `SKILL.md`。
   - `SKILL.md` 需要 YAML frontmatter，`name` 和 `description` 为必需字段。
   - `name` 使用小写字母、数字和连字符，且应与父目录名一致。
   - `scripts/`、`references/`、`assets/` 是可选资源目录，正文应通过相对路径引用资源。
   - 主 `SKILL.md` 保持精简，较长材料放到引用文件中，靠渐进加载降低上下文成本。

2. Codex 分发
   - 直接安装路径：`skills/effective-interact/`。
   - 根目录保留 `.codex-plugin/plugin.json`，声明 `skills: "./skills/"`，为 Codex plugin 分发保留入口。
   - `skills/effective-interact/agents/openai.yaml` 提供 Codex UI 元数据。

3. Claude Code 分发
   - 根目录是 Claude Code plugin。
   - `.claude-plugin/plugin.json` 声明 plugin 身份与 `skills: "./skills/"`。
   - `skills/effective-interact/SKILL.md` 会作为 plugin skill 暴露，命令名为 `/effective-interact:effective-interact`。
   - `.claude-plugin/marketplace.json` 让用户可以通过 `/plugin marketplace add JasonxzWen/effective-interact` 注册 marketplace，再安装 `effective-interact@effective-interact`；本机 Claude Code validator 要求 catalog 顶层包含 `owner`，说明文字放在 `metadata.description`，且不接受顶层 `description`。

## 发布前检查

1. 结构检查
   - `skills/effective-interact/SKILL.md` 存在。
   - `SKILL.md` frontmatter 的 `name` 是 `effective-interact`。
   - `.codex-plugin/plugin.json`、`.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json` 都存在。
   - plugin manifests 的 `skills` 字段指向 `./skills/`。

2. 版本检查
   - `package.json`、`.codex-plugin/plugin.json`、`.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json` 使用同一个版本。
   - 如果 Claude Code marketplace entry 或 plugin manifest 设置了 `version`，后续发布必须同步 bump；否则用户可能不会收到更新。

3. 安装检查
   - Codex：从 `skills/effective-interact/` 安装或复制到 `$CODEX_HOME/skills/effective-interact`。
   - Codex GitHub：让 Codex 从 `JasonxzWen/effective-interact` 的 `skills/effective-interact` 路径安装 skill。
   - Claude Code 本地：运行 `claude --plugin-dir .`，检查 `/effective-interact:effective-interact` 可见。
   - Claude Code GitHub：发布后运行 `/plugin marketplace add JasonxzWen/effective-interact`，再运行 `/plugin install effective-interact@effective-interact`。

4. 验证命令

```powershell
npm run validate:release
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
python (Join-Path $codexHome "skills\.system\skill-creator\scripts\quick_validate.py") skills\effective-interact
claude plugin validate .
claude plugin validate .claude-plugin\plugin.json
```

5. GitHub 发布
   - 确保默认分支是 `main`，或同步更新 `.claude-plugin/marketplace.json` 的 `ref`。
   - 发布前确认 `git status --short --branch` 没有与发布无关的脏改动。
   - 建议 tag 使用 `vX.Y.Z`，并让 manifest 版本与 tag 对齐。

## 主要来源

- [Agent Skills specification](https://agentskills.io/specification)
- [OpenAI: Using skills](https://openai.com/academy/skills/)
- [Claude Code: Skills](https://code.claude.com/docs/en/skills)
- [Claude Code: Create plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code: Plugin marketplaces](https://code.claude.com/docs/en/plugin-marketplaces)
- [Claude Code: Plugins reference](https://code.claude.com/docs/en/plugins-reference)
