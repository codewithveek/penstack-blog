/**
 * Fix Chakra v3 sub-component names:
 * - PopoverTrigger → Popover.Trigger, PopoverContent → Popover.Content, etc.
 * - AlertDescription → Alert.Description, AlertTitle → Alert.Title, etc.
 * - CardBody → Card.Body, CardHeader → Card.Header, etc.
 * - Also fix broken closing tags like </Popover.RootTrigger> → </Popover.Trigger>
 * - Also fix imports
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

// Map: OldName → NewName (for JSX tags)
const subComponentMap: Record<string, string> = {
  // Fix broken closing tags from previous script (Popover.RootX → Popover.X)
  "Popover.RootTrigger": "Popover.Trigger",
  "Popover.RootContent": "Popover.Content",
  "Popover.RootBody": "Popover.Body",
  "Popover.RootArrow": "Popover.Arrow",
  "Popover.RootHeader": "Popover.Header",
  "Popover.RootCloseButton": "Popover.CloseTrigger",
  "Alert.RootDescription": "Alert.Description",
  "Alert.RootTitle": "Alert.Title",
  "Alert.RootIcon": "Alert.Indicator",
  "Alert.RootDialogOverlay": "AlertDialog.Backdrop",
  "Card.RootBody": "Card.Body",
  "Card.RootHeader": "Card.Header",
  "Card.RootFooter": "Card.Footer",
  "Menu.RootButton": "Menu.Trigger",
  "Menu.RootList": "Menu.Content",
  "Menu.RootItem": "Menu.Item",
  "Menu.RootDivider": "Menu.Separator",
  "Menu.RootGroup": "Menu.ItemGroup",
  "Tag.RootLabel": "Tag.Label",
  "Tag.RootCloseButton": "Tag.CloseTrigger",
  "Table.RootContainer": "Table.ScrollArea",
  "Table.RootCaption": "Table.Caption",
  "Tabs.RootList": "Tabs.List",
  "Tabs.RootPanels": "Tabs.ContentGroup",
  "Drawer.RootOverlay": "Drawer.Backdrop",
  "Drawer.RootContent": "Drawer.Content",
  "Drawer.RootHeader": "Drawer.Header",
  "Drawer.RootBody": "Drawer.Body",
  "Drawer.RootFooter": "Drawer.Footer",
  "Drawer.RootCloseButton": "Drawer.CloseTrigger",
  "Accordion.RootItem": "Accordion.Item",
  "Accordion.RootButton": "Accordion.ItemTrigger",
  "Accordion.RootPanel": "Accordion.ItemContent",
  "Accordion.RootIcon": "Accordion.ItemIndicator",
  "List.RootItem": "List.Item",
  "List.RootIcon": "List.Indicator",
  "Progress.RootLabel": "Progress.Label",
  "Checkbox.RootGroup": "Checkbox.Group",
  "Avatar.RootBadge": "Avatar.Badge",
  "Avatar.RootGroup": "Avatar.Group",
  "Tooltip.RootTrigger": "Tooltip.Trigger",
  "Tooltip.RootContent": "Tooltip.Content",

  // Old v2 compound component names → v3 namespace
  PopoverTrigger: "Popover.Trigger",
  PopoverContent: "Popover.Content",
  PopoverBody: "Popover.Body",
  PopoverArrow: "Popover.Arrow",
  PopoverHeader: "Popover.Header",
  PopoverCloseButton: "Popover.CloseTrigger",
  AlertDescription: "Alert.Description",
  AlertTitle: "Alert.Title",
  AlertIcon: "Alert.Indicator",
  AlertDialogOverlay: "AlertDialog.Backdrop",
  AlertDialogContent: "AlertDialog.Content",
  AlertDialogHeader: "AlertDialog.Header",
  AlertDialogBody: "AlertDialog.Body",
  AlertDialogFooter: "AlertDialog.Footer",
  AlertDialogCloseButton: "AlertDialog.CloseTrigger",
  CardBody: "Card.Body",
  CardHeader: "Card.Header",
  CardFooter: "Card.Footer",
  MenuButton: "Menu.Trigger",
  MenuList: "Menu.Content",
  MenuItem: "Menu.Item",
  MenuDivider: "Menu.Separator",
  MenuGroup: "Menu.ItemGroup",
  MenuItemOption: "Menu.ItemOption",
  TagLabel: "Tag.Label",
  TagCloseButton: "Tag.CloseTrigger",
  TableContainer: "Table.ScrollArea",
  TableCaption: "Table.Caption",
  Thead: "Table.Header",
  Tbody: "Table.Body",
  Tfoot: "Table.Footer",
  Tr: "Table.Row",
  Th: "Table.ColumnHeader",
  Td: "Table.Cell",
  TabList: "Tabs.List",
  Tab: "Tabs.Trigger",
  TabPanel: "Tabs.Content",
  TabPanels: "Tabs.ContentGroup",
  DrawerOverlay: "Drawer.Backdrop",
  DrawerContent: "Drawer.Content",
  DrawerHeader: "Drawer.Header",
  DrawerBody: "Drawer.Body",
  DrawerFooter: "Drawer.Footer",
  DrawerCloseButton: "Drawer.CloseTrigger",
  AccordionItem: "Accordion.Item",
  AccordionButton: "Accordion.ItemTrigger",
  AccordionPanel: "Accordion.ItemContent",
  AccordionIcon: "Accordion.ItemIndicator",
  ListItem: "List.Item",
  ListIcon: "List.Indicator",
  AvatarBadge: "Avatar.Badge",
  AvatarGroup: "Avatar.Group",
  ProgressLabel: "Progress.Label",
  CheckboxGroup: "Checkbox.Group",
  InputLeftElement: "InputElement",
  InputRightElement: "InputElement",
};

// Sort by length descending to match longer patterns first
const sortedEntries = Object.entries(subComponentMap).sort(
  (a, b) => b[0].length - a[0].length
);

let totalChanges = 0;
let filesChanged = 0;

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  for (const [oldName, newName] of sortedEntries) {
    // Fix JSX opening tags: <OldName → <NewName
    const openRegex = new RegExp(`<${escapeRegex(oldName)}(?=[\\s>\/])`, "g");
    content = content.replace(openRegex, `<${newName}`);

    // Fix JSX closing tags: </OldName> → </NewName>
    const closeRegex = new RegExp(`<\\/${escapeRegex(oldName)}>`, "g");
    content = content.replace(closeRegex, `</${newName}>`);
  }

  // Fix imports: remove old sub-component imports that are now namespaced
  // e.g., import { Popover, PopoverTrigger, PopoverContent } → import { Popover }
  // We need to remove the old sub-component names from import statements
  const importRegex =
    /import\s*\{([^}]+)\}\s*from\s*["']@chakra-ui\/react["']/g;
  content = content.replace(importRegex, (match, imports) => {
    const importList = imports
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const newImports = importList.filter((imp: string) => {
      // Remove old sub-component names that are now accessed via namespace
      return !subComponentMap[imp];
    });
    if (newImports.length === 0) return match; // Don't create empty imports
    if (newImports.length === importList.length) return match; // No changes
    return `import { ${newImports.join(", ")} } from "@chakra-ui/react"`;
  });

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

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

console.log("Fixing Chakra v3 sub-component names...\n");
const files = getFiles(srcDir);
for (const file of files) {
  processFile(file);
}
console.log(
  `\nDone! Changed ${filesChanged} files with ${totalChanges} line changes.`
);
