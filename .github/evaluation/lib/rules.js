'use strict';

// Une vérification = { label, ok, hint } ; `hint` n'est affiché que si ok === false.
const check = (label, ok, hint) => ({ label, ok: Boolean(ok), hint: hint || label });

const lines = (items) => items.map((i) => i.line).filter(Boolean).slice(0, 3).join(', ');

// Règles de code obligatoires du cahier, appliquées à tous les exercices.
const commonRules = (facts, ex) => {
  const s = facts.summary;
  const rules = [
    check('Aucun `var`', s.varCount === 0, '`var` est interdit : utilise `const` (ou `let` si la valeur change).'),
    check(
      'Égalité stricte uniquement',
      s.looseEq.length === 0,
      `\`${s.looseEq.map((e) => e.op).join('`, `')}\` utilisé (ligne ${lines(s.looseEq)}) : remplace par \`===\` / \`!==\`.`,
    ),
    check(
      '`const` par défaut',
      facts.letNeverReassigned.length === 0,
      `\`let\` jamais réassigné : ${facts.letNeverReassigned.map((l) => `\`${l.name}\``).join(', ')} → utilise \`const\`.`,
    ),
    check(
      'Pas de concaténation avec +',
      facts.concat.length === 0,
      `Message construit avec \`+\` (ligne ${lines(facts.concat)}) : utilise un gabarit littéral \`...\${x}...\`.`,
    ),
    check(
      'Fonctions fléchées',
      facts.classicFunctions.length === 0,
      `Mot-clé \`function\` utilisé (${facts.classicFunctions.map((f) => `\`${f.name}\` l.${f.line}`).join(', ')}) : écris une fonction fléchée.`,
    ),
  ];
  if (ex.messages) {
    rules.push(
      check(
        'Gabarits littéraux',
        s.templatesWithExpr.length > 0,
        'Aucun gabarit littéral avec `${...}` : construis tes messages avec des backticks.',
      ),
    );
  }
  return rules;
};

// Raccourcis pour les règles spécifiques de chaque exercice.
const uses = {
  operator: (facts, op) => facts.summary.operators.has(op),
  call: (facts, name) => facts.summary.calls.has(name),
  method: (facts, name) => facts.summary.methods.has(name),
  fn: (facts, name) => facts.functions.get(name),
  commentCount: (facts) => (facts.studentComments || facts.comments).filter((c) => c.text.length > 3).length,
};

module.exports = { check, commonRules, uses };
