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

const folder = 'secret-folder';

function getFolderFiles(folderPath) {
  fs.readdir(folderPath, 'utf8', (err, files) => {
    if (err) {
      throw new Error(colorErrorMessage(`Can't read folder: \n ${err}`));
    }
    showFileInfo({ name: 'Name', ext: 'Extension', size: 'Size, bytes' });
    files.forEach((file) => {
      getFileInfo(folderPath, file, showFileInfo);
    });
  });
}

function getFileInfo(folderPath, fileName, cb) {
  fs.stat(path.join(folderPath, fileName), (err, stats) => {
    if (err) {
      throw new Error(colorErrorMessage(`Error while reading file:\n ${err}`));
    }

    if (!stats.isFile()) {
      return false;
    }

    const [name, ext] = fileName.split(/\.(?=[0-9a-z]+$)/);
    cb({ name, ext, size: stats.size });
  });
}

function showFileInfo({ name, ext, size }) {
  const formattedName = colorStringForOutput('blue', name.padEnd(10, ' '));
  const formattedExt = colorStringForOutput('yellow', ext.padEnd(10, ' '));
  const formattedSize = colorStringForOutput('cyan', size.toString());
  stdout.write(`${formattedName}${formattedExt}${formattedSize}\n`);
}

getFolderFiles(path.join(__dirname, folder));
// const { stdout } = process;
// const fs = require('fs');
// const path = require('path');
// const {
//   colorStringForOutput,
//   colorErrorMessage,
// } = require('../utils/colorConsoleText');

// const folder = 'secret-folder';

// function getFolderFiles(folderPath) {
//   fs.readdir(folderPath, 'utf8', (err, files) => {
//     if (err) {
//       throw new Error(colorErrorMessage(`Can't read folder: \n ${err}`));
//     }
//     showFileInfo({ name: 'Name', ext: 'Extension', size: 'Size, bytes' });
//     files.forEach((file) => {
//       getFileInfo(folderPath, file, showFileInfo);
//     });
//   });
// }

// function getFileInfo(folderPath, fileName, cb) {
//   fs.stat(path.join(folderPath, fileName), (err, stats) => {
//     if (err) {
//       throw new Error(colorErrorMessage(`Error while reading file:\n ${err}`));
//     }

//     if (!stats.isFile()) {
//       return false;
//     }

//     const [name, ext] = fileName.split(/\.(?=[0-9a-z]+$)/);
//     cb({ name, ext, size: stats.size });
//   });
// }

// function showFileInfo({ name, ext, size }) {
//   const formattedName = colorStringForOutput('blue', name.padEnd(10, ' '));
//   const formattedExt = colorStringForOutput('yellow', ext.padEnd(10, ' '));
//   const formattedSize = colorStringForOutput('cyan', size.toString());
//   stdout.write(`${formattedName}${formattedExt}${formattedSize}\n`);
// }

// getFolderFiles(path.join(__dirname, folder));
