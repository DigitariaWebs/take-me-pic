#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const AUTO_START = '<!-- daily-shift:auto:start -->';
const AUTO_END = '<!-- daily-shift:auto:end -->';
const MAX_COMMITS = 12;

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function getArgs(name) {
  return process.argv.flatMap((arg, index) => {
    if (arg !== name) {
      return [];
    }

    const value = process.argv[index + 1];
    return value ? [value] : [];
  });
}

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getNextDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);

  return formatLocalDate(date);
}

function git(args, options = {}) {
  try {
    return execFileSync('git', args, {
      cwd: options.cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return '';
  }
}

function truncateLines(value, maxLines = MAX_COMMITS) {
  const lines = value.split('\n').filter(Boolean);
  if (lines.length <= maxLines) {
    return lines;
  }

  return [
    ...lines.slice(0, maxLines),
    `... ${lines.length - maxLines} more line(s) omitted`,
  ];
}

function formatCodeBlock(value, emptyText = 'None') {
  const lines = truncateLines(value);
  if (lines.length === 0) {
    return emptyText;
  }

  return ['```text', ...lines, '```'].join('\n');
}

function parseStatus(status) {
  const lines = status.split('\n').filter(Boolean);

  return {
    total: lines.length,
    clean: lines.length === 0,
  };
}

function parseIncludedRepo(value) {
  const [repoPath, label] = value.split('::');
  const resolvedPath = path.resolve(repoPath);

  return {
    path: resolvedPath,
    label: label || path.basename(resolvedPath),
  };
}

function getRepoSnapshot({ repoPath, label, date, nextDate }) {
  const repoRoot = git(['rev-parse', '--show-toplevel'], { cwd: repoPath }) || repoPath;
  const branch = git(['branch', '--show-current'], { cwd: repoRoot });
  const commits = git(['log', `--since=${date} 00:00`, `--until=${nextDate} 00:00`, '--oneline'], { cwd: repoRoot });
  const status = git(['status', '--short'], { cwd: repoRoot });

  return {
    label,
    path: repoRoot,
    branch,
    commits,
    status,
  };
}

function formatRepoTracking(snapshot) {
  const statusSummary = parseStatus(snapshot.status);

  return [
    `### ${snapshot.label}`,
    '',
    `Path: \`${snapshot.path}\``,
    `Branch: \`${snapshot.branch || 'detached'}\``,
    `Working tree: ${statusSummary.clean ? 'clean' : `${statusSummary.total} changed entr${statusSummary.total === 1 ? 'y' : 'ies'}`}`,
    '',
    '#### Commits Today',
    '',
    formatCodeBlock(snapshot.commits),
  ].join('\n');
}

function createGeneratedBlock({ snapshots, date }) {
  const primary = snapshots[0];
  const statusSummary = parseStatus(primary.status);
  const generatedAt = new Date().toISOString();

  return [
    AUTO_START,
    '## Git Tracking',
    '',
    `Generated: ${generatedAt}`,
    `Date scope: ${date} 00:00 to generation time`,
    `Branch: \`${primary.branch || 'detached'}\``,
    `Working tree: ${statusSummary.clean ? 'clean' : `${statusSummary.total} changed entr${statusSummary.total === 1 ? 'y' : 'ies'}`}`,
    '',
    ...snapshots.map(formatRepoTracking),
    AUTO_END,
  ].join('\n');
}

function createNewShiftFile({ date, branch, generatedBlock }) {
  return [
    '# Daily Shift Tasks - Take Me Pic Mobile',
    '',
    `Date: ${date}`,
    'Project: Take Me Pic',
    `Branch: \`${branch || 'detached'}\``,
    'Shift owner: Codex agent',
    'Template source: `/Users/macbookpro/Downloads/daily_shift_tasks_2026-06-06.pdf`',
    '',
    '## Shift Summary',
    '',
    'Summarize the day in one or two sentences.',
    '',
    '## Big Tasks Done',
    '',
    '- [ ] Task summary',
    '',
    '## Verification',
    '',
    '- Command: `<command>`',
    '- Result: `<pass/fail/not run>`',
    '',
    generatedBlock,
    '',
    '## Next Shift Tasks',
    '',
    '- [ ] Task',
    '',
    '## Notes',
    '',
    '- Add decisions, risks, and follow-up context.',
    '',
  ].join('\n');
}

function upsertGeneratedBlock(content, generatedBlock) {
  const startIndex = content.indexOf(AUTO_START);
  const endIndex = content.indexOf(AUTO_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = content.slice(0, startIndex).trimEnd();
    const after = content.slice(endIndex + AUTO_END.length).trimStart();

    return `${before}\n\n${generatedBlock}\n\n${after}`.trimEnd() + '\n';
  }

  return `${content.trimEnd()}\n\n${generatedBlock}\n`;
}

const date = getArg('--date') || formatLocalDate(new Date());
const nextDate = getNextDate(date);
const repoRoot = git(['rev-parse', '--show-toplevel'], { cwd: process.cwd() }) || process.cwd();
const branch = git(['branch', '--show-current'], { cwd: repoRoot });
const includedRepos = getArgs('--include-repo').map(parseIncludedRepo);
const snapshots = [
  getRepoSnapshot({ repoPath: repoRoot, label: 'Mobile repo', date, nextDate }),
  ...includedRepos.map((repo) => getRepoSnapshot({
    repoPath: repo.path,
    label: repo.label,
    date,
    nextDate,
  })),
];
const outputDir = path.join(repoRoot, 'docs', 'daily_shift_tasks');
const outputPath = path.join(outputDir, `daily-shift-${date}.md`);
const generatedBlock = createGeneratedBlock({
  snapshots,
  date,
});

mkdirSync(outputDir, { recursive: true });

if (existsSync(outputPath)) {
  const existing = readFileSync(outputPath, 'utf8');
  writeFileSync(outputPath, upsertGeneratedBlock(existing, generatedBlock));
} else {
  writeFileSync(outputPath, createNewShiftFile({ date, branch, generatedBlock }));
}

console.log(`Daily shift task file updated: ${path.relative(repoRoot, outputPath)}`);
