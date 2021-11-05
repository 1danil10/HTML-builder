const path = require('path');
const { copyFolder } = require('../utils/copyFolder');

copyFolder(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));
