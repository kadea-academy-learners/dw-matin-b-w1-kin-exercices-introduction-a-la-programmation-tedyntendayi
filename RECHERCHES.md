# RECHERCHES — Semaine 13

> Pour chaque exercice : reformule avec tes mots (pas de copier-coller), ajoute un test que tu as exécuté toi-même,
> et cite une source précise (une page, pas juste « Google »). MDN en français est la référence.
> Si tu as utilisé une IA, indique ton prompt et vérifie sa réponse sur MDN.
> Ne modifie pas les titres `## F1 — …` : ils servent à l'évaluation automatique.

## F1 — Ma carte d'apprenant

**Question :** Pourquoi typeof null renvoie-t-il 'object' alors que null n'est pas un objet ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

typeof null renvoie “object” à cause d’un bug présent depuis les débuts de JavaScript. null n’est pas un objet, il signifie “aucune valeur”. Le bug n’a jamais été corrigé car cela casserait de nombreux sites existants. 

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## F2 — Le convertisseur de saisie

**Question :** Qu'est-ce que NaN, et pourquoi NaN === NaN renvoie false ? Quelle fonction utiliser pour le détecter ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
NaN signifie "Not a Number" : on l'obtient quand une conversion en nombre échoue, par exemple Number('abc'). NaN === NaN renvoie false car NaN n'est égal à aucune valeur, pas même à lui-même. Pour le détecter, on utilise Number.isNaN().

**Mon test dans la console :**

```js
console.log(NaN === NaN, Number.isNaN(NaN));
// résultat : false true
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/NaN

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude d'expliquer NaN et Number.isNaN. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/NaN

## F3 — Pair ou impair : le tirage des tickets

**Question :** Que renvoie -7 % 2 ? Déduis-en pourquoi il vaut mieux tester % 2 !== 0 plutôt que % 2 === 1 pour détecter un nombre impair.

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
-7 % 2 renvoie -1, parce qu'en JavaScript le reste d'une division prend le signe du premier nombre. Tester % 2 === 1 ne détecte que les impairs positifs, car pour un impair négatif le reste vaut -1 et -1 === 1 est faux. Tester % 2 !== 0 est plus sûr : un nombre impair a toujours un reste différent de 0, qu'il soit positif ou négatif.

**Mon test dans la console :**

```js
console.log(-7 % 2);
// résultat : -1
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Remainder

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude d'expliquer pourquoi % 2 !== 0 est plus sûr que % 2 === 1. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Remainder

## F4 — Le contrôleur du bus

**Question :** Peut-on enchaîner plusieurs ternaires ? Pourquoi est-ce souvent déconseillé ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
Oui, on peut enchaîner plusieurs ternaires, par exemple a ? b : c ? d : e. Mais c'est souvent déconseillé, car le code devient vite difficile à lire et à déboguer, et on peut se tromper dans l'ordre des conditions. Avec trois cas ou plus, un if / else if / else est plus clair.

**Mon test dans la console :**

```js
const age = 16;
console.log(age < 5 ? 'gratuit' : age < 18 ? '500 FC' : '1 000 FC');
// résultat : 500 FC
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Conditional_operator

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude si on peut enchaîner des ternaires et pourquoi c'est déconseillé. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Conditional_operator

## F5 — Ma première fonction fléchée

**Question :** Quand peut-on enlever les parenthèses autour des paramètres, et quand peut-on enlever return et les accolades ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## F6 — Le compte à rebours

**Question :** À quoi sert le mot-clé continue ? Quelle différence avec break ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## M1 — FizzBuzz kinois

**Question :** Pourquoi FizzBuzz est-il célèbre dans les entretiens d'embauche de développeurs ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## M2 — Le distributeur automatique (DAB)

**Question :** Comment afficher 75000 sous la forme 75 000 avec toLocaleString() ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## M3 — Le détecteur de champs vides (Truthy / Falsy)

**Question :** Quelle est la liste complète des valeurs falsy en JavaScript ? (Indice : il y en a plus que dans cet exercice.)

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## M4 — Le score par défaut : || contre ??

**Question :** Que fait l'opérateur ?? (coalescence des nuls) et en quoi est-il différent de || ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## M5 — La vitre teintée (portée de bloc)

**Question :** Pourquoi var est-il banni du code moderne ? Cherche ce que sont la portée de fonction et le « hoisting ».

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## M6 — Le détective du return

**Question :** Le troisième bug vient de l'« insertion automatique de point-virgule » (ASI). Explique ce mécanisme en 3 lignes.

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## M7 — La tirelire numérique

**Question :** Cite tous les opérateurs d'affectation composée (+=, -=…) et donne un exemple pour chacun.

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## M8 — La batterie qui se décharge

**Question :** Quelle est la différence entre while et do...while ? Que donnerait l'étape 4 avec un do...while ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## A1 — Kadea Express v2 : le calculateur de livraison

**Question :** Pourquoi 0.1 + 0.2 ne donne-t-il pas 0.3 en JavaScript ? Et pourquoi toFixed() est un piège si on veut continuer à calculer ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## A2 — Le moteur de paie v2

**Question :** La méthode .reduce() n'a pas été vue en atelier. Explique ce qu'elle fait et réécris l'étape 2 avec elle.

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## A3 — L'inventaire en console

**Question :** Comment afficher seulement les colonnes nom et stock avec console.table() ? Et que renvoient .find() et .filter() quand rien ne correspond ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## A4 — Le classement de la promo

**Question :** Comment classer le bulletin de la meilleure à la moins bonne moyenne avec .sort() ? Pourquoi .sort() modifie-t-il le tableau d'origine, et comment l'éviter ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non

## A5 — Le nombre mystère

**Question :** Explique la « recherche dichotomique » et pourquoi 7 essais suffisent toujours pour trouver un nombre entre 1 et 100.

**Ma réponse (avec mes mots, 3 à 5 lignes) :**

...

**Mon test dans la console :**

```js
// colle ici le test que tu as exécuté et le résultat obtenu
```

**Source :** 

**IA utilisée ? (prompt + vérification sur MDN) :** non
