const { stdin, stdout } = process;
const fs = require('fs');
const path = require('path');
const byeMsg = `
=======================
=                     =
=    SEE YOU LATER    =
=                     =
=======================
`;

function saveInputToFile(filename) {
  const stream = fs.createWriteStream(path.join(__dirname, filename));

  stdin.on('data', (data) => {
    const parsed = data.toString();

    if (parsed.trim().toLowerCase() === 'exit') {
      stream.end();
      process.exit();
    }

    stream.write(parsed);
  });

  process.on('SIGINT', () => {
    stream.end();
    process.exit();
  });
  process.on('exit', () => stdout.write(`\n ${byeMsg}\n\n`));
}

saveInputToFile('output.txt');
