// copypaste
const { stdout } = process;
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const TEXT_COLORS = [
  { name: 'white', code: [37, 89] },
  { name: 'blue', code: [34, 89] },
  { name: 'yellow', code: [33, 89] },
  { name: 'red', code: [31, 89] },
  { name: 'cyan', code: [36, 89] },
  { name: 'green', code: [32, 89] },
  { name: 'magenta', code: [35, 89] },
  { name: 'gray', code: [30, 89] },
];
const whiteTextColor = TEXT_COLORS.find((el) => el.name === 'white');

function colorStringForOutput(textColor, string) {
  const {
    code: [textColorStart, textColorEnd],
  } =
    TEXT_COLORS.find((el) => el.name === textColor.toLowerCase()) ??
    whiteTextColor;

  return `\x1b[${textColorStart}m${string}\x1b[${textColorEnd}m\x1b[0m`;
}

const colorSuccessMessage = colorStringForOutput.bind(null, 'green');
const colorErrorMessage = colorStringForOutput.bind(null, 'red');
const colorActionMessage = colorStringForOutput.bind(null, 'blue');

async function getFolderData(folderPath) {
  try {
    const fileNames = [];
    const directoryNames = [];
    const files = await fs.promises.readdir(folderPath, {
      encoding: 'utf8',
      withFileTypes: true,
    });

    for (const file of files) {
      if (file.isFile()) {
        fileNames.push(file);
      } else if (file.isDirectory()) {
        directoryNames.push(file);
      }
    }

    return { fileNames, directoryNames };
  } catch (err) {
    stdout.write(
      colorErrorMessage(`Error while reading files in folder ${folderPath} \n`),
    );
    throw new Error(colorErrorMessage(err));
  }
}

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

createCssBundle(
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'project-dist', 'bundle.css'),
);

// copypaste/

// const path = require('path');
// const { createCssBundle } = require('../utils/createCssBundle');

// createCssBundle(
//   path.join(__dirname, 'styles'),
//   path.join(__dirname, 'project-dist', 'bundle.css'),
// );
