'use strict';

const { execFileSync } = require('node:child_process');

const BOT_AUTHOR = /\[bot\]|github-actions|classroom/i;

// Liste des commits de l'apprenant (null si le dossier n'est pas un dépôt git).
const loadCommits = (root) => {
  try {
    const out = execFileSync('git', ['-C', root, 'log', '--no-merges', '--format=%an%x09%ae%x09%s'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [author, email, ...subject] = line.split('\t');
        return { author, email, subject: subject.join('\t') };
      })
      .filter((c) => !BOT_AUTHOR.test(`${c.author} ${c.email}`));
  } catch {
    return null;
  }
};

const hasCommitFor = (commits, id) => Boolean(commits) && commits.some((c) => new RegExp(`\\b${id}\\b`, 'i').test(c.subject));

const currentSha = (root) => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execFileSync('git', ['-C', root, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return 'n/a';
  }
};

module.exports = { loadCommits, hasCommitFor, currentSha };
