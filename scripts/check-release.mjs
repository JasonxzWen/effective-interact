#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const skillName = "effective-interact";
const failures = [];

function rel(...parts) {
  return path.join(root, ...parts);
}

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  const fullPath = rel(...relativePath.split("/"));
  if (!fs.existsSync(fullPath)) {
    fail(`Missing ${relativePath}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

function readText(relativePath) {
  const fullPath = rel(...relativePath.split("/"));
  if (!fs.existsSync(fullPath)) {
    fail(`Missing ${relativePath}`);
    return "";
  }

  return fs.readFileSync(fullPath, "utf8");
}

function parseFrontmatter(markdown) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown);
  if (!match) return null;

  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([a-zA-Z0-9_-]+):\s*(.*)$/.exec(line);
    if (field) values[field[1]] = field[2].trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

const packageJson = readJson("package.json");
const codexPlugin = readJson(".codex-plugin/plugin.json");
const claudePlugin = readJson(".claude-plugin/plugin.json");
const marketplace = readJson(".claude-plugin/marketplace.json");
const skillMarkdown = readText("skills/effective-interact/SKILL.md");
const licenseText = readText("LICENSE");
const frontmatter = parseFrontmatter(skillMarkdown);

if (!frontmatter) {
  fail("SKILL.md must start with YAML frontmatter");
} else {
  if (frontmatter.name !== skillName) fail(`SKILL.md name must be ${skillName}`);
  if (!frontmatter.description) fail("SKILL.md description is required");
  if (frontmatter.license !== "Apache-2.0") fail("SKILL.md license must be Apache-2.0");
  if ((frontmatter.description ?? "").length > 1024) {
    fail("SKILL.md description must be 1024 characters or less");
  }
}

if (!licenseText.includes("Apache License") || !licenseText.includes("Version 2.0")) {
  fail("LICENSE must contain Apache License 2.0 text");
}

for (const [label, manifest] of [
  ["Codex plugin", codexPlugin],
  ["Claude plugin", claudePlugin]
]) {
  if (!manifest) continue;
  if (manifest.name !== skillName) fail(`${label} name must be ${skillName}`);
  if (manifest.skills !== "./skills/") fail(`${label} skills must be ./skills/`);
  if (!manifest.description) fail(`${label} description is required`);
  if (manifest.license !== "Apache-2.0") fail(`${label} license must be Apache-2.0`);
}

if (packageJson && packageJson.license !== "Apache-2.0") {
  fail("package.json license must be Apache-2.0");
}

if (packageJson && codexPlugin && packageJson.version !== codexPlugin.version) {
  fail("package.json and .codex-plugin/plugin.json versions must match");
}

if (packageJson && claudePlugin && packageJson.version !== claudePlugin.version) {
  fail("package.json and .claude-plugin/plugin.json versions must match");
}

if (marketplace) {
  if (marketplace.name !== skillName) fail(`Claude marketplace name must be ${skillName}`);
  if (marketplace.description) fail("Claude marketplace must not use a top-level description field");
  if (marketplace.owner?.name !== "JasonxzWen") fail("Claude marketplace owner.name must be JasonxzWen");
  if (!marketplace.metadata?.description) fail("Claude marketplace metadata.description is required");
  const entry = Array.isArray(marketplace.plugins)
    ? marketplace.plugins.find((plugin) => plugin.name === skillName)
    : null;

  if (!entry) {
    fail("Claude marketplace must contain an effective-interact plugin entry");
  } else {
    if (packageJson && entry.version !== packageJson.version) {
      fail("Claude marketplace plugin version must match package.json");
    }
    if (entry.license !== "Apache-2.0") fail("Claude marketplace plugin license must be Apache-2.0");
    if (entry.source?.source !== "github") fail("Claude marketplace source must be github");
    if (entry.source?.repo !== "JasonxzWen/effective-interact") {
      fail("Claude marketplace repo must be JasonxzWen/effective-interact");
    }
    if (entry.source?.ref !== "main") fail("Claude marketplace ref must be main");
  }
}

for (const relativeDir of [
  "skills/effective-interact/scripts",
  "skills/effective-interact/references",
  "skills/effective-interact/assets"
]) {
  if (!fs.existsSync(rel(...relativeDir.split("/")))) fail(`Missing ${relativeDir}`);
}

if (fs.existsSync(rel("skills", "effective-interact", "artifacts"))) {
  fail("skills/effective-interact/artifacts must stay untracked and absent from release checks");
}

if (failures.length > 0) {
  console.error("Release validation failed:");
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log("Release validation passed");
