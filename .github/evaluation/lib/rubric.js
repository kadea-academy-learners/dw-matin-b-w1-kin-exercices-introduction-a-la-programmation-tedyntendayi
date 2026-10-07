'use strict';

// Barème officiel : 5 critères × 3 points. Les textes de niveau sont repris du barème.
const LEVELS = ['Débutant : Insuffisant', 'En développement : À améliorer', 'Compétent : Satisfaisant', 'Avancé'];

const toLevel = (ratio) => {
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.65) return 2;
  if (ratio >= 0.35) return 1;
  return 0;
};

const mean = (values) => (values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length);

const CRITERIA = [
  {
    name: 'Fondations : variables, types primitifs et conversions',
    proofs: ['F1', 'F2', 'M3'],
    texts: [
      'Utilisation de var, variables non déclarées ou redéclarées (SyntaxError). Incapable d\'identifier le type d\'une valeur.',
      'let utilisé partout par réflexe, ou confusion entre null et undefined. Conversion oubliée : des calculs donnent \'2500500\' ou NaN sans que ce soit remarqué.',
      'Déclarations correctes avec const / let, aucun var. Les 5 types primitifs sont reconnus. Le piège \'5\' + 3 est identifié et corrigé avec Number().',
      'const par défaut et let uniquement pour les valeurs réassignées, choix justifiés. typeof (y compris null) et conversions Number(\'\'), Number(\'abc\') maîtrisés. Truthy / falsy expliqués.',
    ],
  },
  {
    name: 'Logique conditionnelle et opérateurs',
    proofs: ['F3', 'F4', 'M1', 'M2', 'M4'],
    texts: [
      '== ou affectation = dans un if, branches manquantes, résultats faux selon les valeurs testées.',
      'Ordre des conditions erroné (MalewaWewa jamais affiché) ou confusion entre = et ===. Les cas limites ne sont pas testés.',
      'if / else if / else corrects, égalité stricte === systématique, modulo maîtrisé (pair / impair, multiples). Ternaire simple fonctionnel.',
      'Conditions ordonnées du cas le plus restrictif au plus général (FizzBuzz, DAB) et cas limites testés (0, négatif, plafond). ?? utilisé à bon escient.',
    ],
  },
  {
    name: 'Fonctions, return et portée',
    proofs: ['F5', 'M2', 'M5', 'M6'],
    texts: [
      'Aucune fonction, le code est copié-collé ; ou fonctions déclarées mais jamais appelées.',
      'Confusion entre return et console.log() qui produit des undefined ou des NaN en chaîne. Fonctions appelées sans () ou avec les arguments dans le désordre.',
      'Les fonctions renvoient leur résultat avec return (pas de console.log à l\'intérieur) et sont appelées avec les bons arguments. Portée de bloc respectée : aucune ReferenceError.',
      'Fonctions fléchées concises (retour implicite quand c\'est pertinent), paramètres par défaut, une fonction pour une responsabilité. Bug de l\'ASI et bannissement de var expliqués.',
    ],
  },
  {
    name: 'Boucles, accumulateurs et méthodes de tableau',
    proofs: ['F6', 'M1', 'M7', 'M8'],
    advanced: ['A2', 'A3', 'A4', 'A5'],
    texts: [
      'Boucle infinie qui fige le navigateur, ou répétition faite par copier-coller.',
      'Erreur de bornes (un tour en trop ou en moins), accumulateur remis à zéro dans la boucle, break / continue mal placés.',
      'Boucle for correcte (départ, condition, pas), accumulateur initialisé avant la boucle, while avec une condition d\'arrêt sûre. Résultats attendus exacts (27000 FC pour M7, 6 h pour M8).',
      'Boucle adaptée choisie (for / while). Tableaux d\'objets traités avec .filter(), .map(), .find() et un return dans chaque callback ; cas undefined de .find() géré ; console.table() utilisé.',
    ],
  },
  {
    name: 'Recherche, qualité du code et restitution',
    proofs: [],
    texts: [
      'Pas de RECHERCHES.md ou aucune source. Code non poussé sur GitHub.',
      'Recherches partielles ou sans test. Peu de commits (un seul commit en fin de semaine).',
      'Recherches reformulées et sourcées pour la majorité des exercices. Règles de code respectées (const, ===, fléchées, backticks).',
      'RECHERCHES.md complet, testé et sourcé (MDN). Commits réguliers et explicites (un par exercice).',
    ],
  },
];

const scoreRubric = (results, commitsAvailable) => {
  const byId = new Map(results.map((r) => [r.id, r]));
  const codeRatio = (ids) => mean(ids.map((id) => byId.get(id).note / 5));
  const researchRatio = (ids) => mean(ids.map((id) => byId.get(id).recherche.score / 3));

  return CRITERIA.map((criterion, index) => {
    let ratio;
    let detail;
    if (index <= 2) {
      // Critères 1 à 3 : code (80 %) + explications demandées dans les recherches associées (20 %).
      ratio = 0.8 * codeRatio(criterion.proofs) + 0.2 * researchRatio(criterion.proofs);
      detail = `Preuves : ${criterion.proofs.join(', ')}`;
    } else if (index === 3) {
      ratio = codeRatio(criterion.proofs);
      detail = `Preuves : ${criterion.proofs.join(', ')} ; niveau Avancé : ${criterion.advanced.join(', ')}`;
    } else {
      const research = researchRatio(results.map((r) => r.id));
      const rendered = results.filter((r) => r.case > 1);
      const commits = commitsAvailable ? results.filter((r) => r.commit).length / results.length : 0;
      const quality = rendered.length === 0 ? 0 : rendered.filter((r) => r.commonRulesOk).length / rendered.length;
      ratio = 0.5 * research + 0.25 * commits + 0.25 * quality;
      detail = `Recherches ${Math.round(research * 100)} % · commits par exercice ${Math.round(commits * 100)} % · règles de code ${Math.round(quality * 100)} %`;
    }
    let points = toLevel(ratio);
    if (index === 3 && points === 3 && codeRatio(criterion.advanced) < 0.9) {
      points = 2;
      detail += ' (A2 à A5 doivent être réussis pour le niveau Avancé)';
    }
    return {
      name: criterion.name,
      points,
      level: LEVELS[points],
      percent: Math.round(ratio * 100),
      feedback: criterion.texts[points],
      detail,
    };
  });
};

module.exports = { scoreRubric, CRITERIA };
