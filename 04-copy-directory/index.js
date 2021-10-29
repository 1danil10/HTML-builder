const { stdout } = process;
const fs = require('fs');
const path = require('path');

function copyFolder(sourcePath, destinationPath) {
  fs.mkdir(destinationPath, { recursive: true }, (err) => {
    if (err) {
      stdout(err);
    }
  });

  fs.readdir(sourcePath, 'utf8', (err, files) => {
    if (err) {
      stdout.write(err);
    }

    files.forEach((file) => {
      fs.stat(path.join(sourcePath, file), (err, stats) => {
        if (err) {
          stdout.write(err);
        }

        if (stats.isFile()) {
          fs.copyFile(
            path.join(sourcePath, file),
            path.join(destinationPath, file),
            (err) => {
              if (err) {
                stdout.write(err);
              }
            },
          );
        }

        if (stats.isDirectory()) {
          copyFolder(
            path.join(currentSource, file),
            path.join(currentDestination, file),
          );
        }
      });
    });
  });
}

copyFolder(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));

//alternate

// fs.cp(
//   path.join(__dirname, 'files'),
//   path.join(__dirname, 'files-copy'),
//   {
//     recursive: true,
//   },
//   (err) => {
//     err && stdout.write(err);
//   },
// );
