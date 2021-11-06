const { stdin, stdout } = process;
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

const helloMsg = `
=======================
=                     =
=   PRINT SOME TEXT   =
=                     =
=======================
`;
const byeMsg = `
=======================
=                     =
=    SEE YOU LATER    =
=                     =
=======================
`;

function saveInputToFile(filePath) {
  const stream = fs.createWriteStream(filePath);
  stdout.write(colorSuccessMessage(`\n ${helloMsg}\n\n`));

  stdin.on('data', (data) => {
    const parsed = data.toString();

    if (parsed.trim() === 'exit') {
      stream.end();
      process.exit();
    }
    stream.write(parsed);
    stdout.write(
      `File ${colorActionMessage(
        'updated',
      )}. Appended value:   ${colorSuccessMessage(parsed)}`,
    );
  });

  process.on('SIGINT', () => {
    stream.end();
    process.exit();
  });

  process.on('exit', () =>
    stdout.write(colorSuccessMessage(`\n ${byeMsg}\n\n`)),
  );
}

saveInputToFile(path.join(__dirname, 'output.txt'));

// const { stdin, stdout } = process;
// const fs = require('fs');
// const path = require('path');
// const {
//   colorSuccessMessage,
//   colorActionMessage,
// } = require('../utils/colorConsoleText');

// const helloMsg = `
// =======================
// =                     =
// =   PRINT SOME TEXT   =
// =                     =
// =======================
// `;
// const byeMsg = `
// =======================
// =                     =
// =    SEE YOU LATER    =
// =                     =
// =======================
// `;

// function saveInputToFile(filePath) {
//   const stream = fs.createWriteStream(filePath);
//   stdout.write(colorSuccessMessage(`\n ${helloMsg}\n\n`));

//   stdin.on('data', (data) => {
//     const parsed = data.toString();

//     if (parsed.trim() === 'exit') {
//       stream.end();
//       process.exit();
//     }
//     stream.write(parsed);
//     stdout.write(
//       `File ${colorActionMessage(
//         'updated',
//       )}. Appended value:   ${colorSuccessMessage(parsed)}`,
//     );
//   });

//   process.on('SIGINT', () => {
//     stream.end();
//     process.exit();
//   });

//   process.on('exit', () =>
//     stdout.write(colorSuccessMessage(`\n ${byeMsg}\n\n`)),
//   );
// }

// saveInputToFile(path.join(__dirname, 'output.txt'));
