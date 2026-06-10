const fs = require('fs');
const path = require('path');

console.log('Current directory:', process.cwd());

// Check all possible data paths
const possiblePaths = [
  path.join(process.cwd(), '..', 'data'),
  path.join(process.cwd(), '..', '..', 'data'),
  path.join(__dirname, '..', 'data'),
  path.join(__dirname, '..', '..', '..', 'data'),
  '/home/talhak911/0Netixsol/DevSquad-26/day-35-langgraph-cricket-data-agent/data',
];

console.log('\nChecking data paths:');
for (const p of possiblePaths) {
  const exists = fs.existsSync(p);
  const careerFile = path.join(p, 'cric_players_year_by_year_career_summary.csv');
  const careerExists = fs.existsSync(careerFile);
  console.log(`${p}: ${exists ? 'EXISTS' : 'NOT FOUND'} (CSV: ${careerExists ? 'EXISTS' : 'NOT FOUND'})`);
}

// Check the CSV content
const dataDir = possiblePaths.find(p => fs.existsSync(path.join(p, 'cric_players_year_by_year_career_summary.csv')));
if (dataDir) {
  const careerPath = path.join(dataDir, 'cric_players_year_by_year_career_summary.csv');
  const lines = fs.readFileSync(careerPath, 'utf-8').trim().split('\n');
  console.log(`\nCSV has ${lines.length} lines`);
  
  // Parse first line to check format
  const firstLine = lines[0];
  const cols = firstLine.split(',');
  console.log(`First line has ${cols.length} columns`);
  console.log(`Format value (col 14): "${cols[14]}"`);
  
  // Count formats
  const formatCounts = {};
  for (let i = 0; i < Math.min(lines.length, 1000); i++) {
    const format = lines[i].split(',')[14];
    formatCounts[format] = (formatCounts[format] || 0) + 1;
  }
  console.log('Format counts (first 1000 lines):', formatCounts);
}
