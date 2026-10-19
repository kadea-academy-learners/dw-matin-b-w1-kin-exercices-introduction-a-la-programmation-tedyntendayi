// ===== ÉNONCÉ (ne pas modifier) =====
const enonce = `
A4 — Le classement de la promo (Niveau 3 — Avancé)

Objectif : combiner fonctions, boucles, conditions et méthodes de tableau dans un même programme.
Contexte : un formateur veut le bulletin d'une promo fictive.

Consignes :
1. Crée un tableau d'objets : Amani [14, 16, 15], Bijou [17, 18, 16], Christian [8, 11, 9], Divine [12, 10, 14], Exaucé [16, 15, 19].
2. Écris calculerMoyenne(notes) avec une boucle et un accumulateur, arrondie à une décimale.
3. Avec .map(), crée un bulletin avec nom, moyenne et mention : 16 et plus « Excellent », 10 et plus « Admis », sinon « Rattrapage ».
4. Avec .filter(), compte les admis (mention Excellent ou Admis) ; avec .find(), trouve le premier « Excellent ».
5. Affiche le bulletin avec console.table().

Résultat attendu :
moyennes 15, 17, 9.3, 12, 16.7 ; 4 admis ; premier Excellent : Bijou.

Recherche (à rédiger dans RECHERCHES.md) :
Comment classer le bulletin de la meilleure à la moins bonne moyenne avec .sort() ? Pourquoi .sort() modifie-t-il le tableau d'origine, et comment l'éviter ?
`;
// ===== FIN ÉNONCÉ =====

// ✍️ Ton code ici 👇 (règles : const/let, ===, gabarits littéraux, fonctions fléchées, camelCase)

const promo = [
    { nom: 'Amani', notes: [14, 16, 15] },
    { nom: 'Bijou', notes: [17, 18, 16] },
    { nom: 'Christian', notes: [8, 11, 9] },
    { nom: 'Divine', notes: [12, 10, 14] },
    { nom: 'Exaucé', notes: [16, 15, 19] },
];

const calculerMoyenne = (notes) => {
    let somme = 0;
    for (const note of notes) {
        somme += note;
    }
    return Math.round((somme / notes.length) * 10) / 10;
};

const trouverMention = (moyenne) => {
    if (moyenne >= 16) {
        return 'Excellent';
    }
    if (moyenne >= 10) {
        return 'Admis';
    }
    return 'Rattrapage';
};

const bulletin = promo.map((eleve) => {
    const moyenne = calculerMoyenne(eleve.notes);
    return { nom: eleve.nom, moyenne, mention: trouverMention(moyenne) };
});

const admis = bulletin.filter((eleve) => eleve.mention !== 'Rattrapage');
const premierExcellent = bulletin.find((eleve) => eleve.mention === 'Excellent');

console.table(bulletin);
console.log(`Nombre d'admis : ${admis.length}`);
console.log(`Premier Excellent : ${premierExcellent.nom}`);
