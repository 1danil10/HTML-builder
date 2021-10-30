const { stdout } = process;
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

async function createCssBundle(stylesFolderPath, targetFilePath) {
  const codeChunks = [];
  const files = await getFileNamesArrFromFolder(stylesFolderPath);

  for (const file of files) {
    if (path.extname(file).slice(1).toLowerCase() !== 'css') {
      continue;
    }
    codeChunks.push(await readFile(path.join(stylesFolderPath, file)));
  }
  writeFile(targetFilePath, codeChunks.join('\n'));
}

async function getFileNamesArrFromFolder(pathToFolder) {
  return await fsPromises.readdir(pathToFolder, {
    encoding: 'utf-8',
  });
}

async function readFile(pathToFile) {
  return await fsPromises.readFile(pathToFile, { encoding: 'utf8' });
}

async function writeFile(fileSavePath, content) {
  return await fs.promises.writeFile(fileSavePath, content, {
    encoding: 'utf-8',
  });
}

createCssBundle(
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'project-dist', 'bundle.css'),
);
