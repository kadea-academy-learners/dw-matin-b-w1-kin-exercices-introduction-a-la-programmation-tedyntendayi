// ===== ÉNONCÉ (ne pas modifier) =====
const enonce = `
M2 — Le distributeur automatique (DAB) (Niveau 2 — Moyen)

Objectif : écrire une fonction fléchée qui vérifie plusieurs règles dans le bon ordre et renvoie un message.
Contexte : le DAB ne distribue que des billets de 5 000 FC et refuse les retraits au-delà de 500 000 FC.

Consignes :
1. Écris retirer(solde, montant) qui renvoie un message (pas de console.log dans la fonction).
2. Refuse un montant négatif ou non multiple de 5 000, puis un montant au-delà du plafond, puis un montant supérieur au solde.
3. Si tout est bon, renvoie le nouveau solde.
4. Teste les 4 cas ci-dessous.

Résultat attendu :
retirer(100000, 25000)   -> Retrait accepté. Nouveau solde : 75000 FC
retirer(100000, 12000)   -> Montant invalide : multiples de 5 000 FC uniquement
retirer(1000000, 600000) -> Plafond dépassé : 500 000 FC maximum
retirer(20000, 50000)    -> Solde insuffisant

Recherche (à rédiger dans RECHERCHES.md) :
Comment afficher 75000 sous la forme 75 000 avec toLocaleString() ?
`;
// ===== FIN ÉNONCÉ =====

// ✍️ Ton code ici 👇 (règles : const/let, ===, gabarits littéraux, fonctions fléchées, camelCase)


