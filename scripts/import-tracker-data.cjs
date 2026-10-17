const fs = require('node:fs');
const path = require('node:path');

const sourcePath = process.argv[2];
const targetPath = path.join(__dirname, '..', 'data', 'manhwas.json');

if (!sourcePath) {
  console.error('Usage: npm run import:tracker -- /path/to/reading-tracker-data.json');
  process.exit(1);
}

let records;
try {
  records = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
} catch (error) {
  console.error(`Could not read tracker data: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(records)) {
  console.error('Tracker data must be a JSON array.');
  process.exit(1);
}

const ids = new Set();
const sanitizedRecords = records.map((record, index) => {
  if (!record || typeof record !== 'object' || !record.id || !record.title) {
    throw new Error(`Entry ${index + 1} must include an id and title.`);
  }

  if (ids.has(record.id)) {
    throw new Error(`Duplicate manhwa id: ${record.id}`);
  }
  ids.add(record.id);

  const { offline, ...cloudSafeRecord } = record;
  return cloudSafeRecord;
});

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, `${JSON.stringify(sanitizedRecords, null, 2)}\n`);
console.log(`Saved ${sanitizedRecords.length} manhwas to ${targetPath}.`);
