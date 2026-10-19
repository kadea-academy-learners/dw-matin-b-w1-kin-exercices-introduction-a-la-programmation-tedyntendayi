// ===== ÉNONCÉ (ne pas modifier) =====
const enonce = `
M6 — Le détective du return (Niveau 2 — Moyen)

Objectif : distinguer return et console.log() et traquer les undefined.

Consignes : chacune des trois fonctions de la zone de travail a un bug.
Trouve-le, explique-le en commentaire, corrige-le.

Code fourni :
const doubler = (n) => { n * 2; };
console.log(doubler(4));           // undefined ?!

const calculerTva = (prix) => { console.log(prix * 0.16); };
const total = calculerTva(1000) + 500;
console.log(total);                // NaN ?!

const saluer = (prenom) => {
  return
    \`Mbote \${prenom}\`;
};
console.log(saluer('Ney'));        // undefined ?!

Résultat attendu après correction :
8, 660, Mbote Ney

Recherche (à rédiger dans RECHERCHES.md) :
Le troisième bug vient de l'« insertion automatique de point-virgule » (ASI). Explique ce mécanisme en 3 lignes.
`;
// ===== FIN ÉNONCÉ =====

// ✍️ Ton code ici 👇 (règles : const/let, ===, gabarits littéraux, fonctions fléchées, camelCase)

// Bug 1 : pas de return, donc la fonction renvoie undefined. Corrigé avec un retour implicite.
const doubler = (n) => n * 2;
console.log(doubler(4));

// Bug 2 : la fonction fait console.log mais ne renvoie rien (undefined + 500 = NaN).
const calculerTva = (prix) => prix * 0.16;
const total = calculerTva(1000) + 500;
console.log(total);

// Bug 3 : return seul sur sa ligne. L'ASI ajoute un ; juste après return,
// donc la chaîne n'est jamais renvoyée. Elle doit être sur la même ligne.
const saluer = (prenom) => {
  return `Mbote ${prenom}`;
};
console.log(saluer('Ney'));