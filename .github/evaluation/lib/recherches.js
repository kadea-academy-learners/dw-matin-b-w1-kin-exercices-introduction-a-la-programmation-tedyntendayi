'use strict';

const fs = require('node:fs');

const MIN_ANSWER_LENGTH = 120; // environ 2 à 3 lignes rédigées
const SEARCH_ENGINES = /(^|\.)(google|bing|duckduckgo|yahoo|qwant)\./;

const between = (text, startRegex, endRegex) => {
  const start = text.search(startRegex);
  if (start === -1) return '';
  const afterStart = text.slice(start).replace(startRegex, '');
  const end = afterStart.search(endRegex);
  return end === -1 ? afterStart : afterStart.slice(0, end);
};

const parseSections = (markdown) => {
  const sections = new Map();
  const parts = markdown.split(/^(?=##\s+[FMA]\d\b)/m);
  parts.forEach((part) => {
    const match = part.match(/^##\s+([FMA]\d)\b/);
    if (match) sections.set(match[1].toUpperCase(), part);
  });
  return sections;
};

const analyzeSection = (section) => {
  const answer = between(section, /\*\*Ma réponse[^\n]*\n?/i, /\*\*Mon test/i)
    .replace(/^\s*\.{3}\s*$/gm, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
  const testBlock = between(section, /\*\*Mon test[^\n]*\n?/i, /\*\*Source/i);
  const testLines = testBlock
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '' && !l.startsWith('```') && !l.startsWith('//') && !l.startsWith('<!--'));
  const sourceBlock = between(section, /\*\*Source[^\n]*?:\*\*/i, /\n\*\*/);
  const urls = (sourceBlock.match(/https?:\/\/[^\s)>\]]+/g) || []).filter((url) => {
    try {
      const u = new URL(url);
      return !SEARCH_ENGINES.test(u.hostname) && u.pathname.length > 1;
    } catch {
      return false;
    }
  });
  return {
    answerOk: answer.length >= MIN_ANSWER_LENGTH,
    testOk: testLines.length > 0,
    sourceOk: urls.length > 0,
    mdn: urls.some((u) => u.includes('developer.mozilla.org')),
  };
};

const evaluateRecherche = (section) => {
  if (!section) {
    return { score: 0, feedback: 'Section absente de RECHERCHES.md.' };
  }
  const r = analyzeSection(section);
  const score = [r.answerOk, r.testOk, r.sourceOk].filter(Boolean).length;
  const missing = [];
  if (!r.answerOk) missing.push(`réponse reformulée trop courte ou vide (min. ${MIN_ANSWER_LENGTH} caractères)`);
  if (!r.testOk) missing.push('aucun test exécuté dans la console');
  if (!r.sourceOk) missing.push('pas de lien précis vers une page source (MDN de préférence)');
  let feedback;
  if (score === 0) feedback = 'Recherche non rédigée.';
  else if (score === 3) feedback = r.mdn ? 'Recherche complète, testée et sourcée (MDN).' : 'Recherche complète ; privilégie une source MDN.';
  else feedback = `Recherche incomplète : ${missing.join(' ; ')}.`;
  return { score, feedback };
};

const loadRecherches = (file) => {
  if (!fs.existsSync(file)) return { exists: false, sections: new Map() };
  return { exists: true, sections: parseSections(fs.readFileSync(file, 'utf8')) };
};

module.exports = { loadRecherches, evaluateRecherche, parseSections, analyzeSection };
