const fs = require("fs").promises;
const path = require("path");

// Combined list of exclude patterns
const excludePatterns = [
  ".env",
  ".git",
  "node_modules",
  "package-lock.json",
  ".DS_Store",
  "*.log",
  "*.tmp",
  "*.temp",
  "*.swp",
  "*.swo",
  "thumbs.db",
  ".vscode",
  ".idea",
  "*.png",
  "*.ico",
  ".breakpoints",
  ".cache",
  ".local",
  ".config",
  ".upm",
  ".gitattributes",
  ".gitignore",
  "*.sqlite",
  "dist/**/*"
];

function matchWildcard(text, pattern) {
  const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp(`^${regexPattern}$`).test(text);
}

function shouldExclude(filePath) {
  const relativePath = path.relative(".", filePath);
  return excludePatterns.some((pattern) => {
    if (pattern.includes("*")) {
      return matchWildcard(path.basename(relativePath), pattern);
    }
    return relativePath.startsWith(pattern) || filePath.includes(`/${pattern}/`);
  });
}

async function generateFileStructure(dir, prefix = "") {
  const files = await fs.readdir(dir);
  let structure = "";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(dir, file);
    if (shouldExclude(filePath)) continue;

    const stats = await fs.stat(filePath);
    const isLast = i === files.length - 1;
    structure += `${prefix}${isLast ? "└── " : "├── "}${file}\n`;

    if (stats.isDirectory()) {
      structure += await generateFileStructure(
        filePath,
        `${prefix}${isLast ? "    " : "│   "}`
      );
    }
  }

  return structure;
}

async function createFileStructureContent() {
  const fileStructure = await generateFileStructure(".");
  return `# Current Project File Structure\n\`\`\`\n${fileStructure}\`\`\`\n`;
}

async function packageCodebase(rootDir, outputFile, fileStructureContent) {
  let content = "";

  // Add file structure to the beginning of the content
  content += fileStructureContent + "\n";

  async function processDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(rootDir, fullPath);
      if (
        relativePath === path.basename(outputFile) ||
        shouldExclude(fullPath)
      ) {
        continue;
      }
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else {
        const fileContent = await fs.readFile(fullPath, "utf-8");
        const fileExtension = path.extname(entry.name).slice(1);
        content += `# ${relativePath}\n\n\`\`\`${fileExtension}\n${fileContent}\n\`\`\`\n\n`;
      }
    }
  }

  await processDirectory(rootDir);

  // Add file structure to the end of the content
  content += "\n" + fileStructureContent;

  await fs.writeFile(outputFile, content);
  console.log(`Codebase packaged into ${outputFile}`);
}

async function main() {
  const fileStructureContent = await createFileStructureContent();
  const rootDirectory = process.cwd();
  const outputFilePath = path.join(rootDirectory, "all-code.md");
  await packageCodebase(rootDirectory, outputFilePath, fileStructureContent);
}

main().catch(console.error);