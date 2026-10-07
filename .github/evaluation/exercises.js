'use strict';

const { normalize, hasRun, inOrder, sameText, show } = require('./lib/text');
const { check, uses } = require('./lib/rules');

// ---------------------------------------------------------------------------
// Outils de test
// ---------------------------------------------------------------------------

// Appelle une expression dans le contexte de l'apprenant et compare au résultat attendu.
const callCheck = (main, expression, expected, compare = 'strict') => {
  const res = main.evaluate(expression);
  const value = res.ok ? res.value : undefined;
  let ok = false;
  if (res.ok) {
    if (compare === 'text') ok = sameText(value, expected);
    else if (typeof compare === 'function') ok = compare(value);
    else ok = Object.is(value, expected);
  }
  const got = res.ok ? show(value) : res.error;
  const want = typeof compare === 'function' ? expected : show(expected);
  return check(`${expression} → ${want}`, ok, `\`${expression}\` renvoie ${got} au lieu de ${want}.`);
};

const normLines = (text) => text.split('\n').map(normalize);
const anyLine = (text, regex) => normLines(text).some((l) => regex.test(l));

// Relance le code en remplaçant la valeur initiale d'une variable (ex. const age = 16 -> 30).
// La substitution ne touche que la zone de travail (l'énoncé contient aussi « const age = 16; »).
const variant = (ctx, name, original, replacement) => {
  const marker = ctx.source.match(/\/\/\s*=+\s*FIN\s+[EÉ]NONC[EÉ][^\n]*\n/i);
  const cut = marker ? marker.index + marker[0].length : 0;
  const head = ctx.source.slice(0, cut);
  const work = ctx.source.slice(cut);
  const pattern = new RegExp(`(\\b${name}\\s*=\\s*)${original}(?![\\d.])`);
  if (!pattern.test(work)) return null;
  return ctx.run(head + work.replace(pattern, `$1${replacement}`));
};

// Toutes les valeurs observables : variables de premier niveau, arguments de console.log, console.table.
const observedValues = (ctx) => {
  const values = [];
  ctx.facts.topLevelNames.forEach((name) => values.push(ctx.main.get(name)));
  ctx.main.logArgs.forEach((args) => args.forEach((a) => values.push(a)));
  ctx.main.tables.forEach((t) => values.push(t.data));
  return values;
};
const findArray = (ctx, predicate) =>
  observedValues(ctx).some((v) => Array.isArray(v) && v.every((x) => x !== null && typeof x === 'object') && predicate(v));
const field = (arr, key) => arr.map((x) => x[key]);
const same = (a, b) => a.length === b.length && a.every((x, i) => Object.is(x, b[i]));

// ---------------------------------------------------------------------------
// Les 19 exercices
// Chaque exercice : tests (résultat attendu du cahier), rules (notions imposées),
// feedback (les 5 cas : 1 non rendu, 2 erreur, 3 résultat incorrect, 4 règles non respectées, 5 parfait).
// ---------------------------------------------------------------------------

const exercises = [
  {
    id: 'F1',
    title: "Ma carte d'apprenant",
    messages: true,
    tests: ({ main }) => {
      const expectedTypes = {
        prenom: 'string',
        age: 'number',
        commune: 'string',
        estInscrit: 'boolean',
        surnom: 'undefined',
        ancienneFormation: 'object',
      };
      const declared = Object.keys(expectedTypes).filter((n) => main.isDeclared(n));
      const wrongTypes = declared.filter((n) => typeof main.get(n) !== expectedTypes[n]);
      return [
        check(
          'Les 6 variables sont déclarées',
          declared.length === 6,
          `Variables manquantes : ${Object.keys(expectedTypes).filter((n) => !declared.includes(n)).join(', ')}.`,
        ),
        check('Types corrects', declared.length > 0 && wrongTypes.length === 0, `Type inattendu pour : ${wrongTypes.join(', ')}.`),
        check('ancienneFormation vaut null', main.get('ancienneFormation') === null, '`ancienneFormation` doit valoir `null`.'),
        check(
          'Fiche affichée',
          anyLine(main.text, /je m'?appelle .+ j'?ai \d+ ans,? et j'?habite a \S+/),
          "La phrase « Je m'appelle …, j'ai … ans et j'habite à … » n'est pas affichée.",
        ),
        check(
          'typeof affichés dans l\'ordre',
          hasRun(main.text, 'string number string boolean undefined object'),
          'Les typeof attendus (string, number, string, boolean, undefined, object) ne sont pas affichés dans cet ordre.',
        ),
      ];
    },
    rules: (f) => [
      check(
        'Fiche en un seul gabarit',
        f.summary.templatesWithExpr.some((t) => t.expressions.length >= 3),
        'La fiche doit être un seul gabarit littéral contenant au moins prénom, âge et commune.',
      ),
      check(
        'Choix const/let justifiés',
        (f.studentComments || []).filter((c) => /\b(const|let)\b/.test(c.text)).length >= 2,
        'Justifie en commentaire le choix de `const` ou `let` pour tes variables.',
      ),
      check(
        'surnom déclaré sans valeur',
        f.declarations.get('surnom') && f.declarations.get('surnom').kind === 'let' && !f.declarations.get('surnom').initialized,
        '`surnom` doit être déclaré sans valeur (`let surnom;`).',
      ),
    ],
    feedback: {
      3: 'Ta fiche ne correspond pas au résultat attendu : vérifie la phrase et les 6 typeof (n\'oublie pas que typeof null renvoie « object »).',
      4: 'Le résultat est bon, mais les règles ne sont pas toutes respectées : const par défaut, justification en commentaire, un seul gabarit littéral.',
      5: 'Parfait ! Choix const/let justifiés, 5 types primitifs reconnus et fiche construite avec un seul gabarit littéral.',
    },
  },
  {
    id: 'F2',
    title: 'Le convertisseur de saisie',
    messages: false,
    tests: ({ main }) => [
      check('Bug de concaténation montré', hasRun(main.text, '2500500'), "Affiche d'abord `saisie + 500` pour montrer le résultat faux (2500500)."),
      check('Total corrigé', inOrder(main.text, ['2500500', '3000']), 'Le total corrigé avec Number() (3000) n\'est pas affiché après 2500500.'),
      check(
        'Prédictions vérifiées',
        inOrder(main.text, ['2500500', '0', 'nan', '42', '1']), // indépendant de la correction (3000)
        "Affiche Number(''), Number('abc'), Number(' 42 ') et Number(true) dans cet ordre : 0, NaN, 42, 1.",
      ),
    ],
    rules: (f) => [
      check('Conversion avec Number()', uses.call(f, 'Number'), 'La correction doit utiliser `Number()`.'),
      check(
        'Explication et prédictions en commentaire',
        uses.commentCount(f) >= 2,
        'Explique en commentaire pourquoi le résultat est faux et note tes prédictions avant de tester.',
      ),
    ],
    feedback: {
      3: "Le résultat ne correspond pas : on attend 2500500 (le piège '2500' + 500), puis 3000, puis 0, NaN, 42, 1.",
      4: 'Résultat correct, mais il manque une notion imposée : Number() ou tes explications/prédictions en commentaire.',
      5: 'Parfait ! Le piège de la concaténation est identifié, corrigé avec Number() et tes prédictions sont vérifiées.',
    },
  },
  {
    id: 'F3',
    title: 'Pair ou impair : le tirage des tickets',
    messages: true,
    tests: (ctx) => {
      const { main } = ctx;
      const lineFor = (n) => new RegExp(`ticket ${n}\\b`);
      const textFor = (n) => {
        if (anyLine(main.text, lineFor(n))) return main.text;
        const r = variant(ctx, 'numeroTicket', '17', String(n));
        return r && !r.error ? r.text : '';
      };
      const isPair = (text, n) => normLines(text).some((l) => lineFor(n).test(l) && /\bpair\b/.test(l) && !/impair/.test(l) && /tote ?bag/.test(l));
      return [
        check(
          'Ticket 17 → impair, stylo',
          anyLine(main.text, /ticket 17\b.*impair.*stylo/),
          'On attend « Ticket 17 : impair, tu gagnes un stylo. »',
        ),
        check('Ticket 24 → pair, tote bag', isPair(textFor(24), 24), 'Avec 24, on attend « Ticket 24 : pair, tu gagnes un tote bag. »'),
        check('Ticket 0 → pair, tote bag', isPair(textFor(0), 0), '0 est pair : avec 0, on attend « Ticket 0 : pair, tu gagnes un tote bag. »'),
      ];
    },
    rules: (f) => [
      check('Modulo %', uses.operator(f, '%'), 'Utilise le modulo `%` pour tester la parité.'),
      check('Comparaison stricte', f.summary.strictEq > 0, 'Compare le reste avec `===` ou `!==`.'),
      check('if / else', f.summary.ifCount > 0, 'Utilise un `if / else` pour choisir le lot.'),
    ],
    feedback: {
      3: 'Le lot affiché est faux pour au moins un ticket : un nombre est pair si `n % 2 === 0` (0 compris).',
      4: 'Le tirage fonctionne, mais respecte les consignes : modulo `%`, comparaison `===`, `if / else` et gabarit littéral.',
      5: 'Parfait ! Modulo et égalité stricte maîtrisés, les cas 17, 24 et 0 sont corrects.',
    },
  },
  {
    id: 'F4',
    title: 'Le contrôleur du bus',
    messages: true,
    tests: (ctx) => {
      const { main } = ctx;
      const ageCase = (age, expectedStatut, tarifOk) => {
        const r = variant(ctx, 'age', '16', String(age));
        const text = r && !r.error ? r.text : '';
        return check(`Âge ${age}`, hasRun(text, `statut ${expectedStatut}`) && tarifOk(text), `Avec age = ${age}, le statut ou le tarif est faux.`);
      };
      return [
        check('Âge 16 → mineur, 500 FC', hasRun(main.text, 'statut mineur tarif 500 fc'), 'On attend « Statut : mineur — Tarif : 500 FC ».'),
        ageCase(3, 'mineur', (t) => /gratuit/.test(normalize(t)) || hasRun(t, 'tarif 0')),
        ageCase(5, 'mineur', (t) => hasRun(t, 'tarif 500 fc')),
        ageCase(18, 'majeur', (t) => hasRun(t, 'tarif 1000 fc')),
        ageCase(30, 'majeur', (t) => hasRun(t, 'tarif 1000 fc')),
      ];
    },
    rules: (f) => [
      check('Ternaire pour statut', f.summary.conditional > 0, 'Crée `statut` avec un ternaire `condition ? a : b`.'),
      check('if / else if / else', f.summary.elseIf, 'Calcule le tarif avec `if / else if / else` (3 branches).'),
    ],
    feedback: {
      3: 'Le tarif ou le statut est faux pour au moins un âge testé (3, 5, 16, 18, 30) : vérifie les bornes « moins de 5 » et « moins de 18 ».',
      4: 'Le calcul est juste, mais il faut un ternaire pour le statut, un `if / else if / else` pour le tarif et un gabarit littéral.',
      5: 'Parfait ! Ternaire simple et conditions à trois branches corrects, bornes respectées.',
    },
  },
  {
    id: 'F5',
    title: 'Ma première fonction fléchée',
    messages: true,
    allowClassicFunctions: true,
    tests: ({ main }) => [
      callCheck(main, "saluer('Lys')", 'Mbote Lys !', (v) => typeof v === 'string' && normalize(v) === normalize('Mbote Lys !')),
      callCheck(main, 'carre(7)', 49),
      callCheck(main, 'carre(-3)', 9),
      check('Résultats affichés', inOrder(main.text, ['mbote lys', '49']), "Affiche saluer('Lys') puis carre(7)."),
    ],
    rules: (f) => {
      const saluer = uses.fn(f, 'saluer');
      const carre = uses.fn(f, 'carre');
      return [
        check('saluer est fléchée', saluer && saluer.kind === 'arrow', '`saluer` doit être une fonction fléchée.'),
        check('saluer sur une seule ligne', saluer && saluer.singleLine && saluer.concise, 'Écris `saluer` sur une seule ligne avec retour implicite (sans accolades ni return).'),
        check('Gabarit dans saluer', saluer && saluer.summary.templatesWithExpr.length > 0, '`saluer` doit utiliser un gabarit littéral.'),
        check('carre est fléchée', carre && carre.kind === 'arrow', '`carre` doit être une fonction fléchée.'),
      ];
    },
    feedback: {
      3: "Les fonctions ne renvoient pas le bon résultat : saluer('Lys') doit renvoyer « Mbote Lys ! » et carre(7) doit renvoyer 49 (avec return).",
      4: 'Les résultats sont bons, mais la version fléchée de `saluer` doit tenir sur une ligne avec un gabarit littéral et un retour implicite.',
      5: 'Parfait ! Fonctions fléchées concises avec retour implicite et gabarit littéral.',
    },
  },
  {
    id: 'F6',
    title: 'Le compte à rebours',
    messages: false,
    tests: ({ main }) => [
      check('Compte à rebours sans le 5', hasRun(main.text, '10 9 8 7 6 4 3 2 1 decollage'), 'On attend 10, 9, 8, 7, 6, 4, 3, 2, 1, Décollage ! (le 5 est sauté).'),
      check('Version paire', hasRun(main.text, '10 8 6 4 2'), 'La version qui affiche seulement les pairs (10, 8, 6, 4, 2) est absente.'),
    ],
    rules: (f) => [
      check('Boucle for qui descend', f.summary.forDecrement, 'Utilise une boucle `for` qui descend (`i--` ou `i -= 2`).'),
      check('continue pour sauter le 5', f.summary.continueCount > 0, 'Saute le 5 avec `continue`, sans changer la condition de la boucle.'),
    ],
    feedback: {
      3: 'La séquence affichée est fausse : vérifie le départ (10), la condition (>= 1), le pas et le saut du 5.',
      4: 'Les nombres sont bons, mais il faut une boucle `for` qui descend et `continue` pour sauter le 5.',
      5: 'Parfait ! Les 3 parties de la boucle `for` sont maîtrisées et `continue` est bien placé.',
    },
  },
  {
    id: 'M1',
    title: 'FizzBuzz kinois',
    messages: false,
    tests: ({ main }) => {
      const expected = [];
      for (let i = 1; i <= 30; i += 1) {
        if (i % 15 === 0) expected.push('MalewaWewa');
        else if (i % 3 === 0) expected.push('Malewa');
        else if (i % 5 === 0) expected.push('Wewa');
        else expected.push(String(i));
      }
      return [
        check('15 premiers', hasRun(main.text, expected.slice(0, 15).join(' ')), 'Les 15 premiers résultats ne correspondent pas au résultat attendu.'),
        check('MalewaWewa affiché', hasRun(main.text, 'malewawewa'), "MalewaWewa n'apparaît jamais : teste « multiple de 3 ET de 5 » AVANT les autres conditions."),
        check('De 1 à 30', hasRun(main.text, expected.join(' ')), "La suite complète de 1 à 30 n'est pas correcte (bornes de la boucle ?)."),
      ];
    },
    rules: (f) => [
      check('Boucle for', f.summary.forCount > 0, 'Parcours les nombres avec une boucle `for`.'),
      check('Modulo %', uses.operator(f, '%'), 'Teste les multiples avec `%`.'),
      check('Comparaison stricte', f.summary.strictEq > 0, 'Compare les restes avec `===`.'),
      check('Ordre expliqué en commentaire', uses.commentCount(f) >= 1, "Explique en commentaire pourquoi l'ordre de tes conditions est important."),
    ],
    feedback: {
      3: "Résultat incorrect : la condition la plus restrictive (multiple de 3 ET de 5) doit être testée en premier, sinon MalewaWewa n'est jamais affiché.",
      4: "Le FizzBuzz est juste, mais respecte les consignes : boucle for, %, === et explication de l'ordre en commentaire.",
      5: 'Parfait ! Conditions ordonnées du cas le plus restrictif au plus général, résultat exact de 1 à 30.',
    },
  },
  {
    id: 'M2',
    title: 'Le distributeur automatique (DAB)',
    messages: true,
    tests: ({ main }) => {
      const starts = (prefix) => (v) => typeof v === 'string' && normalize(v).startsWith(normalize(prefix));
      return [
        callCheck(main, 'retirer(100000, 25000)', 'Retrait accepté. Nouveau solde : 75000 FC', 'text'),
        callCheck(main, 'retirer(100000, 12000)', 'Montant invalide : multiples de 5 000 FC uniquement', 'text'),
        callCheck(main, 'retirer(1000000, 600000)', 'Plafond dépassé : 500 000 FC maximum', 'text'),
        callCheck(main, 'retirer(20000, 50000)', 'Solde insuffisant', 'text'),
        callCheck(main, 'retirer(100000, -5000)', "'Montant invalide…' (montant négatif)", starts('Montant invalide')),
        callCheck(main, 'retirer(20000, 600000)', "'Plafond dépassé…' (plafond vérifié avant le solde)", starts('Plafond')),
        callCheck(main, 'retirer(1000000, 500000)', "'Retrait accepté…' (500 000 FC est autorisé)", starts('Retrait accepte')),
        callCheck(main, 'retirer(100000, 100000)', 'Retrait accepté. Nouveau solde : 0 FC', 'text'),
        check(
          'Les 4 cas testés',
          ['retrait accepte', 'montant invalide', 'plafond depasse', 'solde insuffisant'].every((m) => normalize(main.text).includes(m)),
          'Affiche le résultat des 4 appels du tableau avec console.log (en dehors de la fonction).',
        ),
      ];
    },
    rules: (f) => {
      const retirer = uses.fn(f, 'retirer');
      return [
        check('retirer est fléchée', retirer && retirer.kind === 'arrow', '`retirer` doit être une fonction fléchée.'),
        check('Pas de console.log dans retirer', retirer && !retirer.hasConsoleLog, '`retirer` doit RENVOYER le message (return), pas l\'afficher.'),
        check('Modulo %', uses.operator(f, '%'), 'Vérifie les multiples de 5 000 avec `%`.'),
      ];
    },
    feedback: {
      3: 'Au moins un retrait renvoie le mauvais message : vérifie l\'ordre des règles (montant invalide → plafond → solde) et les cas limites (négatif, 500 000 FC, solde exact).',
      4: 'Les messages sont justes, mais `retirer` doit être fléchée, renvoyer son message sans console.log et utiliser `%` et un gabarit littéral.',
      5: 'Parfait ! Règles vérifiées dans le bon ordre, cas limites gérés, la fonction renvoie son message.',
    },
  },
  {
    id: 'M3',
    title: 'Le détecteur de champs vides (Truthy / Falsy)',
    messages: false,
    tests: ({ main }) => {
      const cases = [
        ["''", 'vide'],
        ["'Esther'", 'rempli'],
        ['0', 'vide'],
        ['42', 'rempli'],
        ['null', 'vide'],
        ['undefined', 'vide'],
        ['NaN', 'vide'],
        ["' '", 'rempli'],
        ["'0'", 'rempli'],
        ['false', 'vide'],
      ];
      return [
        ...cases.map(([arg, expected]) => callCheck(main, `estRempli(${arg})`, expected)),
        check(
          'Tests affichés',
          inOrder(main.text, cases.map(([, e]) => e)),
          'Affiche le résultat des 10 tests dans l\'ordre de la consigne.',
        ),
      ];
    },
    rules: (f) => {
      const fn = uses.fn(f, 'estRempli');
      return [
        check('estRempli est fléchée', fn && fn.kind === 'arrow', '`estRempli` doit être une fonction fléchée.'),
        check('Ternaire', fn && fn.summary.conditional > 0, '`estRempli` doit utiliser un ternaire.'),
        check('Sans comparaison', fn && fn.summary.comparisons === 0, "N'utilise aucune comparaison (===, !==, <…) : la valeur seule suffit (truthy / falsy)."),
        check('Prédictions notées', uses.commentCount(f) >= 1, 'Note tes prédictions en commentaire avant de tester.'),
      ];
    },
    feedback: {
      3: "Au moins une valeur est mal classée : ' ' et '0' sont truthy (chaînes non vides), 0, NaN, null, undefined, '' et false sont falsy.",
      4: '`estRempli` donne les bons résultats, mais elle doit être fléchée, utiliser un ternaire et aucune comparaison.',
      5: 'Parfait ! Les valeurs truthy / falsy sont maîtrisées, ternaire sans comparaison.',
    },
  },
  {
    id: 'M4',
    title: 'Le score par défaut : || contre ??',
    messages: true,
    tests: (ctx) => {
      const { main, facts } = ctx;
      const candidates = [...facts.functions.keys()].filter((n) => /^afficherScore/.test(n));
      const ok = (name) =>
        sameText(main.evaluate(`${name}(15)`).value, 'Score : 15') &&
        sameText(main.evaluate(`${name}(0)`).value, 'Score : 0') &&
        sameText(main.evaluate(`${name}(undefined)`).value, 'Score : aucun');
      const fixed = candidates.find(ok);
      return [
        check('afficherScore existe', candidates.length > 0, 'La fonction `afficherScore` est introuvable.'),
        callCheck(main, 'afficherScore(15)', 'Score : 15', 'text'),
        callCheck(main, 'afficherScore(undefined)', 'Score : aucun', 'text'),
        check('Version corrigée : 0 → Score : 0', Boolean(fixed), "Aucune version ne renvoie « Score : 0 » pour 0 : corrige avec `??`."),
        check('Bug du cas 0 montré', hasRun(main.text, 'score aucun'), 'Teste la version avec `||` pour montrer le bug (0 → « aucun »).'),
      ];
    },
    rules: (f) => [
      check('Opérateur ??', uses.operator(f, '??'), 'Corrige le bug avec l\'opérateur `??`.'),
      check('Opérateur || montré', uses.operator(f, '||'), 'Écris d\'abord la version avec `||` pour montrer le bug.'),
      check('Bug expliqué en commentaire', uses.commentCount(f) >= 1, 'Explique en commentaire pourquoi 0 donne « aucun » avec `||`.'),
    ],
    feedback: {
      3: "Le cas 0 est faux : `0 || 'aucun'` renvoie 'aucun' car 0 est falsy ; `??` ne remplace que null et undefined.",
      4: 'Les résultats sont justes, mais montre la version `||`, corrige avec `??` et explique le bug en commentaire.',
      5: 'Parfait ! Le piège de `0 || \'aucun\'` est expliqué et corrigé à bon escient avec `??`.',
    },
  },
  {
    id: 'M5',
    title: 'La vitre teintée (portée de bloc)',
    messages: false,
    tests: ({ main }) => [
      check('Kinshasa affiché', hasRun(main.text, 'kinshasa'), 'Kinshasa doit être affiché.'),
      check('Gombe affiché', hasRun(main.text, 'gombe'), 'commune (Gombe) doit être affichée sans ReferenceError (affiche-la là où elle existe).'),
      check('afficher() exécutée', inOrder(main.text, ['kinshasa', 'pondu']), 'Le résultat de afficher() (pondu) doit être affiché.'),
    ],
    rules: (f) => {
      const commune = f.declarations.get('commune');
      const secret = f.declarations.get('secret');
      return [
        check('commune reste dans le bloc', commune && commune.inBlock && !commune.topLevel, 'Ne déplace pas la déclaration de `commune` : elle doit rester dans le bloc if.'),
        check('secret reste dans la fonction', secret && secret.inFunction, 'Ne déplace pas la déclaration de `secret` : elle doit rester dans `afficher`.'),
        check('Prédictions et explication', uses.commentCount(f) >= 2, "Écris tes prédictions et explique pourquoi `afficher` ne s'exécutait jamais (l'erreur arrête le programme)."),
      ];
    },
    feedback: {
      2: "Le programme s'arrête encore sur une erreur : une variable déclarée avec const dans un bloc { } n'existe pas en dehors. Une ReferenceError stoppe tout le script, c'est pour ça que afficher() ne s'exécutait jamais.",
      3: 'Le programme ne plante plus, mais tout ne s\'affiche pas : on attend Kinshasa, Gombe et pondu.',
      4: 'Plus d\'erreur, mais les déclarations doivent rester dans leurs blocs et tes prédictions/explications doivent être en commentaire.',
      5: 'Parfait ! Portée de bloc respectée, plus aucune ReferenceError et l\'arrêt du programme est expliqué.',
    },
  },
  {
    id: 'M6',
    title: 'Le détective du return',
    messages: true,
    tests: ({ main }) => [
      callCheck(main, 'doubler(4)', 8),
      callCheck(main, 'calculerTva(1000)', 160),
      check('total vaut 660', main.get('total') === 660, `total vaut ${show(main.get('total'))} au lieu de 660 : calculerTva doit RENVOYER la TVA.`),
      callCheck(main, "saluer('Ney')", 'Mbote Ney', (v) => typeof v === 'string' && normalize(v) === 'mbote ney'),
      check('Affichage 8, 660, Mbote Ney', inOrder(main.text, ['8', '660', 'mbote ney']), 'On attend l\'affichage 8, puis 660, puis Mbote Ney.'),
    ],
    rules: (f) => {
      const tva = uses.fn(f, 'calculerTva');
      return [
        check('calculerTva renvoie', tva && !tva.hasConsoleLog, '`calculerTva` doit renvoyer sa valeur avec return au lieu de console.log.'),
        check('3 bugs expliqués', uses.commentCount(f) >= 3, 'Explique chacun des 3 bugs en commentaire (return manquant, console.log au lieu de return, ASI).'),
      ];
    },
    feedback: {
      3: 'Au moins une fonction renvoie encore undefined : avec des accolades il faut un return, console.log n\'est pas un return, et `return` suivi d\'un saut de ligne renvoie undefined (ASI).',
      4: 'Les 3 fonctions sont corrigées, mais explique chaque bug en commentaire et garde le gabarit littéral.',
      5: 'Parfait ! return et console.log sont bien distingués, le piège de l\'ASI est corrigé et expliqué.',
    },
  },
  {
    id: 'M7',
    title: 'La tirelire numérique',
    messages: true,
    tests: ({ main }) => {
      const lines = normLines(main.text);
      const wrongWeeks = [];
      for (let w = 1; w <= 12; w += 1) {
        const total = 2000 * w + 1000 * Math.floor(w / 4);
        const line = lines.find((l) => new RegExp(`^semaine ${w}\\b`).test(l));
        const ok = line && hasRun(line, `semaine ${w} ${total} fc`) && /bonus/.test(line) === (w % 4 === 0);
        if (!ok) wrongWeeks.push(w);
      }
      return [
        check('Semaine 4 : 9000 FC (bonus !)', hasRun(main.text, 'semaine 4 9000 fc bonus'), 'On attend la ligne « Semaine 4 : 9000 FC (bonus !) ».'),
        check('12 semaines correctes', wrongWeeks.length === 0, `Ligne absente ou fausse pour la semaine ${wrongWeeks.slice(0, 3).join(', ')} (bonus uniquement toutes les 4 semaines).`),
        check('Total final', hasRun(main.text, 'total apres 12 semaines 27000 fc'), 'On attend « Total après 12 semaines : 27000 FC ».'),
      ];
    },
    rules: (f) => [
      check('Boucle for', f.summary.forCount > 0, 'Simule les semaines avec une boucle `for`.'),
      check('Modulo % pour le bonus', uses.operator(f, '%'), 'Détecte « toutes les 4 semaines » avec `%`.'),
      check('Accumulateur +=', f.summary.assignOps.has('+='), 'Accumule l\'épargne avec `+=`.'),
    ],
    feedback: {
      3: "Le total ou une ligne est faux : initialise l'accumulateur AVANT la boucle, fais 12 tours (1 à 12) et ajoute le bonus quand semaine % 4 === 0.",
      4: 'Les montants sont justes, mais utilise une boucle for, `%`, `+=` et des gabarits littéraux.',
      5: 'Parfait ! Accumulateur bien initialisé, 12 tours exacts et bonus toutes les 4 semaines : 27000 FC.',
    },
  },
  {
    id: 'M8',
    title: 'La batterie qui se décharge',
    messages: true,
    tests: (ctx) => {
      const { main } = ctx;
      let from15 = hasRun(main.text, 'apres 0 h batterie a 15');
      if (!from15) {
        const r = variant(ctx, 'batterie', '100', '15');
        from15 = Boolean(r && !r.error && hasRun(r.text, 'apres 0 h batterie a 15'));
      }
      return [
        check('Après 6 h, batterie à 10 %', hasRun(main.text, 'apres 6 h batterie a 10'), 'On attend « Après 6 h, batterie à 10 % : branche ton téléphone ! »'),
        check('Message de recharge', /branche/.test(normalize(main.text)), 'Le message « branche ton téléphone ! » est absent.'),
        check('Départ à 15 %', from15, 'En partant de 15 %, la boucle ne doit faire aucun tour (Après 0 h, batterie à 15 %).'),
      ];
    },
    rules: (f) => [
      check('Boucle while', f.summary.whileCount > 0, 'Utilise une boucle `while`.'),
      check(
        'Compteur heures',
        f.summary.updateOps.has('++') || f.summary.assignOps.has('+='),
        'Ajoute une heure à chaque tour (`heures++` ou `heures += 1`).',
      ),
      check('Batterie décrémentée', f.summary.assignOps.has('-=') || f.summary.updateOps.has('--') || f.summary.assignOps.has('='), 'Retire 15 % à chaque tour.'),
    ],
    feedback: {
      2: 'Le programme ne se termine pas ou plante : vérifie que la batterie diminue bien à chaque tour, sinon la condition du while reste vraie (boucle infinie).',
      3: 'Le résultat final est faux : la boucle doit continuer tant que batterie > 20, retirer 15 et compter les heures (6 h, 10 %).',
      4: 'Le résultat est juste, mais utilise une boucle while avec un compteur et un gabarit littéral.',
      5: "Parfait ! Boucle while avec condition d'arrêt sûre et compteur : 6 h, 10 %.",
    },
  },
  {
    id: 'A1',
    title: 'Kadea Express v2 : le calculateur de livraison',
    messages: false,
    tests: ({ main }) => [
      callCheck(main, 'calculerLivraison(3, 2)', 2320),
      callCheck(main, 'calculerLivraison(10, 12, true)', 9570),
      callCheck(main, 'calculerLivraison(20, 5)', 8120),
      callCheck(main, 'calculerLivraison(5, 2)', 2320),
      callCheck(main, 'calculerLivraison(15, 2)', 4640),
      callCheck(main, 'calculerLivraison(16, 2)', 8120),
      callCheck(main, 'calculerLivraison(3, 10)', 2320),
      callCheck(main, 'calculerLivraison(3, 11)', 4060),
      callCheck(main, 'calculerLivraison(3, 2, true)', 3480),
    ],
    rules: (f) => {
      const fn = uses.fn(f, 'calculerLivraison');
      return [
        check('Fonction fléchée', fn && fn.kind === 'arrow', '`calculerLivraison` doit être une fonction fléchée.'),
        check('Paramètre par défaut estUrgent = false', fn && fn.defaults.includes('estUrgent'), 'Déclare `estUrgent = false` comme paramètre par défaut.'),
        check('Math.round()', uses.call(f, 'Math.round'), 'Arrondis le résultat avec `Math.round()` (pas toFixed qui renvoie une chaîne).'),
        check('if / else if / else', f.summary.elseIf, 'Calcule le tarif de base avec `if / else if / else`.'),
      ];
    },
    feedback: {
      3: 'Au moins un tarif est faux : « jusqu\'à 5 km » inclut 5 (<=), « plus de 10 kg » exclut 10 (>), l\'urgence multiplie tout le montant avant la TVA, puis Math.round().',
      4: 'Les tarifs sont justes, mais respecte les consignes : fonction fléchée, `estUrgent = false` par défaut, Math.round() et if / else if / else.',
      5: 'Parfait ! Règles métier, paramètre par défaut, TVA et arrondi corrects, y compris aux bornes.',
    },
  },
  {
    id: 'A2',
    title: 'Le moteur de paie v2',
    messages: true,
    tests: ({ main }) => [
      check('Total : 48 h', hasRun(main.text, 'total 48 h'), 'On attend « Total : 48 h ».'),
      check('Salaire : 130000 FC', hasRun(main.text, '130000 fc'), 'On attend « Salaire : 130000 FC ».'),
      check('Jour le plus chargé', hasRun(main.text, 'mercredi 10 h'), 'On attend « jour le plus chargé : mercredi (10 h) ».'),
      callCheck(main, 'calculerSalaire(48)', 130000),
      callCheck(main, 'calculerSalaire(40)', 100000),
      callCheck(main, 'calculerSalaire(30)', 75000),
      callCheck(main, 'calculerSalaire(48, 1000)', 52000),
    ],
    rules: (f) => {
      const fn = uses.fn(f, 'calculerSalaire');
      return [
        check('.forEach()', uses.method(f, 'forEach'), 'Calcule le total des heures avec `.forEach()`.'),
        check('Boucle for', f.summary.forCount > 0 || f.summary.forOfCount > 0, 'Trouve le jour le plus chargé avec une boucle `for`.'),
        check('calculerSalaire fléchée', fn && fn.kind === 'arrow', '`calculerSalaire` doit être une fonction fléchée.'),
        check('tauxHoraire = 2500 par défaut', fn && fn.defaults.includes('tauxHoraire'), 'Déclare `tauxHoraire = 2500` comme paramètre par défaut.'),
      ];
    },
    feedback: {
      3: 'Un résultat est faux : seules les heures AU-DELÀ de 40 sont payées × 1,5 (40 × 2500 + 8 × 3750 = 130000) ; le jour le plus chargé est mercredi.',
      4: 'Les résultats sont justes, mais utilise .forEach(), une boucle for, une fonction fléchée avec `tauxHoraire = 2500` et des gabarits littéraux.',
      5: 'Parfait ! Accumulateur avec .forEach(), heures supplémentaires et recherche du maximum corrects.',
    },
  },
  {
    id: 'A3',
    title: "L'inventaire en console",
    messages: false,
    tests: (ctx) => {
      const { main } = ctx;
      const produit = main.evaluate('chercherProduit(104)');
      const ruptureLine = normLines(main.logText).some((l) => /rupture/.test(l) && hasRun(l, '2'));
      return [
        check(
          'Tableau des 6 produits',
          findArray(ctx, (a) => same(field(a, 'id'), [101, 102, 103, 104, 105, 106]) && same(field(a, 'stock'), [25, 0, 12, 8, 0, 40])),
          "Le tableau d'objets (id, nom, categorie, prixFC, stock) est absent ou ses valeurs sont fausses.",
        ),
        check('console.table()', main.tables.length > 0, "Affiche l'inventaire avec `console.table()`."),
        check(
          'Filtre Informatique',
          findArray(ctx, (a) => same(field(a, 'id'), [101, 103, 105])),
          "Le résultat du .filter() (produits 101, 103, 105) n'est ni stocké dans une variable ni affiché.",
        ),
        check(
          'prixUSD arrondis',
          findArray(ctx, (a) => same(field(a, 'prixUSD'), [5, 15, 10, 8, 25, 3])),
          'Les prix USD attendus (5, 15, 10, 8, 25, 3) sont introuvables : ajoute `prixUSD` avec .map() et Math.round().',
        ),
        check(
          'chercherProduit(104) → la gourde',
          produit.ok && produit.value && typeof produit.value === 'object' && produit.value.id === 104,
          `chercherProduit(104) renvoie ${produit.ok ? show(produit.value) : produit.error} au lieu de l'objet de la gourde.`,
        ),
        callCheck(main, 'chercherProduit(999)', 'Produit introuvable', 'text'),
        check(
          '2 produits en rupture',
          ruptureLine || findArray(ctx, (a) => a.length === 2 && a.every((p) => p.stock === 0)),
          'Affiche le nombre de produits en rupture de stock (2).',
        ),
      ];
    },
    rules: (f) => {
      const fn = uses.fn(f, 'chercherProduit');
      const taux = f.declarations.get('TAUX');
      return [
        check('.filter()', uses.method(f, 'filter'), 'Utilise `.filter()` pour la catégorie Informatique.'),
        check('.map()', uses.method(f, 'map'), 'Utilise `.map()` pour ajouter `prixUSD`.'),
        check('.find()', uses.method(f, 'find'), 'Utilise `.find()` dans `chercherProduit`.'),
        check('return dans chaque callback', f.callbacksWithoutReturn.length === 0, `Callback sans return : ${f.callbacksWithoutReturn.map((c) => `.${c.method}() l.${c.line}`).join(', ')}.`),
        check('const TAUX = 2800', taux && taux.kind === 'const', 'Déclare `const TAUX = 2800;`.'),
        check('chercherProduit fléchée', fn && fn.kind === 'arrow', '`chercherProduit` doit être une fonction fléchée.'),
      ];
    },
    feedback: {
      3: "Un résultat est faux ou introuvable : stocke chaque résultat (filter, map) dans une variable ou affiche-le, et gère le cas undefined de .find() avec « Produit introuvable ».",
      4: 'Les résultats sont justes, mais utilise .filter(), .map(), .find() avec un return dans chaque callback, `const TAUX` et des fonctions fléchées.',
      5: 'Parfait ! Tableau d\'objets maîtrisé avec filter, map et find, cas undefined géré et vérifié avec console.table().',
    },
  },
  {
    id: 'A4',
    title: 'Le classement de la promo',
    messages: false,
    tests: (ctx) => {
      const { main } = ctx;
      const mentions = (a) => field(a, 'mention').map((m) => normalize(m || ''));
      return [
        callCheck(main, 'calculerMoyenne([14, 16, 15])', 15),
        callCheck(main, 'calculerMoyenne([17, 18, 16])', 17),
        callCheck(main, 'calculerMoyenne([8, 11, 9])', 9.3),
        callCheck(main, 'calculerMoyenne([12, 10, 14])', 12),
        callCheck(main, 'calculerMoyenne([16, 15, 19])', 16.7),
        check(
          'Bulletin (nom, moyenne, mention)',
          findArray(
            ctx,
            (a) => same(field(a, 'moyenne'), [15, 17, 9.3, 12, 16.7]) && same(mentions(a), ['admis', 'excellent', 'rattrapage', 'admis', 'excellent']),
          ),
          'Le bulletin créé avec .map() doit contenir nom, moyenne (15, 17, 9.3, 12, 16.7) et mention (Admis, Excellent, Rattrapage, Admis, Excellent).',
        ),
        check('4 admis', normLines(main.logText).some((l) => /admis/.test(l) && hasRun(l, '4')), 'Affiche le nombre d\'admis (4).'),
        check('Premier Excellent : Bijou', normLines(main.logText).some((l) => /bijou/.test(l)), 'Affiche le premier « Excellent » trouvé avec .find() (Bijou).'),
        check('console.table() du bulletin', main.tables.some((t) => Array.isArray(t.data) && t.data.length === 5), 'Affiche le bulletin avec `console.table()`.'),
      ];
    },
    rules: (f) => {
      const fn = uses.fn(f, 'calculerMoyenne');
      return [
        check('calculerMoyenne fléchée', fn && fn.kind === 'arrow', '`calculerMoyenne` doit être une fonction fléchée.'),
        check('Boucle + accumulateur', fn && (fn.summary.forCount > 0 || fn.summary.forOfCount > 0 || fn.summary.whileCount > 0), '`calculerMoyenne` doit utiliser une boucle et un accumulateur.'),
        check('.map()', uses.method(f, 'map'), 'Crée le bulletin avec `.map()`.'),
        check('.filter()', uses.method(f, 'filter'), 'Compte les admis avec `.filter()`.'),
        check('.find()', uses.method(f, 'find'), 'Trouve le premier Excellent avec `.find()`.'),
        check('return dans chaque callback', f.callbacksWithoutReturn.length === 0, `Callback sans return : ${f.callbacksWithoutReturn.map((c) => `.${c.method}() l.${c.line}`).join(', ')}.`),
        check('if / else if / else', f.summary.elseIf, 'Attribue la mention avec `if / else if / else`.'),
      ];
    },
    feedback: {
      3: 'Un résultat est faux : arrondis la moyenne à une décimale en gardant un nombre (Math.round(x * 10) / 10), et vérifie les seuils 16 et 10 (>=).',
      4: 'Les résultats sont justes, mais respecte les consignes : boucle dans calculerMoyenne, .map(), .filter(), .find() avec return, if / else if / else.',
      5: 'Parfait ! Fonctions, boucles, conditions et méthodes de tableau bien combinées ; bulletin vérifié avec console.table().',
    },
  },
  {
    id: 'A5',
    title: 'Le nombre mystère',
    messages: true,
    // Math.random() figé à 0.425 → nombre mystère = 43 avec Math.floor(Math.random() * 100) + 1
    runOptions: { random: 0.425, prompts: ['abc', '50', '25', '43'] },
    tests: (ctx) => {
      const { main } = ctx;
      const text = normalize(main.text);
      const firstOf = (a, b) => [text.indexOf(a), text.indexOf(b)].filter((i) => i >= 0).sort((x, y) => x - y)[0] ?? -1;
      const tooHigh = firstOf('plus petit', 'trop grand');
      const tooLow = firstOf('plus grand', 'trop petit');

      const lost = ctx.run(ctx.source, { random: 0.425, prompts: Array(10).fill('1') });
      const invalid = ctx.run(ctx.source, { random: 0.425, prompts: ['abc', 'abc', 'abc', 'abc', 'abc', 'abc', 'abc', '43'] });
      return [
        check('Indices plus petit / plus grand', tooHigh >= 0 && tooLow > tooHigh, 'Après 50 on attend « plus petit », après 25 « plus grand » (nombre mystère : 43).'),
        check('Trouvé en 3 essais', hasRun(main.text, 'trouve en 3'), "Avec les saisies abc, 50, 25, 43 on attend « trouvé en 3 essais ! » (abc n'est pas compté)."),
        check(
          '7 essais maximum puis révélation',
          !lost.error && lost.promptCalls() === 7 && hasRun(lost.logText, '43'),
          lost.error
            ? `Le jeu plante quand on perd : ${lost.errorMessage}.`
            : `Après 7 mauvais essais, le jeu doit s'arrêter (${lost.promptCalls()} prompt() appelés) et révéler le nombre (43).`,
        ),
        check(
          'Saisies invalides non comptées',
          !invalid.error && hasRun(invalid.text, 'trouve en 1'),
          invalid.error ? `Le jeu plante avec « abc » : ${invalid.errorMessage}.` : "7 « abc » puis 43 doit donner « trouvé en 1 essai » : une saisie invalide ne compte pas.",
        ),
      ];
    },
    rules: (f) => [
      check('Boucle while', f.summary.whileCount > 0 || f.summary.doWhileCount > 0, 'Utilise une boucle `while`.'),
      check('Math.random() et Math.floor()', uses.call(f, 'Math.random') && uses.call(f, 'Math.floor'), 'Tire le nombre avec `Math.floor(Math.random() * 100) + 1`.'),
      check('prompt() et Number()', uses.call(f, 'prompt') && uses.call(f, 'Number'), 'Demande le nombre avec `prompt()` et convertis-le avec `Number()`.'),
      check('Détection de NaN', uses.call(f, 'isNaN') || uses.call(f, 'Number.isNaN'), 'Détecte une saisie invalide avec `Number.isNaN()` (ou `isNaN()`).'),
    ],
    feedback: {
      2: 'Le jeu plante ou tourne à l\'infini : la boucle doit s\'arrêter quand le nombre est trouvé OU quand les 7 essais sont utilisés.',
      3: 'Le jeu ne se comporte pas comme attendu : indices plus grand / plus petit, compteur qui ignore les saisies invalides, arrêt après 7 essais et révélation du nombre.',
      4: 'Le jeu fonctionne, mais respecte les consignes : while, Math.random() + Math.floor(), prompt() + Number(), détection de NaN, gabarits littéraux.',
      5: 'Parfait ! Jeu complet et robuste : saisies invalides refusées sans compter l\'essai, 7 essais maximum.',
    },
  },
];

module.exports = { exercises };
