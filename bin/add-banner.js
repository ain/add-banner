#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');
const banner = require('..');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    version: { type: 'boolean', short: 'V' },
    help: { type: 'boolean', short: 'h' },
    template: { type: 'string', short: 't' }
  }
});

if (values.version) {
  console.log('add-banner', require('../package.json').version);
  process.exit();
}

if (values.help || !positionals.length) {
  const usage = 'Usage: add-banner [options] <file...>\n\n' +
    '  -h, --help                 output usage information\n' +
    '  -V, --version              output the version number\n' +
    '  -t, --template <filepath>  path to template file';
  (values.help ? console.log : console.error)(values.help ? usage : 'Command argument for files missing!\n\n' + usage);
  process.exit(values.help ? 0 : 1);
}

const options = values.template ? { template: path.resolve(values.template) } : {};

positionals.forEach(file => {
  fs.writeFileSync(file, banner(file, options));
  console.log('Banner added to:', file);
});
