# Semaine 13 — Introduction à la programmation & les bases de JavaScript

Cahier de 19 exercices, du facile à l'avancé. Chaque fichier de `semaine-13/` contient son énoncé
(dans la constante `enonce`, à ne pas modifier) : écris ton code **sous** la ligne `// ✍️ Ton code ici 👇`.

| Niveau | Exercices |
|---|---|
| 1 — Facile | F1 à F6 |
| 2 — Moyen | M1 à M8 |
| 3 — Avancé | A1 à A5 (commence par A1 et A3) |

## Règles de code obligatoires

- jamais de `var` : `const` par défaut, `let` seulement si la valeur change ;
- toujours `===` et `!==`, jamais `==` ;
- des gabarits littéraux pour les messages : `` `Mbote ${prenom} !` `` ;
- des fonctions fléchées (sauf consigne contraire) ;
- des noms de variables clairs en camelCase.

## Tester ton code

```bash
node semaine-13/F1-carte-apprenant.js
```

A5 utilise `prompt()` : teste-le dans la console du navigateur.

## Rendu

1. Un commit par exercice terminé, avec l'identifiant dans le message (ex. `feat: M2 dab`).
2. Tes recherches dans `RECHERCHES.md` (ne modifie pas les titres `## F1 — …`).
3. **Merge tout sur la branche `develop`, puis push.** Sans ce merge et ce push, pas d'évaluation automatique.

## Évaluation automatique

À chaque push sur `develop`, GitHub Actions évalue ton travail et écrit `evaluation.md` à la racine
(note et feedback par exercice, puis la note /15 du barème). Récupère-le avec `git pull`.

Pour chaque exercice, ton feedback correspond à l'un de ces 5 cas :

| Statut | Signification | Note /5 |
|---|---|:-:|
| ⬜ Non rendu | fichier absent, ou zone de travail vide ou non modifiée | 0 |
| ❌ Erreur d'exécution | SyntaxError, ReferenceError, exception ou boucle infinie | 1 |
| 🟠 Résultat incorrect | au moins un « Résultat attendu » du cahier n'est pas obtenu | 2 ou 3 |
| 🟡 Règles non respectées | résultats justes, mais `var`, `==`, `+` pour les messages, `function`, `let` inutile ou notion imposée absente | 4 |
| ✅ Parfait | résultats justes et toutes les règles respectées | 5 |

> Ne modifie pas le dossier `.github/` : il contient l'évaluateur.
> L'explication orale de ton code reste évaluée par ton coach.
