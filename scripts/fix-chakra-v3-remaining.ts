/**
 * Fix remaining Chakra v3 issues:
 * 1. Tooltip: label prop → compound component pattern
 * 2. isChecked → checked on Checkbox/Switch
 * 3. icon prop on IconButton → children
 * 4. leftIcon/rightIcon on Button → children
 * 5. loading/isLoading variable name conflicts
 * 6. Select onChange type
 * 7. as prop on Button (for Link) → asChild
 * 8. Tabs.Trigger/Tabs.Content need value prop
 * 9. useDisclosure → useState
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
  // 1. Fix Tooltip: simple label on Tooltip → Tooltip content as children
  // In v3, Tooltip is a namespace component:
  // <Tooltip label="text"><trigger/></Tooltip> →
  // <Tooltip.Root><Tooltip.Trigger asChild><trigger/></Tooltip.Trigger><Tooltip.Content>text</Tooltip.Content></Tooltip.Root>
  //
  // But this is very complex to do with regex. Instead, Chakra v3 provides
  // a "Tooltip" component that accepts `content` prop (shorthand).
  // So: <Tooltip.Root label="text"> → <Tooltip.Root content="text">
  // ========================================
  content = content.replace(
    /<Tooltip\.Root(\s+)label=/g,
    "<Tooltip.Root$1content="
  );

  // ========================================
  // 2. Fix isChecked → checked on Checkbox/Switch
  // ========================================
  content = content.replace(/\bisChecked\b/g, "checked");

  // ========================================
  // 3. Fix icon prop on IconButton → children
  // icon={<LuX />} → <IconButton ...><LuX /></IconButton>
  // This is complex. Let's handle the simple case:
  // <IconButton ... icon={<Comp />} ... /> → need to extract icon and make it children
  // For now, just a simple pattern:
  // ========================================
  // Match self-closing IconButton with icon prop
  content = content.replace(
    /<IconButton([^>]*?)\s+icon=\{([^}]+)\}([^>]*?)\/>/g,
    (match, before, iconContent, after) => {
      return `<IconButton${before}${after}>${iconContent}</IconButton>`;
    }
  );

  // ========================================
  // 4. Fix leftIcon/rightIcon on Button
  // <Button leftIcon={<Icon />}>text</Button> →
  // <Button><Icon /> text</Button>
  // ========================================
  // Remove leftIcon prop and add icon before children
  content = content.replace(
    /<Button([^>]*?)\s+leftIcon=\{([^}]+)\}([^>]*)>([\s\S]*?)<\/Button>/g,
    (match, before, iconContent, after, children) => {
      return `<Button${before}${after}>${iconContent} ${children.trim()}</Button>`;
    }
  );
  // Remove rightIcon prop and add icon after children
  content = content.replace(
    /<Button([^>]*?)\s+rightIcon=\{([^}]+)\}([^>]*)>([\s\S]*?)<\/Button>/g,
    (match, before, iconContent, after, children) => {
      return `<Button${before}${after}>${children.trim()} ${iconContent}</Button>`;
    }
  );

  // ========================================
  // 5. Fix loading variable reference
  // Previous migration renamed isLoading→loading but some destructured
  // vars still reference the old name
  // ========================================
  // Don't do global rename - too risky

  // ========================================
  // 6. Fix e.target.value on Select/NativeSelect onChange
  // In v3, NativeSelect.Root onChange gives standard HTML event
  // ========================================
  // Skip - needs manual review

  // ========================================
  // 7. Fix Tooltip with hasArrow
  // hasArrow → just keep, v3 Tooltip.Root might support it via content prop
  // Actually in v3 Tooltip shorthand, it's: <Tooltip content="..." hasArrow>
  // ========================================
  // Already handled by label→content rename

  // ========================================
  // 8. Fix size prop on Text (removed in v3)
  // <Text size="sm"> → <Text fontSize="sm">
  // ========================================
  content = content.replace(
    /<Text([^>]*?)\s+size="([^"]+)"([^>]*?)>/g,
    '<Text$1 fontSize="$2"$3>'
  );

  // ========================================
  // 9. Fix leftIcon/rightIcon on Menu.Trigger
  // ========================================
  content = content.replace(
    /<Menu\.Trigger([^>]*?)\s+leftIcon=\{([^}]+)\}([^>]*)>/g,
    "<Menu.Trigger$1$3>"
  );

  // ========================================
  // 10. Fix Menu.Item icon prop
  // <Menu.Item icon={<Icon />}>text</Menu.Item> →
  // <Menu.Item><Icon /> text</Menu.Item>
  // ========================================
  content = content.replace(
    /<Menu\.Item([^>]*?)\s+icon=\{([^}]+)\}([^>]*)>([\s\S]*?)<\/Menu\.Item>/g,
    (match, before, iconContent, after, children) => {
      return `<Menu.Item${before}${after}>${iconContent} ${children.trim()}</Menu.Item>`;
    }
  );

  // ========================================
  // 11. Fix as={Button} on Menu.Trigger
  // v3 uses asChild instead
  // ========================================
  // <Menu.Trigger as={Button}> → <Menu.Trigger asChild><Button>
  // This is complex, skip for now

  // ========================================
  // 12. Fix NativeSelect.Root with options as children
  // In v3 NativeSelect, options should be wrapped in NativeSelect.Field
  // <NativeSelect.Root> <option>...</option> → <NativeSelect.Root><NativeSelect.Field><option>...</option></NativeSelect.Field>
  // ========================================
  // Complex, handle in specific files

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

console.log("Fixing remaining Chakra v3 issues...\n");
const files = getFiles(srcDir);
for (const file of files) {
  processFile(file);
}
console.log(
  `\nDone! Changed ${filesChanged} files with ${totalChanges} line changes.`
);
