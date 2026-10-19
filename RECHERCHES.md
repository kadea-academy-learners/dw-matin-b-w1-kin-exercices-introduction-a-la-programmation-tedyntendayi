# RECHERCHES — Semaine 13

> Pour chaque exercice : reformule avec tes mots (pas de copier-coller), ajoute un test que tu as exécuté toi-même,
> et cite une source précise (une page, pas juste « Google »). MDN en français est la référence.
> Si tu as utilisé une IA, indique ton prompt et vérifie sa réponse sur MDN.
> Ne modifie pas les titres `## F1 — …` : ils servent à l'évaluation automatique.

## F1 — Ma carte d'apprenant

**Question :** Pourquoi typeof null renvoie-t-il 'object' alors que null n'est pas un objet ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
typeof null renvoie "object" à cause d'un bug présent depuis les débuts de JavaScript. null n'est pas un objet, il signifie "aucune valeur". Le bug n'a jamais été corrigé car cela casserait de nombreux sites existants.

**Mon test dans la console :**

```js
console.log(typeof null);
// résultat : object
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/typeof

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude d'expliquer pourquoi typeof null renvoie "object". J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/typeof

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
On peut enlever les parenthèses autour du paramètre quand il y en a un seul et sans valeur par défaut (n => n * 2). Avec zéro ou plusieurs paramètres, elles restent obligatoires. On peut enlever return et les accolades quand le corps est une seule expression : sa valeur est alors renvoyée automatiquement.

**Mon test dans la console :**

```js
const carre = n => n * n;
console.log(carre(7));
// résultat : 49
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/Arrow_functions

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude d'expliquer la syntaxe courte des fonctions fléchées. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Functions/Arrow_functions

## F6 — Le compte à rebours

**Question :** À quoi sert le mot-clé continue ? Quelle différence avec break ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
continue saute la fin du tour en cours et passe directement au tour suivant de la boucle. break arrête complètement la boucle. Dans l'exercice, continue permet d'ignorer le nombre 5 mais de continuer à compter jusqu'à 1.

**Mon test dans la console :**

```js
for (let i = 1; i <= 5; i++) {
  if (i === 3) { continue; }
  console.log(i);
}
// résultat : 1 2 4 5
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/continue

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude la différence entre continue et break. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/continue

## M1 — FizzBuzz kinois

**Question :** Pourquoi FizzBuzz est-il célèbre dans les entretiens d'embauche de développeurs ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
FizzBuzz est un exercice très simple qui sert de filtre : il montre vite si un candidat sait écrire une boucle, utiliser le modulo et ordonner ses conditions. Beaucoup de candidats se trompent sur l'ordre (le cas "3 et 5" doit être testé en premier). C'est une façon rapide de vérifier les bases.

**Mon test dans la console :**

```js
console.log(15 % 3 === 0 && 15 % 5 === 0);
// résultat : true
```

**Source :** https://fr.wikipedia.org/wiki/Fizz_buzz

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude pourquoi FizzBuzz est célèbre en entretien. J'ai vérifié sur : https://fr.wikipedia.org/wiki/Fizz_buzz

## M2 — Le distributeur automatique (DAB)

**Question :** Comment afficher 75000 sous la forme 75 000 avec toLocaleString() ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
On appelle toLocaleString() sur le nombre avec la langue 'fr-FR'. Le nombre est alors affiché avec le séparateur de milliers français (un espace) : 75000 devient 75 000.

**Mon test dans la console :**

```js
console.log((75000).toLocaleString('fr-FR'));
// résultat : 75 000
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude comment utiliser toLocaleString(). J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString

## M3 — Le détecteur de champs vides (Truthy / Falsy)

**Question :** Quelle est la liste complète des valeurs falsy en JavaScript ? (Indice : il y en a plus que dans cet exercice.)

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
Les valeurs falsy sont : false, 0, -0, 0n (BigInt zéro), '' (chaîne vide), null, undefined et NaN. Toutes les autres valeurs sont truthy, y compris ' ' (espace), '0' et les tableaux vides.

**Mon test dans la console :**

```js
console.log(Boolean(0n), Boolean(-0), Boolean('0'));
// résultat : false false true
```

**Source :** https://developer.mozilla.org/fr/docs/Glossary/Falsy

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude la liste des valeurs falsy. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Glossary/Falsy

## M4 — Le score par défaut : || contre ??

**Question :** Que fait l'opérateur ?? (coalescence des nuls) et en quoi est-il différent de || ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
?? renvoie sa partie droite seulement si la gauche vaut null ou undefined. || la renvoie dès que la gauche est falsy (0, '', false...). Donc avec ??, un score de 0 est conservé, alors qu'avec || il est remplacé par la valeur par défaut.

**Mon test dans la console :**

```js
console.log(0 || 'aucun', 0 ?? 'aucun');
// résultat : aucun 0
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude la différence entre ?? et ||. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing

## M5 — La vitre teintée (portée de bloc)

**Question :** Pourquoi var est-il banni du code moderne ? Cherche ce que sont la portée de fonction et le « hoisting ».

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
var est limité à la fonction, pas au bloc : une variable déclarée dans un if reste visible en dehors, ce qui crée des bugs. À cause du hoisting, sa déclaration est aussi remontée en haut et la variable vaut undefined avant sa ligne, au lieu de provoquer une erreur. let et const sont limités au bloc et plus sûrs.

**Mon test dans la console :**

```js
if (true) { var a = 1; }
console.log(a);
// résultat : 1
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/var

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude pourquoi var est banni. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/var

## M6 — Le détective du return

**Question :** Le troisième bug vient de l'« insertion automatique de point-virgule » (ASI). Explique ce mécanisme en 3 lignes.

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
L'ASI (insertion automatique de point-virgule) fait que JavaScript ajoute un ; à certains endroits en fin de ligne. Si return est seul sur sa ligne, un ; est ajouté juste après. La valeur écrite sur la ligne suivante n'est donc jamais renvoyée : la fonction renvoie undefined.

**Mon test dans la console :**

```js
const test = () => {
  return
    'valeur';
};
console.log(test());
// résultat : undefined
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Lexical_grammar

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude d'expliquer l'ASI. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Lexical_grammar

## M7 — La tirelire numérique

**Question :** Cite tous les opérateurs d'affectation composée (+=, -=…) et donne un exemple pour chacun.

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
Opérateurs d'affectation composée : += (x += 2), -= (x -= 2), *= (x *= 2), /= (x /= 2), %= (x %= 2), **= (x **= 2), <<=, >>=, >>>=, &=, ^=, |=, puis &&=, ||= et ??=. Ils combinent une opération et l'affectation : x += 2 équivaut à x = x + 2.

**Mon test dans la console :**

```js
let x = 10;
x += 5;
x *= 2;
console.log(x);
// résultat : 30
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Assignment

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude la liste des opérateurs d'affectation composée. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Operators/Assignment

## M8 — La batterie qui se décharge

**Question :** Quelle est la différence entre while et do...while ? Que donnerait l'étape 4 avec un do...while ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
while teste la condition avant chaque tour : si elle est fausse dès le départ, la boucle ne s'exécute jamais. do...while exécute le bloc une fois, puis teste la condition. Avec un départ à 15 %, while fait 0 tour, alors que do...while en ferait 1 (la batterie tomberait à 0 %).

**Mon test dans la console :**

```js
let n = 15;
let tours = 0;
do { n -= 15; tours += 1; } while (n > 20);
console.log(tours);
// résultat : 1
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/do...while

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude la différence entre while et do...while. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/do...while

## A1 — Kadea Express v2 : le calculateur de livraison

**Question :** Pourquoi 0.1 + 0.2 ne donne-t-il pas 0.3 en JavaScript ? Et pourquoi toFixed() est un piège si on veut continuer à calculer ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
JavaScript stocke les nombres décimaux en binaire, et 0.1 ou 0.2 ne s'écrivent pas exactement dans ce système : 0.1 + 0.2 donne 0.30000000000000004. toFixed() est un piège car il renvoie un texte (string) : si on continue à calculer avec, le + colle les textes au lieu d'additionner. Il vaut mieux arrondir à la fin, avec Math.round().

**Mon test dans la console :**

```js
console.log(0.1 + 0.2, typeof (0.5).toFixed(1));
// résultat : 0.30000000000000004 string
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude pourquoi 0.1 + 0.2 n'est pas égal à 0.3 et pourquoi toFixed est un piège. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed

## A2 — Le moteur de paie v2

**Question :** La méthode .reduce() n'a pas été vue en atelier. Explique ce qu'elle fait et réécris l'étape 2 avec elle.

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
.reduce() parcourt un tableau et combine tous les éléments en une seule valeur, avec un accumulateur qui commence à une valeur de départ. Pour le total des heures : heuresSemaine.reduce((somme, heures) => somme + heures, 0). Cela remplace le forEach avec une variable qu'on modifie à la main.

**Mon test dans la console :**

```js
const heuresSemaine = [8, 9, 10, 8, 7, 6];
console.log(heuresSemaine.reduce((somme, heures) => somme + heures, 0));
// résultat : 48
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude d'expliquer reduce. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce

## A3 — L'inventaire en console

**Question :** Comment afficher seulement les colonnes nom et stock avec console.table() ? Et que renvoient .find() et .filter() quand rien ne correspond ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
console.table(tableau, ['nom', 'stock']) n'affiche que les colonnes nom et stock. Quand rien ne correspond, .find() renvoie undefined, alors que .filter() renvoie un tableau vide [].

**Mon test dans la console :**

```js
const t = [{ id: 1, nom: 'A', stock: 2 }];
console.log(t.find((p) => p.id === 9), t.filter((p) => p.id === 9));
// résultat : undefined []
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/find

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude comment filtrer les colonnes de console.table et ce que renvoient find et filter. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/find

## A4 — Le classement de la promo

**Question :** Comment classer le bulletin de la meilleure à la moins bonne moyenne avec .sort() ? Pourquoi .sort() modifie-t-il le tableau d'origine, et comment l'éviter ?

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
Pour classer de la meilleure à la moins bonne moyenne : bulletin.sort((a, b) => b.moyenne - a.moyenne). .sort() modifie le tableau d'origine (il trie "en place"). Pour l'éviter, on trie une copie : [...bulletin].sort(...).

**Mon test dans la console :**

```js
const b = [{ m: 12 }, { m: 17 }, { m: 9 }];
const trie = [...b].sort((x, y) => y.m - x.m);
console.log(trie[0].m, b[0].m);
// résultat : 17 12
```

**Source :** https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude comment utiliser sort sans modifier l'original. J'ai vérifié sur MDN : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Array/sort

## A5 — Le nombre mystère

**Question :** Explique la « recherche dichotomique » et pourquoi 7 essais suffisent toujours pour trouver un nombre entre 1 et 100.

**Ma réponse (avec mes mots, 3 à 5 lignes) :**
La recherche dichotomique consiste à proposer toujours le milieu de l'intervalle : chaque réponse (plus grand ou plus petit) élimine la moitié des possibilités. De 100 nombres on passe à 50, 25, 13, 7, 4, 2, 1. Comme 2 puissance 7 vaut 128, qui est plus grand que 100, 7 essais suffisent toujours.

**Mon test dans la console :**

```js
console.log(Math.ceil(Math.log2(100)));
// résultat : 7
```

**Source :** https://fr.wikipedia.org/wiki/Recherche_dichotomique

**IA utilisée ? (prompt + vérification sur MDN) :** oui, j'ai demandé à Claude d'expliquer la recherche dichotomique. J'ai vérifié sur : https://fr.wikipedia.org/wiki/Recherche_dichotomique
