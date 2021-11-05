const path = require('path');
const { createCssBundle } = require('../utils/createCssBundle');

createCssBundle(
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'project-dist', 'bundle.css'),
);
