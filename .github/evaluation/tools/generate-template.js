#!/usr/bin/env node
'use strict';

// Régénère semaine-13/*.js et RECHERCHES.md à partir de data/enonces.txt.
// Usage (coach uniquement) : node .github/evaluation/tools/generate-template.js [dossierDuDepot] [--force]
// Sans --force, les fichiers existants ne sont jamais écrasés.

const fs = require('node:fs');
const path = require('node:path');
const { loadEnonces, buildExerciseFile } = require('../lib/enonces');
const { exercises } = require('../exercises');

const args = process.argv.slice(2);
const force = args.includes('--force');
const root = path.resolve(args.find((a) => !a.startsWith('--')) || process.cwd());
const dir = path.join(root, 'semaine-13');
fs.mkdirSync(dir, { recursive: true });

const write = (file, content) => {
  if (fs.existsSync(file) && !force) {
    console.log(`= ${path.relative(root, file)} (existe déjà)`);
    return;
  }
  fs.writeFileSync(file, content);
  console.log(`+ ${path.relative(root, file)}`);
};

const enonces = loadEnonces();
enonces.forEach((e) => write(path.join(dir, e.file), buildExerciseFile(e)));

const titles = new Map(exercises.map((ex) => [ex.id, ex.title]));
const question = (enonce) => {
  const match = enonce.match(/Recherche \(à rédiger dans RECHERCHES\.md\) :\s*\n([\s\S]+)$/);
  return match ? match[1].trim().replace(/\s*\n\s*/g, ' ') : '';
};

const sections = enonces.map((e) =>
  [
    `## ${e.id} — ${titles.get(e.id)}`,
    '',
    `**Question :** ${question(e.enonce)}`,
    '',
    '**Ma réponse (avec mes mots, 3 à 5 lignes) :**',
    '',
    '...',
    '',
    '**Mon test dans la console :**',
    '',
    '```js',
    '// colle ici le test que tu as exécuté et le résultat obtenu',
    '```',
    '',
    '**Source :** ',
    '',
    '**IA utilisée ? (prompt + vérification sur MDN) :** non',
    '',
  ].join('\n'),
);

const recherches = [
  '# RECHERCHES — Semaine 13',
  '',
  '> Pour chaque exercice : reformule avec tes mots (pas de copier-coller), ajoute un test que tu as exécuté toi-même,',
  '> et cite une source précise (une page, pas juste « Google »). MDN en français est la référence.',
  '> Si tu as utilisé une IA, indique ton prompt et vérifie sa réponse sur MDN.',
  '> Ne modifie pas les titres `## F1 — …` : ils servent à l\'évaluation automatique.',
  '',
  ...sections,
].join('\n');
write(path.join(root, 'RECHERCHES.md'), recherches);
