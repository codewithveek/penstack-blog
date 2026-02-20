// Chakra UI v2 -> v3 automated migration script
// Run: bun scripts/migrate-chakra-v3.ts

import * as fs from "fs";
import * as path from "path";

const SRC_DIR = path.resolve(__dirname, "../src");

// ===================== IMPORT REPLACEMENTS =====================
// These handle renaming imports from @chakra-ui/react

const IMPORT_RENAMES: Record<string, string> = {
  // Form
  FormControl: "Field",
  FormLabel: "Field",
  FormErrorMessage: "Field",
  FormHelperText: "Field",

  // Modal -> Dialog
  Modal: "Dialog",
  ModalOverlay: "Dialog",
  ModalContent: "Dialog",
  ModalHeader: "Dialog",
  ModalCloseButton: "Dialog",
  ModalBody: "Dialog",
  ModalFooter: "Dialog",

  // AlertDialog -> Dialog
  AlertDialog: "Dialog",
  AlertDialogOverlay: "Dialog",
  AlertDialogContent: "Dialog",
  AlertDialogHeader: "Dialog",
  AlertDialogBody: "Dialog",
  AlertDialogFooter: "Dialog",

  // Menu (keep Menu, remove sub-imports)
  MenuButton: "Menu",
  MenuList: "Menu",
  MenuItem: "Menu",
  MenuDivider: "Menu",
  MenuGroup: "Menu",

  // Tabs
  TabList: "Tabs",
  TabPanels: "Tabs",
  TabPanel: "Tabs",
  Tab: "Tabs",

  // Table
  TableContainer: "Table",
  Thead: "Table",
  Tbody: "Table",
  Tfoot: "Table",
  Tr: "Table",
  Th: "Table",
  Td: "Table",
  TableCaption: "Table",

  // Drawer -> Drawer (compound)
  DrawerOverlay: "Drawer",
  DrawerContent: "Drawer",
  DrawerCloseButton: "Drawer",
  DrawerHeader: "Drawer",
  DrawerBody: "Drawer",
  DrawerFooter: "Drawer",

  // Card
  CardHeader: "Card",
  CardBody: "Card",
  CardFooter: "Card",

  // Breadcrumb
  BreadcrumbItem: "Breadcrumb",
  BreadcrumbLink: "Breadcrumb",

  // List
  UnorderedList: "List",
  OrderedList: "List",
  ListIcon: "List",
  ListItem: "List",

  // Other renames
  Divider: "Separator",
  Collapse: "Collapsible",
  StackDivider: "Separator",

  // Input sub-components
  InputLeftElement: "InputElement",
  InputRightElement: "InputElement",
  InputLeftAddon: "InputAddon",
  InputRightAddon: "InputAddon",
  InputGroup: "Group",

  // Tag sub-components
  TagLabel: "Tag",
  TagCloseButton: "Tag",
  TagLeftIcon: "Tag",
  TagRightIcon: "Tag",

  // Radio
  Radio: "RadioGroup",
};

// Components that should be removed from @chakra-ui/react imports
// and imported from our color-mode helper instead
const COLOR_MODE_IMPORTS = [
  "useColorModeValue",
  "useColorMode",
  "DarkMode",
  "LightMode",
  "ColorModeScript",
];

const HOOKS_TO_REMOVE = ["useToast", "useDisclosure", "useOutsideClick"];

// Get all .tsx and .ts files recursively
function getFiles(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      results.push(...getFiles(fullPath));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function processFile(filePath: string): boolean {
  let content = fs.readFileSync(filePath, "utf-8");
  const original = content;

  // ===== 1. Fix @chakra-ui/react imports =====
  // Match import { ... } from "@chakra-ui/react" or '@chakra-ui/react'
  const chakraImportRegex =
    /import\s*\{([^}]+)\}\s*from\s*["']@chakra-ui\/react["'];?/g;

  let chakraImports: string[] = [];
  let colorModeImportsNeeded: string[] = [];
  let toasterNeeded = false;
  let useDisclosureNeeded = false;
  let useOutsideClickNeeded = false;
  let compoundParents = new Set<string>();
  let renamedImports: string[] = [];

  content = content.replace(chakraImportRegex, (match, importList: string) => {
    const imports = importList
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const kept: string[] = [];
    const addedCompounds = new Set<string>();

    for (const imp of imports) {
      // Check if it's a color mode import
      if (COLOR_MODE_IMPORTS.includes(imp)) {
        colorModeImportsNeeded.push(imp);
        continue;
      }

      // Check if it's useToast
      if (imp === "useToast") {
        toasterNeeded = true;
        continue;
      }

      // Check if it's useDisclosure
      if (imp === "useDisclosure") {
        useDisclosureNeeded = true;
        continue;
      }

      // Check if it's useOutsideClick
      if (imp === "useOutsideClick") {
        useOutsideClickNeeded = true;
        continue;
      }

      // Check if it should be renamed/grouped
      const newName = IMPORT_RENAMES[imp];
      if (newName) {
        if (!addedCompounds.has(newName)) {
          addedCompounds.add(newName);
          compoundParents.add(newName);
          kept.push(newName);
        }
        continue;
      }

      // Keep as-is (Box, Text, Button, etc.)
      // But rename some that changed
      if (imp === "Select") {
        kept.push("NativeSelect");
        continue;
      }
      if (imp === "AlertIcon") {
        // AlertIcon no longer exists, use Alert compound
        if (!addedCompounds.has("Alert")) {
          addedCompounds.add("Alert");
          kept.push("Alert");
        }
        continue;
      }
      if (imp === "Hide") {
        kept.push("Box"); // Will use responsive display prop
        continue;
      }

      kept.push(imp);
    }

    // Deduplicate
    const unique = [...new Set(kept)];
    if (unique.length === 0) return "";
    return `import { ${unique.join(", ")} } from "@chakra-ui/react";`;
  });

  // ===== 2. Add color-mode import if needed =====
  if (colorModeImportsNeeded.length > 0) {
    const unique = [...new Set(colorModeImportsNeeded)];
    const colorModeImport = `import { ${unique.join(", ")} } from "@/components/ui/color-mode";`;
    // Add after the last import or at top
    const lastImportIdx = content.lastIndexOf("\nimport ");
    if (lastImportIdx !== -1) {
      const endOfLine = content.indexOf("\n", lastImportIdx + 1);
      // Find the end of that import statement (could be multi-line)
      let insertIdx = endOfLine;
      // Handle multi-line imports
      let searchIdx = lastImportIdx + 1;
      while (searchIdx < content.length) {
        const lineEnd = content.indexOf("\n", searchIdx);
        if (lineEnd === -1) {
          insertIdx = content.length;
          break;
        }
        const line = content.substring(searchIdx, lineEnd);
        if (line.includes("from ") || line.trim().startsWith("}")) {
          insertIdx = lineEnd;
          if (line.includes("from ")) break;
        }
        searchIdx = lineEnd + 1;
      }
      content =
        content.slice(0, insertIdx + 1) +
        colorModeImport +
        "\n" +
        content.slice(insertIdx + 1);
    } else {
      content = colorModeImport + "\n" + content;
    }
  }

  // ===== 3. Add toaster import if needed =====
  if (toasterNeeded) {
    const toasterImport = `import { toaster } from "@/components/ui/toaster";`;
    const lastImportIdx = content.lastIndexOf("\nimport ");
    if (lastImportIdx !== -1) {
      const endOfLine = content.indexOf("\n", lastImportIdx + 1);
      let insertIdx = endOfLine;
      let searchIdx = lastImportIdx + 1;
      while (searchIdx < content.length) {
        const lineEnd = content.indexOf("\n", searchIdx);
        if (lineEnd === -1) {
          insertIdx = content.length;
          break;
        }
        const line = content.substring(searchIdx, lineEnd);
        if (line.includes("from ")) {
          insertIdx = lineEnd;
          break;
        }
        searchIdx = lineEnd + 1;
      }
      content =
        content.slice(0, insertIdx + 1) +
        toasterImport +
        "\n" +
        content.slice(insertIdx + 1);
    }
  }

  // ===== 4. JSX transformations =====

  // FormControl -> Field.Root
  content = content.replace(/<FormControl(\s)/g, "<Field.Root$1");
  content = content.replace(/<\/FormControl>/g, "</Field.Root>");
  content = content.replace(/isInvalid=/g, "invalid=");
  content = content.replace(/isRequired=/g, "required=");
  content = content.replace(/isDisabled=/g, "disabled=");
  content = content.replace(/isReadOnly=/g, "readOnly=");

  // FormLabel -> Field.Label
  content = content.replace(/<FormLabel(\s|>)/g, "<Field.Label$1");
  content = content.replace(/<\/FormLabel>/g, "</Field.Label>");

  // FormErrorMessage -> Field.ErrorText
  content = content.replace(/<FormErrorMessage(\s|>)/g, "<Field.ErrorText$1");
  content = content.replace(/<\/FormErrorMessage>/g, "</Field.ErrorText>");

  // FormHelperText -> Field.HelperText
  content = content.replace(/<FormHelperText(\s|>)/g, "<Field.HelperText$1");
  content = content.replace(/<\/FormHelperText>/g, "</Field.HelperText>");

  // Modal -> Dialog
  content = content.replace(/<Modal(\s)/g, "<Dialog.Root$1");
  content = content.replace(/<Modal>/g, "<Dialog.Root>");
  content = content.replace(/<\/Modal>/g, "</Dialog.Root>");
  content = content.replace(/isOpen=/g, "open=");
  content = content.replace(/onClose=/g, "onOpenChange=");
  content = content.replace(/<ModalOverlay\s*\/>/g, "<Dialog.Backdrop />");
  content = content.replace(/<ModalOverlay(\s)/g, "<Dialog.Backdrop$1");
  content = content.replace(/<\/ModalOverlay>/g, "</Dialog.Backdrop>");
  content = content.replace(
    /<ModalContent(\s|>)/g,
    "<Dialog.Positioner><Dialog.Content$1"
  );
  content = content.replace(
    /<\/ModalContent>/g,
    "</Dialog.Content></Dialog.Positioner>"
  );
  content = content.replace(/<ModalHeader(\s|>)/g, "<Dialog.Header$1");
  content = content.replace(/<\/ModalHeader>/g, "</Dialog.Header>");
  content = content.replace(
    /<ModalCloseButton\s*\/>/g,
    "<Dialog.CloseTrigger />"
  );
  content = content.replace(/<ModalBody(\s|>)/g, "<Dialog.Body$1");
  content = content.replace(/<\/ModalBody>/g, "</Dialog.Body>");
  content = content.replace(/<ModalFooter(\s|>)/g, "<Dialog.Footer$1");
  content = content.replace(/<\/ModalFooter>/g, "</Dialog.Footer>");

  // AlertDialog -> Dialog (same as Modal but with role="alertdialog")
  content = content.replace(
    /<AlertDialog(\s)/g,
    '<Dialog.Root role="alertdialog"$1'
  );
  content = content.replace(/<\/AlertDialog>/g, "</Dialog.Root>");
  content = content.replace(
    /<AlertDialogOverlay\s*\/>/g,
    "<Dialog.Backdrop />"
  );
  content = content.replace(
    /<AlertDialogContent(\s|>)/g,
    "<Dialog.Positioner><Dialog.Content$1"
  );
  content = content.replace(
    /<\/AlertDialogContent>/g,
    "</Dialog.Content></Dialog.Positioner>"
  );
  content = content.replace(/<AlertDialogHeader(\s|>)/g, "<Dialog.Header$1");
  content = content.replace(/<\/AlertDialogHeader>/g, "</Dialog.Header>");
  content = content.replace(/<AlertDialogBody(\s|>)/g, "<Dialog.Body$1");
  content = content.replace(/<\/AlertDialogBody>/g, "</Dialog.Body>");
  content = content.replace(/<AlertDialogFooter(\s|>)/g, "<Dialog.Footer$1");
  content = content.replace(/<\/AlertDialogFooter>/g, "</Dialog.Footer>");

  // Menu compound components
  content = content.replace(/<MenuButton(\s)/g, "<Menu.Trigger$1");
  content = content.replace(/<MenuButton>/g, "<Menu.Trigger>");
  content = content.replace(/<\/MenuButton>/g, "</Menu.Trigger>");
  content = content.replace(/<MenuList(\s|>)/g, "<Menu.Content$1");
  content = content.replace(/<\/MenuList>/g, "</Menu.Content>");
  content = content.replace(/<MenuItem(\s)/g, "<Menu.Item$1");
  content = content.replace(/<MenuItem>/g, "<Menu.Item>");
  content = content.replace(/<\/MenuItem>/g, "</Menu.Item>");
  content = content.replace(/<MenuDivider\s*\/>/g, "<Menu.Separator />");

  // Tabs compound components
  content = content.replace(/<TabList(\s|>)/g, "<Tabs.List$1");
  content = content.replace(/<\/TabList>/g, "</Tabs.List>");
  content = content.replace(/<Tab(\s|>)(?!s\.)/g, "<Tabs.Trigger$1");
  content = content.replace(/<\/Tab>(?!s)/g, "</Tabs.Trigger>");
  content = content.replace(/<TabPanels(\s|>)/g, "<Tabs.ContentGroup$1");
  content = content.replace(/<\/TabPanels>/g, "</Tabs.ContentGroup>");
  content = content.replace(/<TabPanel(\s|>)/g, "<Tabs.Content$1");
  content = content.replace(/<\/TabPanel>/g, "</Tabs.Content>");

  // Table compound components
  content = content.replace(/<TableContainer(\s|>)/g, "<Table.ScrollArea$1");
  content = content.replace(/<\/TableContainer>/g, "</Table.ScrollArea>");
  content = content.replace(/<Thead(\s|>)/g, "<Table.Header$1");
  content = content.replace(/<\/Thead>/g, "</Table.Header>");
  content = content.replace(/<Tbody(\s|>)/g, "<Table.Body$1");
  content = content.replace(/<\/Tbody>/g, "</Table.Body>");
  content = content.replace(/<Tfoot(\s|>)/g, "<Table.Footer$1");
  content = content.replace(/<\/Tfoot>/g, "</Table.Footer>");
  content = content.replace(/<Tr(\s|>)/g, "<Table.Row$1");
  content = content.replace(/<\/Tr>/g, "</Table.Row>");
  content = content.replace(/<Th(\s|>)/g, "<Table.ColumnHeader$1");
  content = content.replace(/<\/Th>/g, "</Table.ColumnHeader>");
  content = content.replace(/<Td(\s|>)/g, "<Table.Cell$1");
  content = content.replace(/<\/Td>/g, "</Table.Cell>");

  // Drawer compound components
  content = content.replace(/<DrawerOverlay\s*\/>/g, "<Drawer.Backdrop />");
  content = content.replace(/<DrawerOverlay(\s)/g, "<Drawer.Backdrop$1");
  content = content.replace(/<\/DrawerOverlay>/g, "</Drawer.Backdrop>");
  content = content.replace(/<DrawerContent(\s|>)/g, "<Drawer.Content$1");
  content = content.replace(/<\/DrawerContent>/g, "</Drawer.Content>");
  content = content.replace(
    /<DrawerCloseButton\s*\/>/g,
    "<Drawer.CloseTrigger />"
  );
  content = content.replace(/<DrawerHeader(\s|>)/g, "<Drawer.Header$1");
  content = content.replace(/<\/DrawerHeader>/g, "</Drawer.Header>");
  content = content.replace(/<DrawerBody(\s|>)/g, "<Drawer.Body$1");
  content = content.replace(/<\/DrawerBody>/g, "</Drawer.Body>");
  content = content.replace(/<DrawerFooter(\s|>)/g, "<Drawer.Footer$1");
  content = content.replace(/<\/DrawerFooter>/g, "</Drawer.Footer>");

  // Card compound components
  content = content.replace(/<CardHeader(\s|>)/g, "<Card.Header$1");
  content = content.replace(/<\/CardHeader>/g, "</Card.Header>");
  content = content.replace(/<CardBody(\s|>)/g, "<Card.Body$1");
  content = content.replace(/<\/CardBody>/g, "</Card.Body>");
  content = content.replace(/<CardFooter(\s|>)/g, "<Card.Footer$1");
  content = content.replace(/<\/CardFooter>/g, "</Card.Footer>");

  // Breadcrumb compound components
  content = content.replace(/<Breadcrumb(\s)(?!\.)/g, "<Breadcrumb.Root$1");
  content = content.replace(/<Breadcrumb>(?!\.)/g, "<Breadcrumb.Root>");
  content = content.replace(/<\/Breadcrumb>(?!\.)/g, "</Breadcrumb.Root>");
  content = content.replace(/<BreadcrumbItem(\s|>)/g, "<Breadcrumb.Item$1");
  content = content.replace(/<\/BreadcrumbItem>/g, "</Breadcrumb.Item>");
  content = content.replace(/<BreadcrumbLink(\s|>)/g, "<Breadcrumb.Link$1");
  content = content.replace(/<\/BreadcrumbLink>/g, "</Breadcrumb.Link>");

  // List compound components
  content = content.replace(/<UnorderedList(\s|>)/g, "<List.Root$1");
  content = content.replace(/<\/UnorderedList>/g, "</List.Root>");
  content = content.replace(/<OrderedList(\s|>)/g, '<List.Root as="ol"$1');
  content = content.replace(/<\/OrderedList>/g, "</List.Root>");
  content = content.replace(/<ListItem(\s|>)/g, "<List.Item$1");
  content = content.replace(/<\/ListItem>/g, "</List.Item>");
  content = content.replace(/<ListIcon(\s)/g, "<List.Indicator$1");
  content = content.replace(/<ListIcon>/g, "<List.Indicator>");

  // Divider -> Separator
  content = content.replace(/<Divider(\s|\/)/g, "<Separator$1");
  content = content.replace(/<\/Divider>/g, "</Separator>");

  // StackDivider -> Separator
  content = content.replace(/<StackDivider(\s|\/)/g, "<Separator$1");
  content = content.replace(/<\/StackDivider>/g, "</Separator>");
  content = content.replace(
    /divider={<Separator\s*\/>}/g,
    "separator={<Separator />}"
  );
  content = content.replace(
    /divider={<StackDivider\s*\/>}/g,
    "separator={<Separator />}"
  );

  // Tag compound components
  content = content.replace(/<TagLabel(\s|>)/g, "<Tag.Label$1");
  content = content.replace(/<\/TagLabel>/g, "</Tag.Label>");
  content = content.replace(/<TagCloseButton\s*\/>/g, "<Tag.CloseTrigger />");
  content = content.replace(/<TagRightIcon(\s)/g, "<Tag.EndElement$1");
  content = content.replace(/<\/TagRightIcon>/g, "</Tag.EndElement>");
  content = content.replace(/<TagLeftIcon(\s)/g, "<Tag.StartElement$1");
  content = content.replace(/<\/TagLeftIcon>/g, "</Tag.StartElement>");

  // Radio compound components
  content = content.replace(/<RadioGroup(\s)/g, "<RadioGroup.Root$1");
  content = content.replace(/<\/RadioGroup>/g, "</RadioGroup.Root>");
  content = content.replace(/<Radio(\s)(?!Group)/g, "<RadioGroup.Item$1");
  content = content.replace(/<\/Radio>(?!Group)/g, "</RadioGroup.Item>");

  // Input sub-components
  content = content.replace(/<InputGroup(\s|>)/g, "<Group$1");
  content = content.replace(/<\/InputGroup>/g, "</Group>");
  content = content.replace(
    /<InputLeftElement(\s|>)/g,
    '<InputElement placement="start"$1'
  );
  content = content.replace(/<\/InputLeftElement>/g, "</InputElement>");
  content = content.replace(
    /<InputRightElement(\s|>)/g,
    '<InputElement placement="end"$1'
  );
  content = content.replace(/<\/InputRightElement>/g, "</InputElement>");
  content = content.replace(
    /<InputLeftAddon(\s|>)/g,
    '<InputAddon placement="start"$1'
  );
  content = content.replace(/<\/InputLeftAddon>/g, "</InputAddon>");
  content = content.replace(
    /<InputRightAddon(\s|>)/g,
    '<InputAddon placement="end"$1'
  );
  content = content.replace(/<\/InputRightAddon>/g, "</InputAddon>");

  // Select -> NativeSelect
  // Only if we see <Select> (not <Select.Root etc.)
  // This is tricky - only rename if it's a simple select, not already compound
  content = content.replace(/<Select(\s)(?!\.)/g, "<NativeSelect.Root$1");
  content = content.replace(/<Select>(?!\.)/g, "<NativeSelect.Root>");
  content = content.replace(/<\/Select>(?!\.)/g, "</NativeSelect.Root>");

  // Collapse -> Collapsible
  content = content.replace(/<Collapse(\s)/g, "<Collapsible.Root$1");
  content = content.replace(/<\/Collapse>/g, "</Collapsible.Root>");
  content = content.replace(/in={/g, "open={");

  // Hide -> Box with responsive display
  content = content.replace(/<Hide(\s)/g, "<Box display={{ base: 'none' }}$1");
  content = content.replace(/<\/Hide>/g, "</Box>");

  // AlertIcon -> Alert.Indicator
  content = content.replace(/<AlertIcon\s*\/>/g, "<Alert.Indicator />");

  // ===== 5. Prop renames =====
  content = content.replace(/colorScheme=/g, "colorPalette=");
  content = content.replace(/\bspacing=/g, "gap=");
  content = content.replace(/\bspacing\b(?=\s*=\s*\{)/g, "gap");

  // useToast -> toaster
  if (toasterNeeded) {
    // Replace useToast() call with nothing (we use toaster directly)
    content = content.replace(/const\s+toast\s*=\s*useToast\([^)]*\);?/g, "");
    // Replace toast({ ... }) with toaster.create({ ... })
    content = content.replace(/\btoast\(\{/g, "toaster.create({");
    // Replace toast.promise with toaster.promise
    content = content.replace(/\btoast\.promise/g, "toaster.promise");
    // Remove isClosable (v3 default)
    content = content.replace(/,?\s*isClosable:\s*true/g, "");
  }

  // useDisclosure -> useState
  if (useDisclosureNeeded) {
    content = content.replace(
      /const\s*\{\s*isOpen\s*,\s*onOpen\s*,\s*onClose\s*\}\s*=\s*useDisclosure\(\);?/g,
      "const [isOpen, setIsOpen] = React.useState(false);\n  const onOpen = () => setIsOpen(true);\n  const onClose = () => setIsOpen(false);"
    );
    // Make sure React is imported if useState is used
    if (
      !content.includes("import React") &&
      !content.includes("import * as React")
    ) {
      if (content.includes('from "react"')) {
        // React is already imported somehow
      } else {
        content = 'import React from "react";\n' + content;
      }
    }
  }

  // ===== 6. Boolean prop renames (careful not to double-replace) =====
  // isOpen -> open (already handled by Modal transformation)
  // isLoading -> loading
  content = content.replace(/isLoading=/g, "loading=");
  content = content.replace(/isLoading\b(?!\s*[:=])/g, "loading");

  // Clean up any empty import lines
  content = content.replace(
    /import\s*\{\s*\}\s*from\s*["'][^"']+["'];?\n?/g,
    ""
  );

  // Clean up duplicate imports from same module
  // Deduplicate @chakra-ui/react imports
  const allChakraImports: string[] = [];
  content = content.replace(
    /import\s*\{([^}]+)\}\s*from\s*["']@chakra-ui\/react["'];?/g,
    (match, importList) => {
      const imports = importList
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      allChakraImports.push(...imports);
      return ""; // Remove, will re-add
    }
  );
  if (allChakraImports.length > 0) {
    const unique = [...new Set(allChakraImports)];
    const newImport = `import { ${unique.join(", ")} } from "@chakra-ui/react";`;
    // Insert after "use client" or at top
    const useClientIdx = content.indexOf('"use client"');
    if (useClientIdx !== -1) {
      const endOfLine = content.indexOf("\n", useClientIdx);
      content =
        content.slice(0, endOfLine + 1) +
        "\n" +
        newImport +
        "\n" +
        content.slice(endOfLine + 1);
    } else {
      content = newImport + "\n" + content;
    }
  }

  // Clean up excessive blank lines
  content = content.replace(/\n{3,}/g, "\n\n");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  }
  return false;
}

// Main
const files = getFiles(SRC_DIR);
let modified = 0;
const modifiedFiles: string[] = [];

for (const file of files) {
  try {
    if (processFile(file)) {
      modified++;
      modifiedFiles.push(path.relative(SRC_DIR, file));
    }
  } catch (e) {
    console.error(`Error processing ${file}:`, e);
  }
}

console.log(`\nModified ${modified} files:`);
modifiedFiles.forEach((f) => console.log(`  ${f}`));
