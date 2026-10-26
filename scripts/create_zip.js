const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const outputZipPath = path.join(__dirname, '..', 'CampusConnect_Shivamsh_Anil_Menon.zip');
const output = fs.createWriteStream(outputZipPath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function () {
  console.log(`ZIP Archive created successfully!`);
  console.log(`File: ${outputZipPath}`);
  console.log(`Total Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB (${archive.pointer()} bytes)`);
});

archive.on('error', function (err) {
  throw err;
});

archive.pipe(output);

const rootDir = path.join(__dirname, '..');

// Helper to add files ignoring node_modules, .git, .env, .db, dist, zip
function addDirectory(currentDir, zipPrefix = '') {
  const items = fs.readdirSync(currentDir);

  for (const item of items) {
    // Exclusions
    if (
      item === 'node_modules' ||
      item === '.git' ||
      item === 'dist' ||
      item === 'build' ||
      item === '.cache' ||
      item === '.env' ||
      item.endsWith('.db') ||
      item.endsWith('.db-journal') ||
      item.endsWith('.zip')
    ) {
      continue;
    }

    const fullPath = path.join(currentDir, item);
    const stat = fs.statSync(fullPath);
    const entryName = zipPrefix ? `${zipPrefix}/${item}` : item;

    if (stat.isDirectory()) {
      addDirectory(fullPath, entryName);
    } else {
      archive.file(fullPath, { name: entryName });
    }
  }
}

addDirectory(rootDir);
archive.finalize();
