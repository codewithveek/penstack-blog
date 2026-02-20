/**
 * Fix:
 * 1. Imports with dot notation (Dialog.Body → remove, keep Dialog)
 * 2. Broken useDisclosure patterns
 */

import * as fs from "fs";
import * as path from "path";

const srcDir = path.join(__dirname, "..", "src");

function getFiles(dir: string, ext: string[] = [".tsx", ".ts"]): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFiles(fullPath, ext));
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      files.push(fullPath);
    }
  }
  return files;
}

let filesChanged = 0;

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Fix imports: remove dot-notation sub-components from chakra imports
  // e.g., Dialog.Backdrop, Dialog.Content → just keep Dialog
  const importRegex =
    /import\s*\{([^}]+)\}\s*from\s*["']@chakra-ui\/react["']/g;
  content = content.replace(importRegex, (match, imports) => {
    const importList: string[] = imports
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    const cleanedImports: string[] = [];
    const seen = new Set<string>();

    for (const imp of importList) {
      // If it contains a dot (like Dialog.Body), take only the base name
      const baseName = imp.includes(".") ? imp.split(".")[0] : imp;
      if (!seen.has(baseName)) {
        seen.add(baseName);
        cleanedImports.push(baseName);
      }
    }

    if (cleanedImports.length === importList.length) return match; // No changes
    return `import { ${cleanedImports.join(", ")} } from "@chakra-ui/react"`;
  });

  // Fix broken useDisclosure patterns
  // Pattern: const { isOpen, onOpen, onOpenChange } = ();
  // → const [open, setOpen] = useState(false)
  content = content.replace(
    /const\s*\{[^}]*\}\s*=\s*\(\s*\)\s*;?/g,
    (match) => {
      if (
        match.includes("isOpen") ||
        match.includes("onOpen") ||
        match.includes("onOpenChange") ||
        match.includes("onClose")
      ) {
        return "const [open, setOpen] = useState(false);";
      }
      return match;
    }
  );

  // Fix remaining isOpen/onOpen/onClose references from useDisclosure
  // These were partially renamed by the migration
  // isOpen → open (already done by prop rename)
  // onOpen() → setOpen(true)
  // onClose() → setOpen(false)
  // onOpenChange → onOpenChange (keep as-is for Dialog/Drawer)

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesChanged++;
    console.log(
      `Fixed: ${path.relative(path.join(__dirname, ".."), filePath)}`
    );
  }
}

console.log("Fixing import dot notation and useDisclosure...\n");
const files = getFiles(srcDir);
for (const file of files) {
  processFile(file);
}
console.log(`\nDone! Fixed ${filesChanged} files.`);
