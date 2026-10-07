#!/usr/bin/env node
'use strict';

/**
 * Évaluation automatique — Semaine 13 (JavaScript).
 * Usage : node .github/evaluation/evaluate.js [dossierDuDepot] [fichierDeSortie]
 */

const fs = require('node:fs');
const path = require('node:path');

const { exercises } = require('./exercises');
const { loadEnonces, WORK_HEADER } = require('./lib/enonces');
const { analyze, stripEnonce } = require('./lib/static');
const { runCode } = require('./lib/sandbox');
const { commonRules } = require('./lib/rules');
const { loadRecherches, evaluateRecherche } = require('./lib/recherches');
const { loadCommits, hasCommitFor, currentSha } = require('./lib/git');
const { scoreRubric } = require('./lib/rubric');
const { mdCell } = require('./lib/text');

const ROOT = path.resolve(process.argv[2] || process.cwd());
const OUTPUT = path.resolve(process.argv[3] || path.join(ROOT, 'evaluation.md'));
const EXERCISE_DIR = path.join(ROOT, 'semaine-13');
const MAX_DETAILS = 4;

const CASES = {
  1: { label: 'Non rendu', icon: '⬜' },
  2: { label: "Erreur d'exécution", icon: '❌' },
  3: { label: 'Résultat incorrect', icon: '🟠' },
  4: { label: 'Règles non respectées', icon: '🟡' },
  5: { label: 'Parfait', icon: '✅' },
};

const GENERIC_FEEDBACK = {
  1: (file) => `Exercice non commencé : écris ton code dans \`semaine-13/${file}\` sous l'énoncé.`,
  2: () => "Ton code s'arrête sur une erreur : lis le message, corrige la ligne indiquée et relance ton fichier avec node.",
};

const findFile = (id, expected) => {
  if (!fs.existsSync(EXERCISE_DIR)) return null;
  const exact = path.join(EXERCISE_DIR, expected);
  if (fs.existsSync(exact)) return exact;
  const match = fs.readdirSync(EXERCISE_DIR).find((f) => f.toUpperCase().startsWith(`${id}-`) && f.endsWith('.js'));
  return match ? path.join(EXERCISE_DIR, match) : null;
};

const squash = (text) => text.replace(/\s+/g, '');

const evaluateExercise = (ex, enonce) => {
  const file = findFile(ex.id, enonce.file);
  const result = { id: ex.id, title: ex.title, file: file ? path.basename(file) : enonce.file, details: [], commonRulesOk: false };
  const finish = (caseNumber, note, details = []) => {
    const base = (ex.feedback && ex.feedback[caseNumber]) || (GENERIC_FEEDBACK[caseNumber] && GENERIC_FEEDBACK[caseNumber](result.file)) || '';
    return { ...result, case: caseNumber, note, feedback: base, details: details.slice(0, MAX_DETAILS) };
  };

  if (!file) return finish(1, 0, ['Fichier introuvable dans semaine-13/.']);

  const source = fs.readFileSync(file, 'utf8');
  const facts = analyze(source, { allowClassicFunctions: ex.allowClassicFunctions });
  if (facts.syntaxError) return finish(2, 1, [facts.syntaxError]);

  const workArea = stripEnonce(source).replace(WORK_HEADER, '');
  if (facts.empty || squash(workArea) === squash(enonce.starter)) return finish(1, 0);

  // Les commentaires fournis dans le code de départ ne comptent pas comme travail de l'apprenant.
  const starterFacts = analyze(`${WORK_HEADER}\n${enonce.starter}`);
  const starterComments = new Set((starterFacts.comments || []).map((c) => c.text));
  facts.studentComments = facts.comments.filter((c) => !starterComments.has(c.text));

  const run = (code, options) => runCode(code, { filename: result.file, ...options });
  const main = run(source, ex.runOptions);
  if (main.error) return finish(2, 1, [main.errorMessage]);

  let tests;
  try {
    tests = ex.tests({ main, facts, source, run });
  } catch (e) {
    tests = [{ label: 'Tests', ok: false, hint: `Test impossible à exécuter : ${e.message}` }];
  }
  const common = commonRules(facts, ex);
  const specific = ex.rules ? ex.rules(facts) : [];
  const failedTests = tests.filter((t) => !t.ok);
  const failedRules = [...common, ...specific].filter((r) => !r.ok);
  result.commonRulesOk = common.every((r) => r.ok);
  result.tests = { passed: tests.length - failedTests.length, total: tests.length };

  if (failedTests.length > 0) {
    const ratio = (tests.length - failedTests.length) / tests.length;
    return finish(3, ratio >= 0.5 ? 3 : 2, [...failedTests, ...failedRules].map((c) => c.hint));
  }
  if (failedRules.length > 0) return finish(4, 4, failedRules.map((r) => r.hint));
  return finish(5, 5);
};

const buildReport = (results, rubric, meta) => {
  const totalNotes = results.reduce((sum, r) => sum + r.note, 0);
  const totalRubric = rubric.reduce((sum, c) => sum + c.points, 0);
  const out = [];
  out.push('# 📊 Évaluation automatique — Semaine 13 (JavaScript)');
  out.push('');
  out.push(`> Générée le ${meta.date} · commit \`${meta.sha}\` · évaluation déterministe basée uniquement sur le cahier d'exercices et le barème.`);
  out.push('');
  out.push(`## Note finale : **${totalRubric} / 15**`);
  out.push('');
  out.push(`Exercices : **${totalNotes} / ${results.length * 5}** · Parfaits : ${results.filter((r) => r.case === 5).length} / ${results.length} · Non rendus : ${results.filter((r) => r.case === 1).length}`);
  out.push('');
  out.push('## 1. Résultat par exercice');
  out.push('');
  out.push('| Exercice | Note /5 | Statut | Tests | Recherche /3 | Commit | Feedback |');
  out.push('|---|:-:|---|:-:|:-:|:-:|---|');
  results.forEach((r) => {
    const status = `${CASES[r.case].icon} ${CASES[r.case].label}`;
    const tests = r.tests ? `${r.tests.passed}/${r.tests.total}` : '—';
    const commit = meta.commitsAvailable ? (r.commit ? '✅' : '❌') : 'n/a';
    const details = r.details.length > 0 ? `\n${r.details.map((d) => `• ${d}`).join('\n')}` : '';
    const feedback = `${r.feedback}${details}\n📚 ${r.recherche.feedback}`;
    out.push(`| **${r.id}** — ${mdCell(r.title)} | **${r.note}** | ${status} | ${tests} | ${r.recherche.score} | ${commit} | ${mdCell(feedback)} |`);
  });
  out.push('');
  out.push('## 2. Barème officiel (/15)');
  out.push('');
  out.push('| Critère | Niveau | Points /3 | Feedback |');
  out.push('|---|---|:-:|---|');
  rubric.forEach((c) => {
    out.push(`| ${mdCell(c.name)} | ${c.level} (${c.percent} %) | **${c.points}** | ${mdCell(`${c.feedback}\n_${c.detail}_`)} |`);
  });
  out.push(`| **Total** | | **${totalRubric} / 15** | |`);
  out.push('');
  out.push('## Comment lire cette évaluation');
  out.push('');
  out.push('| Statut | Signification | Note /5 |');
  out.push('|---|---|:-:|');
  out.push('| ⬜ Non rendu | Fichier absent ou zone de travail vide / non modifiée | 0 |');
  out.push("| ❌ Erreur d'exécution | SyntaxError, ReferenceError, exception ou boucle infinie (> 2 s) | 1 |");
  out.push('| 🟠 Résultat incorrect | Au moins un résultat attendu du cahier n\'est pas obtenu | 2 (3 si au moins la moitié des tests passe) |');
  out.push('| 🟡 Règles non respectées | Résultats justes, mais var, ==, concaténation, `function`, `let` inutile ou notion imposée absente | 4 |');
  out.push('| ✅ Parfait | Résultats justes et toutes les règles respectées | 5 |');
  out.push('');
  out.push('Recherche /3 : 1 point pour une réponse rédigée (≥ 120 caractères), 1 point pour un test exécuté, 1 point pour un lien source précis. Commit : un commit dont le message cite l\'exercice (ex. `feat: M2 dab`).');
  out.push('');
  out.push("> ℹ️ L'explication orale de ton code reste évaluée par ton coach. Corrige, commit, merge sur `develop` et push : l'évaluation est relancée automatiquement.");
  out.push('');
  return out.join('\n');
};

const main = () => {
  const enonces = new Map(loadEnonces().map((e) => [e.id, e]));
  const recherches = loadRecherches(path.join(ROOT, 'RECHERCHES.md'));
  const commits = loadCommits(ROOT);

  const results = exercises.map((ex) => {
    const r = evaluateExercise(ex, enonces.get(ex.id));
    r.recherche = recherches.exists ? evaluateRecherche(recherches.sections.get(ex.id)) : { score: 0, feedback: 'RECHERCHES.md introuvable.' };
    r.commit = hasCommitFor(commits, ex.id);
    return r;
  });

  const rubric = scoreRubric(results, Boolean(commits));
  const report = buildReport(results, rubric, {
    date: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
    sha: currentSha(ROOT),
    commitsAvailable: Boolean(commits),
  });
  fs.writeFileSync(OUTPUT, report);

  const total = rubric.reduce((sum, c) => sum + c.points, 0);
  results.forEach((r) => console.log(`${r.id.padEnd(3)} ${String(r.note).padStart(1)}/5  ${CASES[r.case].label.padEnd(22)} R${r.recherche.score}/3  ${r.details[0] || ''}`));
  console.log(`\nNote finale : ${total}/15 → ${path.relative(process.cwd(), OUTPUT) || OUTPUT}`);
};

main();
