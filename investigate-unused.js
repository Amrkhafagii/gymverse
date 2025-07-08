const fs = require('fs');
const path = require('path');

// Helper function to recursively find files
function findFiles(dir, extensions = ['.tsx', '.ts']) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  traverse(dir);
  return files;
}

// Helper function to search for text in files
function searchInFiles(files, searchPattern, limit = 10) {
  const results = [];
  const regex = new RegExp(searchPattern, 'g');
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(regex);
      
      if (matches) {
        results.push({
          file: file,
          matches: matches.slice(0, 3) // Show first 3 matches per file
        });
        
        if (results.length >= limit) break;
      }
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  return results;
}

console.log('=== INVESTIGATING UNUSED FILES ===\n');

// 1. Find all TypeScript files in app and components
const appFiles = findFiles('./app');
const componentFiles = findFiles('./components');
const allFiles = [...appFiles, ...componentFiles];

console.log(`Found ${appFiles.length} files in app/`);
console.log(`Found ${componentFiles.length} files in components/`);
console.log(`Total files to analyze: ${allFiles.length}\n`);

// 2. Search for context imports
console.log('=== CONTEXT IMPORTS ===');
const contextImports = searchInFiles(allFiles, 'from.*contexts', 10);
contextImports.forEach(result => {
  console.log(`${result.file}:`);
  result.matches.forEach(match => console.log(`  ${match}`));
  console.log('');
});

// 3. Search for specific unused components
console.log('=== SPECIFIC COMPONENT USAGE ===');

const componentsToCheck = [
  'AchievementModal',
  'ChallengeCard', 
  'SocialFeedPost',
  'MeasurementCard',
  'LeaderboardCard'
];

componentsToCheck.forEach(component => {
  console.log(`\n--- ${component} ---`);
  const usage = searchInFiles(allFiles, component, 5);
  if (usage.length === 0) {
    console.log('  NOT FOUND - Likely unused');
  } else {
    usage.forEach(result => {
      console.log(`  ${result.file}: ${result.matches.join(', ')}`);
    });
  }
});

// 4. Check hook usage
console.log('\n=== HOOK USAGE ===');
const hooksToCheck = [
  'useAchievements',
  'useChallenges', 
  'useSupabaseAuth',
  'useStreakTracking',
  'useOfflineSync'
];

hooksToCheck.forEach(hook => {
  console.log(`\n--- ${hook} ---`);
  const usage = searchInFiles(allFiles, hook, 3);
  if (usage.length === 0) {
    console.log('  NOT FOUND - Likely unused');
  } else {
    usage.forEach(result => {
      console.log(`  ${result.file}: ${result.matches.join(', ')}`);
    });
  }
});

// 5. List actual context files vs imports
console.log('\n=== CONTEXT FILES ANALYSIS ===');
try {
  const contextFiles = fs.readdirSync('./contexts').filter(f => f.endsWith('.tsx'));
  console.log('Available context files:');
  contextFiles.forEach(file => console.log(`  ${file}`));
  
  console.log('\nActually imported contexts:');
  const importedContexts = searchInFiles(allFiles, 'from.*@/contexts', 20);
  const uniqueImports = new Set();
  importedContexts.forEach(result => {
    result.matches.forEach(match => {
      const contextName = match.match(/@\/contexts\/(\w+)/);
      if (contextName) uniqueImports.add(contextName[1]);
    });
  });
  
  Array.from(uniqueImports).forEach(context => console.log(`  ${context}`));
  
} catch (error) {
  console.log('Could not read contexts directory');
}

console.log('\n=== INVESTIGATION COMPLETE ===');
