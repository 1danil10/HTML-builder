const { stdout } = process;
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const {
  colorErrorMessage,
  colorSuccessMessage,
  colorActionMessage,
} = require('./colorConsoleText');
const { getFolderData } = require('./getFolderData');

async function createCssBundle(stylesFolderPath, targetFilePath) {
  try {
    let str = await folderDataToString(stylesFolderPath);
    writeFile(targetFilePath, str);
    const { base, dir } = path.parse(targetFilePath);
    stdout.write(
      `${colorSuccessMessage(base)} ${colorActionMessage(
        'created',
      )} in ${colorSuccessMessage(dir)} \n`,
    );
  } catch (err) {
    stdout.write(colorErrorMessage('Error while creating bundle \n'));
    throw new Error(colorErrorMessage(err));
  }
}

async function folderDataToString(folderPath) {
  let codeChunks = [];
  const { fileNames: files, directoryNames } = await getFolderData(folderPath);

  for (const { name: fileName } of files) {
    if (path.extname(fileName).slice(1).toLowerCase() !== 'css') {
      continue;
    }
    codeChunks.push(await readFile(path.join(folderPath, fileName)));
  }

  if (directoryNames.length) {
    for (const { name: directoryName } of directoryNames) {
      codeChunks.push(
        await folderDataToString(path.join(folderPath, directoryName)),
      );
    }
  }
  return codeChunks.join('\n');
}

async function readFile(pathToFile) {
  try {
    return await fsPromises.readFile(pathToFile, { encoding: 'utf8' });
  } catch (err) {
    stdout.write(colorErrorMessage(`Error while reading file ${pathToFile}\n`));
    throw new Error(colorErrorMessage(err));
  }
}

async function writeFile(fileSavePath, content) {
  return await fs.promises.writeFile(fileSavePath, content, {
    encoding: 'utf8',
  });
}

module.exports.createCssBundle = createCssBundle;
