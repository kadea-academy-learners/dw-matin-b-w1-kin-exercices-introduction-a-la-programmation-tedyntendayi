'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'enonces.txt');

const WORK_HEADER = "// ✍️ Ton code ici 👇 (règles : const/let, ===, gabarits littéraux, fonctions fléchées, camelCase)";

// Lit data/enonces.txt : source unique des énoncés et du code de départ de chaque exercice.
const loadEnonces = () => {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return raw
    .split(/^@@@ (?=[FMA]\d )/m)
    .filter((block) => block.trim() !== '')
    .map((block) => {
      const [headerLine, ...rest] = block.split('\n');
      const [id, file] = headerLine.trim().split(/\s+/);
      const [enonce, starter = ''] = rest.join('\n').split(/^@@@ starter\s*$/m);
      return { id, file, enonce: enonce.trim(), starter: starter.trim() };
    });
};

const escapeTemplate = (text) => text.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const buildExerciseFile = ({ enonce, starter }) =>
  [
    '// ===== ÉNONCÉ (ne pas modifier) =====',
    'const enonce = `',
    escapeTemplate(enonce),
    '`;',
    '// ===== FIN ÉNONCÉ =====',
    '',
    WORK_HEADER,
    '',
    starter,
    '',
  ].join('\n');

module.exports = { loadEnonces, buildExerciseFile, WORK_HEADER };
