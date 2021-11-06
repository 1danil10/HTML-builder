const { stdout } = process;
const fs = require('fs');
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

async function createFolder(folderPath) {
  try {
    await fs.promises.mkdir(folderPath, { recursive: true });
    const { dir, name } = path.parse(folderPath);
    stdout.write(
      `Folder ${colorSuccessMessage(name)} ${colorActionMessage(
        'created',
      )} in ${colorSuccessMessage(dir)} \n`,
    );
  } catch (err) {
    stdout.write(colorErrorMessage('Error while create ${folderPath} \n'));
    throw new Error(colorErrorMessage(err));
  }
}

async function isFolderExists(folderPath) {
  try {
    await fs.promises.access(
      folderPath,
      fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
    );
    stdout.write(
      `Folder ${colorSuccessMessage(folderPath)} already ${colorActionMessage(
        'exists',
      )} \n`,
    );
    return true;
  } catch (e) {
    stdout.write(colorErrorMessage(`Folder ${folderPath} not exists \n`));
    return false;
  }
}

async function removeFolder(folderPath) {
  try {
    await fs.promises.rm(folderPath, { recursive: true });
    stdout.write(
      `Folder ${colorSuccessMessage(folderPath)} ${colorActionMessage(
        'removed',
      )} \n`,
    );
  } catch (err) {
    console.log(
      colorErrorMessage(`error while remove folder: ${folderPath} \n`),
    );
    throw new Error(colorErrorMessage(err));
  }
}

async function copyFile(sourcePath, destinationPath) {
  try {
    await fs.promises.copyFile(sourcePath, destinationPath);
  } catch (err) {
    stdout.write(
      colorErrorMessage(
        `Error while copying file ${sourcePath} to ${destinationPath}`,
      ),
    );
    throw new Error(colorErrorMessage(err));
  }
}

async function copyFolder(sourcePath, destinationPath) {
  const isExist = await isFolderExists(destinationPath);
  if (isExist) {
    await removeFolder(destinationPath);
  }
  createFolder(destinationPath);

  const { fileNames, directoryNames } = await getFolderData(sourcePath);
  fileNames.forEach(({ name }) =>
    copyFile(path.join(sourcePath, name), path.join(destinationPath, name)),
  );

  if (directoryNames.length > 0) {
    directoryNames.forEach(({ name }) =>
      copyFolder(path.join(sourcePath, name), path.join(destinationPath, name)),
    );
  }
  const { name: nameS } = path.parse(sourcePath);
  const { name: nameD, dir: dirD } = path.parse(destinationPath);
  stdout.write(
    `Files successfuly ${colorActionMessage(
      'copied',
    )} from ${colorSuccessMessage(nameS)} to ${colorSuccessMessage(
      nameD,
    )} in ${colorSuccessMessage(dirD)} \n`,
  );
}

copyFolder(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));

// const path = require('path');
// const { copyFolder } = require('../utils/copyFolder');

// copyFolder(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));
