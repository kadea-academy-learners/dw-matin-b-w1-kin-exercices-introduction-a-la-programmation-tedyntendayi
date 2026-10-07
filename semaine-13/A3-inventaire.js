// ===== ÉNONCÉ (ne pas modifier) =====
const enonce = `
A3 — L'inventaire en console (Niveau 3 — Avancé)

Objectif : manipuler un tableau d'objets avec .filter(), .map() et .find(), et gérer le cas undefined.
Contexte : la boutique de Kadea Academy veut suivre son stock (prix fictifs).

Consignes :
1. Crée ce tableau d'objets (propriétés : id, nom, categorie, prixFC, stock) :
   101 | Clé USB 32 Go    | Informatique | 14000 | 25
   102 | Sac à dos Kadea  | Accessoires  | 42000 | 0
   103 | Souris sans fil  | Informatique | 28000 | 12
   104 | Gourde isotherme | Accessoires  | 21000 | 8
   105 | Casque audio     | Informatique | 70000 | 0
   106 | Carnet de notes  | Papeterie    | 7000  | 40
2. Affiche-le avec console.table().
3. Avec .filter(), garde la catégorie Informatique.
4. Avec .map(), ajoute un prixUSD arrondi, avec const TAUX = 2800; (taux fictif).
5. Avec .find(), écris chercherProduit(id) qui renvoie le produit ou le message Produit introuvable.
6. Compte les produits en rupture de stock.

Résultat attendu :
3 produits Informatique (101, 103, 105) ; prix USD 5, 15, 10, 8, 25, 3 ;
chercherProduit(104) -> la gourde ; chercherProduit(999) -> Produit introuvable ; 2 produits en rupture.

Recherche (à rédiger dans RECHERCHES.md) :
Comment afficher seulement les colonnes nom et stock avec console.table() ? Et que renvoient .find() et .filter() quand rien ne correspond ?
`;
// ===== FIN ÉNONCÉ =====

// ✍️ Ton code ici 👇 (règles : const/let, ===, gabarits littéraux, fonctions fléchées, camelCase)


