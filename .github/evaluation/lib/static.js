'use strict';

const acorn = require('acorn');
const walk = require('acorn-walk');
const { normalize } = require('./text');

const START_MARKER = /^\/\/\s*=+\s*enonce\b/;
const END_MARKER = /^\/\/\s*=+\s*fin enonce\b/;

// Remplace le bloc énoncé par des lignes vides (les numéros de ligne restent justes).
const stripEnonce = (source) => {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((l) => START_MARKER.test(normalize(l)));
  const end = lines.findIndex((l, i) => i > start && END_MARKER.test(normalize(l)));
  if (start === -1 || end === -1) return source;
  return lines.map((l, i) => (i >= start && i <= end ? '' : l)).join('\n');
};

const isStringNode = (n) => (n.type === 'Literal' && typeof n.value === 'string') || n.type === 'TemplateLiteral';

const memberName = (callee) => {
  if (callee.type === 'Identifier') return callee.name;
  if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
    const obj = callee.object.type === 'Identifier' ? callee.object.name : null;
    return obj ? `${obj}.${callee.property.name}` : `.${callee.property.name}`;
  }
  return null;
};

// Résumé des constructions présentes dans un nœud (programme entier ou corps de fonction).
const summarize = (root) => {
  const s = {
    varCount: 0,
    looseEq: [],
    strictEq: 0,
    templates: 0,
    templatesWithExpr: [],
    arrows: 0,
    conditional: 0,
    ifCount: 0,
    elseIf: false,
    forCount: 0,
    forDecrement: false,
    forOfCount: 0,
    whileCount: 0,
    doWhileCount: 0,
    continueCount: 0,
    breakCount: 0,
    returnCount: 0,
    operators: new Set(),
    assignOps: new Set(),
    updateOps: new Set(),
    calls: new Set(),
    methods: new Set(),
    comparisons: 0,
  };
  walk.full(root, (node) => {
    switch (node.type) {
      case 'VariableDeclaration':
        if (node.kind === 'var') s.varCount += 1;
        break;
      case 'BinaryExpression':
        s.operators.add(node.operator);
        if (node.operator === '==' || node.operator === '!=') {
          s.looseEq.push({ op: node.operator, line: node.loc.start.line });
        }
        if (node.operator === '===' || node.operator === '!==') s.strictEq += 1;
        if (['==', '!=', '===', '!==', '<', '>', '<=', '>='].includes(node.operator)) s.comparisons += 1;
        break;
      case 'LogicalExpression':
        s.operators.add(node.operator);
        break;
      case 'TemplateLiteral':
        s.templates += 1;
        if (node.expressions.length > 0) s.templatesWithExpr.push(node);
        break;
      case 'ArrowFunctionExpression':
        s.arrows += 1;
        break;
      case 'ConditionalExpression':
        s.conditional += 1;
        break;
      case 'IfStatement':
        s.ifCount += 1;
        if (node.alternate && node.alternate.type === 'IfStatement') s.elseIf = true;
        break;
      case 'ForStatement': {
        s.forCount += 1;
        const u = node.update;
        if (u && ((u.type === 'UpdateExpression' && u.operator === '--') || (u.type === 'AssignmentExpression' && u.operator === '-='))) {
          s.forDecrement = true;
        }
        break;
      }
      case 'ForOfStatement':
      case 'ForInStatement':
        s.forOfCount += 1;
        break;
      case 'WhileStatement':
        s.whileCount += 1;
        break;
      case 'DoWhileStatement':
        s.doWhileCount += 1;
        break;
      case 'ContinueStatement':
        s.continueCount += 1;
        break;
      case 'BreakStatement':
        s.breakCount += 1;
        break;
      case 'ReturnStatement':
        s.returnCount += 1;
        break;
      case 'AssignmentExpression':
        s.assignOps.add(node.operator);
        break;
      case 'UpdateExpression':
        s.updateOps.add(node.operator);
        break;
      case 'CallExpression': {
        const name = memberName(node.callee);
        if (name) {
          s.calls.add(name);
          if (name.includes('.')) s.methods.add(name.slice(name.lastIndexOf('.') + 1));
        }
        break;
      }
      default:
        break;
    }
  });
  return s;
};

const isFunctionNode = (n) => n && ['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration'].includes(n.type);

const analyze = (source, options = {}) => {
  const code = stripEnonce(source);
  const comments = [];
  let ast;
  try {
    ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      locations: true,
      allowHashBang: true,
      onComment: (block, text, start, end, startLoc) => comments.push({ text: text.trim(), line: startLoc.line }),
    });
  } catch (e) {
    return { syntaxError: `SyntaxError: ${e.message.replace(/\s*\(\d+:\d+\)$/, '')} (ligne ${e.loc ? e.loc.line : '?'})` };
  }

  const body = ast.body.filter((n) => !(n.type === 'VariableDeclaration' && n.declarations.every((d) => d.id.name === 'enonce')));
  const empty = body.length === 0;

  const program = { ...ast, body };
  const s = summarize(program);

  const functions = new Map();
  const classicFunctions = [];
  const declarations = new Map(); // nom -> { kind, topLevel, inBlock, inFunction, initialized }
  const assigned = new Set();
  const concat = [];
  const callbacksWithoutReturn = [];

  const registerFunction = (name, fn, kind) => {
    const sub = summarize(fn.body);
    functions.set(name, {
      name,
      kind,
      node: fn,
      line: fn.loc.start.line,
      singleLine: fn.loc.start.line === fn.loc.end.line,
      concise: fn.type === 'ArrowFunctionExpression' && fn.body.type !== 'BlockStatement',
      defaults: fn.params.filter((p) => p.type === 'AssignmentPattern').map((p) => (p.left.name || '?')),
      paramCount: fn.params.length,
      summary: sub,
      hasConsoleLog: [...sub.calls].some((c) => c.startsWith('console.')),
    });
  };

  walk.fullAncestor(program, (node, state, ancestors) => {
    const parents = ancestors.slice(0, -1);
    const inClassic = parents.some((p) => p.type === 'FunctionDeclaration' || p.type === 'FunctionExpression');
    const inAnyFunction = parents.some(isFunctionNode);

    if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
      const declParent = parents[parents.length - 1];
      const container = parents[parents.length - 2];
      declarations.set(node.id.name, {
        kind: declParent ? declParent.kind : '?',
        topLevel: container === program,
        inFunction: inAnyFunction,
        inBlock: parents.some((p) => p.type === 'BlockStatement'),
        initialized: node.init !== null,
        inForInit: container && ['ForStatement', 'ForOfStatement', 'ForInStatement'].includes(container.type),
        line: node.loc.start.line,
      });
      if (isFunctionNode(node.init)) {
        registerFunction(node.id.name, node.init, node.init.type === 'ArrowFunctionExpression' ? 'arrow' : 'function');
      }
    }
    if (node.type === 'FunctionDeclaration' && node.id) {
      registerFunction(node.id.name, node, 'function');
    }
    if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
      if (!(options.allowClassicFunctions && node.type === 'FunctionDeclaration')) {
        classicFunctions.push({ name: node.id ? node.id.name : '(anonyme)', line: node.loc.start.line });
      }
    }
    if (node.type === 'AssignmentExpression' && node.left.type === 'Identifier') assigned.add(node.left.name);
    if (node.type === 'UpdateExpression' && node.argument.type === 'Identifier') assigned.add(node.argument.name);
    if ((node.type === 'ForOfStatement' || node.type === 'ForInStatement') && node.left.type === 'Identifier') {
      assigned.add(node.left.name);
    }
    if (node.type === 'BinaryExpression' && node.operator === '+') {
      const literalSide = isStringNode(node.left) || isStringNode(node.right);
      const bothLiteral = isStringNode(node.left) && isStringNode(node.right);
      if (literalSide && !bothLiteral && !(options.allowClassicFunctions && inClassic)) {
        concat.push({ line: node.loc.start.line });
      }
    }
    if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && !node.callee.computed) {
      const method = node.callee.property.name;
      const cb = node.arguments[0];
      if (['filter', 'map', 'find', 'findIndex', 'some', 'every', 'reduce', 'sort'].includes(method) && isFunctionNode(cb)) {
        const concise = cb.type === 'ArrowFunctionExpression' && cb.body.type !== 'BlockStatement';
        if (!concise && summarize(cb.body).returnCount === 0) {
          callbacksWithoutReturn.push({ method, line: cb.loc.start.line });
        }
      }
    }
  });

  const letNeverReassigned = [...declarations.entries()]
    .filter(([name, d]) => d.kind === 'let' && d.initialized && !d.inForInit && !assigned.has(name))
    .map(([name, d]) => ({ name, line: d.line }));

  return {
    empty,
    code,
    comments,
    summary: s,
    functions,
    classicFunctions,
    declarations,
    assigned,
    concat,
    callbacksWithoutReturn,
    letNeverReassigned,
    topLevelNames: [...declarations.entries()].filter(([, d]) => d.topLevel).map(([n]) => n),
  };
};

module.exports = { analyze, stripEnonce };
