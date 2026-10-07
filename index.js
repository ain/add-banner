/*!
 * add-banner <https://github.com/ain/add-banner>
 *
 * Originally by Jon Schlinkert. Licensed under the MIT license.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const read = filepath => fs.readFileSync(filepath, 'utf8');

/**
 * Find and parse the closest package.json, starting at `dir`.
 */

const loadPackage = dir => {
  let current = path.resolve(dir);
  for (;;) {
    const candidate = path.join(current, 'package.json');
    if (fs.existsSync(candidate)) {
      return JSON.parse(read(candidate));
    }
    const parent = path.dirname(current);
    if (parent === current) return {};
    current = parent;
  }
};

/**
 * Extract the name from an author, which is either an object
 * or a string like `Name <email> (url)`.
 */

const authorName = author => {
  if (author && typeof author === 'object') return author.name;
  if (typeof author !== 'string') return undefined;
  return author.replace(/<[^>]*>|\([^)]*\)/g, '').trim() || undefined;
};

/**
 * Create the context necessary for rendering the banner template.
 */

const createContext = locals => {
  const repository = locals.homepage || locals.repository || '';
  const homepage = repository.url ? repository.url : repository;
  return Object.assign({}, locals, {
    author: authorName(locals.author) || 'unknown',
    homepage: homepage || 'unknown',
    license: locals.license || 'MIT',
    year: locals.year || new Date().getFullYear()
  });
};

/**
 * Render a template. Only `<%= path.to.value %>` (and `<%- ... %>`)
 * interpolation is supported; template content is never evaluated as code.
 */

const render = (template, context) => template.replace(
  /<%[=-]\s*([\w$]+(?:\.[\w$]+)*)\s*%>/g,
  (match, key) => {
    let value = context;
    for (const part of key.split('.')) {
      if (value === null || typeof value !== 'object' || !Object.prototype.hasOwnProperty.call(value, part)) {
        return '';
      }
      value = value[part];
    }
    return value === undefined || value === null ? '' : String(value);
  }
);

/**
 * Remove an existing leading `/*! ... *\/` banner comment.
 */

const stripBanner = str => str.replace(/^\s*\/\*![\s\S]*?\*\/\s*/, '');

/**
 * Return the content of `filepath` prefixed with a rendered banner.
 *
 * ```js
 * const banner = require('add-banner');
 * banner('index.js');
 * banner('index.js', { template: 'my-banner.tmpl' });
 * banner('index.js', { name: 'foo' });
 * ```
 * @param  {String} `filepath` The file to prefix with a banner.
 * @param  {Object} `options` `template` is the path to a template file; every other property extends the context (package.json) passed to the template.
 * @return {String}
 */

module.exports = function(filepath, options = {}) {
  const pkg = loadPackage(options.cwd || process.cwd());
  const template = read(options.template || path.join(__dirname, 'banner.tmpl'));
  const banner = render(template, createContext(Object.assign({}, pkg, options)));
  let content = stripBanner(read(filepath));
  if (content[0] === '\n' && banner.slice(-1) === '\n') {
    content = content.slice(1);
  }
  return banner + content;
};

module.exports.render = render;
