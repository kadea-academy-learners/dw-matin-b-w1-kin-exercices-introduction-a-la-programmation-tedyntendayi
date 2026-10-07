'use strict';

const vm = require('node:vm');
const util = require('node:util');

const DEFAULT_TIMEOUT = 2000;
const MAX_PROMPTS = 60;

const renderTable = (data, columns) => {
  if (data === null || typeof data !== 'object') return [util.format(data)];
  const rows = Array.isArray(data) ? data : Object.values(data);
  return rows.map((row) => {
    if (row === null || typeof row !== 'object') return util.format(row);
    const keys = Array.isArray(columns) ? columns : Object.keys(row);
    return keys.map((key) => util.format(row[key])).join(' | ');
  });
};

const describeError = (error) => {
  if (error === null || error === undefined) return 'erreur inconnue';
  if (typeof error !== 'object') return `Exception levée : ${String(error)}`;
  if (error.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
    return `Temps d'exécution dépassé (${DEFAULT_TIMEOUT} ms) : boucle infinie probable`;
  }
  const name = error.name || 'Error';
  return `${name}: ${error.message}`;
};

/**
 * Exécute le code d'un apprenant dans un bac à sable isolé.
 * options.prompts : réponses successives renvoyées par prompt() (null quand la liste est vide)
 * options.random  : valeur fixe renvoyée par Math.random()
 */
const runCode = (code, options = {}) => {
  const timeout = options.timeout || DEFAULT_TIMEOUT;
  const lines = []; // { text, source: 'log' | 'table' | 'alert' }
  const logArgs = []; // arguments bruts passés à console.log
  const tables = []; // { data, columns }
  const prompts = [...(options.prompts || [])];
  let promptCalls = 0;

  const log = (...args) => {
    logArgs.push(args);
    lines.push({ text: util.format(...args), source: 'log' });
  };
  const fakeConsole = {
    log,
    info: log,
    warn: log,
    error: log,
    debug: log,
    table: (data, columns) => {
      tables.push({ data, columns });
      renderTable(data, columns).forEach((text) => lines.push({ text, source: 'table' }));
    },
    group: log,
    groupEnd: () => {},
    clear: () => {},
  };

  const sandbox = {
    console: fakeConsole,
    prompt: () => {
      promptCalls += 1;
      if (promptCalls > MAX_PROMPTS) {
        throw new Error(`prompt() appelé plus de ${MAX_PROMPTS} fois : boucle infinie probable`);
      }
      return prompts.length > 0 ? prompts.shift() : null;
    },
    alert: (message) => lines.push({ text: util.format(message), source: 'alert' }),
    confirm: () => false,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    module: { exports: {} },
  };
  sandbox.exports = sandbox.module.exports;

  const context = vm.createContext(sandbox);
  if (typeof options.random === 'number') {
    const fixed = options.random;
    vm.runInContext('Math', context).random = () => fixed;
  }

  let error = null;
  try {
    new vm.Script(code, { filename: options.filename || 'exercice.js' }).runInContext(context, { timeout });
  } catch (e) {
    error = e === undefined || e === null ? new Error(`exception levée : ${e}`) : e;
  }

  // Évalue une expression dans le même contexte (les const/let de premier niveau y sont visibles).
  const evaluate = (expression) => {
    try {
      const value = new vm.Script(expression).runInContext(context, { timeout });
      return { ok: true, value };
    } catch (e) {
      return { ok: false, error: describeError(e) };
    }
  };

  const isDeclared = (name) => {
    const res = evaluate(`(() => { try { ${name}; return true; } catch (e) { return false; } })()`);
    return res.ok && res.value === true;
  };

  const get = (name) => {
    const res = evaluate(`typeof ${name} === 'undefined' ? undefined : ${name}`);
    return res.ok ? res.value : undefined;
  };

  return {
    error,
    errorMessage: error ? describeError(error) : null,
    lines,
    logArgs,
    tables,
    text: lines.map((l) => l.text).join('\n'),
    logText: lines.filter((l) => l.source !== 'table').map((l) => l.text).join('\n'),
    promptCalls: () => promptCalls,
    evaluate,
    isDeclared,
    get,
  };
};

module.exports = { runCode, describeError };
