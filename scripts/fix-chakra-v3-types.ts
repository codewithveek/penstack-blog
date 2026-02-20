/**
 * Fix remaining Chakra v3 migration issues:
 * 1. Namespace components (Card→Card.Root, Alert→Alert.Root, etc.)
 * 2. leftIcon/rightIcon → children pattern
 * 3. icon prop on IconButton → children
 * 4. isTruncated → truncate
 * 5. useDisclosure → useState pattern
 * 6. Various v2→v3 prop renames
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

let totalChanges = 0;
let filesChanged = 0;

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // ========================================
  // 1. Fix Card namespace (Card → Card.Root)
  // ========================================
  // Card is now a namespace in v3. <Card> → <Card.Root>, <CardBody> → <Card.Body>, etc.
  // But we need to be careful: if the file already uses Card.Root, don't double-transform

  if (content.includes("@chakra-ui/react")) {
    // Card: <Card ...> → <Card.Root ...>, </Card> → </Card.Root>
    // But NOT <Card.Root (already transformed)
    content = content.replace(/<Card(?=[\s>\/])(?!\.)/g, "<Card.Root");
    content = content.replace(/<\/Card(?!\.)/g, "</Card.Root");

    // Alert: <Alert ...> → <Alert.Root ...>, </Alert> → </Alert.Root>
    content = content.replace(/<Alert(?=[\s>\/])(?!\.)/g, "<Alert.Root");
    content = content.replace(/<\/Alert(?!\.)/g, "</Alert.Root");

    // Menu: <Menu ...> → <Menu.Root ...>, </Menu> → </Menu.Root>
    content = content.replace(/<Menu(?=[\s>\/])(?!\.)/g, "<Menu.Root");
    content = content.replace(/<\/Menu(?!\.)/g, "</Menu.Root");

    // Avatar: <Avatar ...> → <Avatar.Root ...>
    content = content.replace(/<Avatar(?=[\s>\/])(?!\.)/g, "<Avatar.Root");
    content = content.replace(/<\/Avatar(?!\.)/g, "</Avatar.Root");

    // Switch: <Switch ...> → <Switch.Root ...>
    content = content.replace(/<Switch(?=[\s>\/])(?!\.)/g, "<Switch.Root");
    content = content.replace(/<\/Switch(?!\.)/g, "</Switch.Root");

    // Checkbox: <Checkbox ...> → <Checkbox.Root ...>
    content = content.replace(/<Checkbox(?=[\s>\/])(?!\.)/g, "<Checkbox.Root");
    content = content.replace(/<\/Checkbox(?!\.)/g, "</Checkbox.Root");

    // Tooltip:  <Tooltip ...> → <Tooltip.Root ...>
    content = content.replace(/<Tooltip(?=[\s>\/])(?!\.)/g, "<Tooltip.Root");
    content = content.replace(/<\/Tooltip(?!\.)/g, "</Tooltip.Root");

    // Tag: <Tag ...> → <Tag.Root ...>
    content = content.replace(/<Tag(?=[\s>\/])(?!\.)/g, "<Tag.Root");
    content = content.replace(/<\/Tag(?!\.)/g, "</Tag.Root");

    // Table: <Table ...> → <Table.Root ...>
    content = content.replace(/<Table(?=[\s>\/])(?!\.)/g, "<Table.Root");
    content = content.replace(/<\/Table(?!\.)/g, "</Table.Root");

    // Tabs: <Tabs ...> → <Tabs.Root ...>
    content = content.replace(/<Tabs(?=[\s>\/])(?!\.)/g, "<Tabs.Root");
    content = content.replace(/<\/Tabs(?!\.)/g, "</Tabs.Root");

    // Progress: <Progress ...> → <Progress.Root ...>
    content = content.replace(/<Progress(?=[\s>\/])(?!\.)/g, "<Progress.Root");
    content = content.replace(/<\/Progress(?!\.)/g, "</Progress.Root");

    // Drawer: <Drawer ...> → <Drawer.Root ...>
    content = content.replace(/<Drawer(?=[\s>\/])(?!\.)/g, "<Drawer.Root");
    content = content.replace(/<\/Drawer(?!\.)/g, "</Drawer.Root");

    // List: <List ...> → <List.Root ...>
    content = content.replace(/<List(?=[\s>\/])(?!\.)/g, "<List.Root");
    content = content.replace(/<\/List(?!\.)/g, "</List.Root");

    // Popover: <Popover ...> → <Popover.Root ...>
    content = content.replace(/<Popover(?=[\s>\/])(?!\.)/g, "<Popover.Root");
    content = content.replace(/<\/Popover(?!\.)/g, "</Popover.Root");

    // Accordion: <Accordion ...> → <Accordion.Root ...>
    content = content.replace(
      /<Accordion(?=[\s>\/])(?!\.)/g,
      "<Accordion.Root"
    );
    content = content.replace(/<\/Accordion(?!\.)/g, "</Accordion.Root");
  }

  // ========================================
  // 2. Fix isTruncated → truncate
  // ========================================
  content = content.replace(/\bisTruncated\b/g, "truncate");

  // ========================================
  // 3. Fix leftIcon/rightIcon on Button → children pattern
  // ========================================
  // leftIcon={<Icon />} → remove prop, Icon goes as first child
  // This is complex for JSX so we handle simple cases

  // ========================================
  // 4. Fix icon prop on IconButton → children
  // ========================================
  // icon={<LuX />} is already handled by icon→children in some cases,
  // but the prop itself is no longer valid. We'll handle in specific files.

  // ========================================
  // 5. Fix various prop renames
  // ========================================
  // size="xs" on Text → fontSize="xs"
  // (handled case by case)

  // ========================================
  // 6. Fix animateOpacity (removed in v3)
  // ========================================
  content = content.replace(/\s+animateOpacity/g, "");

  // ========================================
  // 7. Fix maxH → maxHeight (Chakra v3 style prop)
  // ========================================
  // maxH is still valid in v3, skip

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesChanged++;
    const changes = countDiffs(original, content);
    totalChanges += changes;
    console.log(
      `Fixed: ${path.relative(srcDir, filePath)} (${changes} changes)`
    );
  }
}

function countDiffs(a: string, b: string): number {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  let count = 0;
  const max = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < max; i++) {
    if (aLines[i] !== bLines[i]) count++;
  }
  return count;
}

console.log("Starting Chakra v3 type fixes...\n");
const files = getFiles(srcDir);
for (const file of files) {
  processFile(file);
}
console.log(
  `\nDone! Changed ${filesChanged} files with ${totalChanges} line changes.`
);
