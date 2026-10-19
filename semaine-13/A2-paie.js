// ===== ÉNONCÉ (ne pas modifier) =====
const enonce = `
A2 — Le moteur de paie v2 (Niveau 3 — Avancé)

Objectif : parcourir un tableau avec .forEach(), accumuler un total et appliquer une règle d'heures supplémentaires.
Contexte : Kadea Tech paie ses techniciens 2 500 FC de l'heure ; au-delà de 40 h par semaine, chaque heure est payée 1,5 fois.

Consignes :
1. Pars de const heuresSemaine = [8, 9, 10, 8, 7, 6]; (du lundi au samedi).
2. Calcule le total des heures avec .forEach() et un accumulateur.
3. Écris calculerSalaire(heures, tauxHoraire = 2500) qui gère les heures supplémentaires.
4. Avec une boucle for, trouve le jour le plus chargé.

Résultat attendu :
Total : 48 h — Salaire : 130000 FC ; jour le plus chargé : mercredi (10 h).

Recherche (à rédiger dans RECHERCHES.md) :
La méthode .reduce() n'a pas été vue en atelier. Explique ce qu'elle fait et réécris l'étape 2 avec elle.
`;
// ===== FIN ÉNONCÉ =====

// ✍️ Ton code ici 👇 (règles : const/let, ===, gabarits littéraux, fonctions fléchées, camelCase)


const heuresSemaine = [8, 9, 10, 8, 7, 6];
const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

// Étape 2 : total avec forEach et un accumulateur
let totalHeures = 0;
heuresSemaine.forEach((heures) => {
    totalHeures += heures;
});

// Étape 3 : salaire avec heures supplémentaires (au-delà de 40 h, x 1,5)
const calculerSalaire = (heures, tauxHoraire = 2500) => {
    const heuresNormales = Math.min(heures, 40);
    const heuresSup = Math.max(heures - 40, 0);
    return heuresNormales * tauxHoraire + heuresSup * tauxHoraire * 1.5;
};

console.log(`Total : ${totalHeures} h — Salaire : ${calculerSalaire(totalHeures)} FC`);

// Étape 4 : jour le plus chargé avec une boucle for
let indexMax = 0;
for (let i = 1; i < heuresSemaine.length; i++) {
    if (heuresSemaine[i] > heuresSemaine[indexMax]) {
        indexMax = i;
    }
}
console.log(`jour le plus chargé : ${jours[indexMax]} (${heuresSemaine[indexMax]} h)`);