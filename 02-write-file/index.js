const { stdin, stdout } = process;
const fs = require('fs');
const path = require('path');
const { colorSuccessMessage } = require('../utils/colorConsoleText');

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

    if (parsed === 'exit') {
      stream.end();
      process.exit();
    }

    stream.write(parsed);
    stdout.write(
      colorSuccessMessage(`File updated. Appended value:   ${parsed}`),
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
