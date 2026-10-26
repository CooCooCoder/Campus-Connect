const fs = require('fs');
const path = require('path');
const archiver = require('../backend/node_modules/archiver');

const outputZip = path.join(__dirname, '..', 'CampusConnect_Shivamsh_Anil_Menon.zip');
const sourceDir = path.join(__dirname, '..');

const output = fs.createWriteStream(outputZip);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log(`ZIP successfully packaged! Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Exclude list
const excludeRegex = /(node_modules|dist|\.git|\.db|\.db-journal|\.zip$|\.env$)/;

function addDir(dirPath, zipPath = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const entryZipPath = zipPath ? `${zipPath}/${entry.name}` : entry.name;

    if (entry.name.startsWith('.env') && !entry.name.endsWith('.example')) continue;
    if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
    if (entry.name.endsWith('.db') || entry.name.endsWith('.db-journal') || entry.name.endsWith('.zip')) continue;

    if (entry.isDirectory()) {
      addDir(fullPath, entryZipPath);
    } else if (entry.isFile()) {
      archive.file(fullPath, { name: entryZipPath });
    }
  }
}

addDir(sourceDir);
archive.finalize();
