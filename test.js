'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const banner = require('./');

const FILEPATH = 'test-target.js';

test('uses package.json defaults', () => {
  const year = new Date().getFullYear();
  const expected = `/*!\n * add-banner <https://github.com/ain/add-banner>\n *\n * Copyright (c) ${year} Ain Tohvri, contributors.\n * Licensed under the MIT license.\n */\n`;
  assert.strictEqual(banner(FILEPATH), expected);
});

test('options extend the context', () => {
  const options = {
    name: 'addbanner',
    author: 'J. Schlinkert <j@example.com> (https://github.com/jonschlinkert)',
    homepage: 'https://github.com/jonschlinkert/addbanner',
    template: 'banner.tmpl',
    year: '2017',
    license: 'GPL-3'
  };
  assert.strictEqual(banner(FILEPATH, options), '/*!\n * addbanner <https://github.com/jonschlinkert/addbanner>\n *\n * Copyright (c) 2017 J. Schlinkert, contributors.\n * Licensed under the GPL-3 license.\n */\n');
});

test('templates are never evaluated as code', () => {
  assert.strictEqual(banner.render('<%= process.exit(1) %>|<%= constructor.name %>|<%= a.b %>', { a: { b: 'ok' } }), '<%= process.exit(1) %>|' + '|ok');
});

test('replaces an existing banner and CLI writes files', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'add-banner-'));
  const file = path.join(dir, 'a.js');
  fs.writeFileSync(file, '/*! old */\nconsole.log(1);\n');
  const cli = path.join(__dirname, 'bin', 'add-banner.js');
  execFileSync('node', [cli, file], { cwd: __dirname });
  execFileSync('node', [cli, file], { cwd: __dirname });
  const out = fs.readFileSync(file, 'utf8');
  assert.strictEqual(out.match(/\/\*!/g).length, 1);
  assert.ok(out.endsWith(' */\nconsole.log(1);\n'));
});
