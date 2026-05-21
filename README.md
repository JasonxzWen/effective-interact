# Effective Interact

Effective Interact is a Chinese-first Agent Skill for complex communication: plans, reviews, status reports, architecture maps, decision matrices, handoffs, and optional static HTML artifacts when interaction lowers decision cost.

## Repository Layout

```text
skills/effective-interact/        Agent Skills package
.codex-plugin/plugin.json         Codex plugin manifest
.claude-plugin/plugin.json        Claude Code plugin manifest
.claude-plugin/marketplace.json   Claude Code marketplace catalog
docs/publishing.md                Publishing and validation notes
scripts/check-release.mjs         Local release-structure check
```

## Install In Codex

From GitHub, ask Codex to install the skill at `skills/effective-interact` from `JasonxzWen/effective-interact`.

For local development, copy the skill into Codex's skills directory:

```powershell
$skillRoot = if ($env:CODEX_HOME) { Join-Path $env:CODEX_HOME "skills" } else { Join-Path $HOME ".codex\skills" }
New-Item -ItemType Directory -Force $skillRoot
Copy-Item -Recurse -Force .\skills\effective-interact $skillRoot
```

Restart Codex after installing. The repository also includes `.codex-plugin/plugin.json` so it can be packaged as a Codex plugin where a plugin marketplace or import flow is available.

## Install In Claude Code

Local development:

```powershell
claude --plugin-dir .
```

After the repository is published to GitHub:

```text
/plugin marketplace add JasonxzWen/effective-interact
/plugin install effective-interact@effective-interact
/effective-interact:effective-interact
```

## Validate

```powershell
npm run validate:release
$codexHome = if ($env:CODEX_HOME) { $env:CODEX_HOME } else { Join-Path $HOME ".codex" }
python (Join-Path $codexHome "skills\.system\skill-creator\scripts\quick_validate.py") skills\effective-interact
claude plugin validate .
claude plugin validate .claude-plugin\plugin.json
```

`claude plugin validate` requires a Claude Code version with plugin validation support. Newer Claude Code versions may also support `--strict`.

## License

Apache-2.0. See [LICENSE](LICENSE).
