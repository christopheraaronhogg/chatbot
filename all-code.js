const fs = require('fs').promises;
const path = require('path');

async function packageCodebase(rootDir, outputFile) {
  let content = '';

  // Patterns for files and directories to ignore
  const ignorePatterns = [
    '.env',
    '.git',
    'node_modules',
    'package-lock.json',
    '.DS_Store',
    '*.log',
    '*.tmp',
    '*.temp',
    '*.swp',
    '*.swo',
    'thumbs.db',
    '.vscode',
    '.idea',
    '*.png',
    '*.ico'
  ];

  function shouldIgnore(filePath) {
    const basename = path.basename(filePath);
    return ignorePatterns.some(pattern => {
      if (pattern.startsWith('*')) {
        return basename.endsWith(pattern.slice(1));
      }
      return basename === pattern || filePath.includes(`/${pattern}/`);
    });
  }

  async function processDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(rootDir, fullPath);

      // Exclude the output file itself and ignored patterns
      if (relativePath === path.basename(outputFile) || shouldIgnore(fullPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else {
        const fileContent = await fs.readFile(fullPath, 'utf-8');
        const fileExtension = path.extname(entry.name).slice(1);
        
        content += `# ${relativePath}\n\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\`\n\n`;
      }
    }
  }

  await processDirectory(rootDir);
  await fs.writeFile(outputFile, content);
  console.log(`Codebase packaged into ${outputFile}`);
}

// Use the current directory as root and 'all-code.md' as the output file
const rootDirectory = process.cwd();
const outputFilePath = path.join(rootDirectory, 'all-code.md');

packageCodebase(rootDirectory, outputFilePath).catch(console.error);