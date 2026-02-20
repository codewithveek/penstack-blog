/**
 * Re-apply SAFE Chakra v3 migrations to restored files.
 * This script only processes the 12 files that were restored from git HEAD.
 * It applies ALL safe transforms but NOT the broken leftIcon/rightIcon/icon regex.
 */

import * as fs from "fs";
import * as path from "path";

const srcDir = path.join(__dirname, "..", "src");

const targetFiles = [
  "src/components/Dashboard/Header/UserMenu.tsx",
  "src/components/Dashboard/Medias/MediaCard.tsx",
  "src/components/Dashboard/UserInfoComp/index.tsx",
  "src/components/Header/index.tsx",
  "src/components/LightDarkModeSwitch/index.tsx",
  "src/components/pages/Dashboard/AllPosts/index.tsx",
  "src/components/pages/Dashboard/Taxonomies/FilteredList/index.tsx",
  "src/components/pages/Dashboard/Users/index.tsx",
  "src/components/TipTapEditor/Sidebar/components/ImageCard.tsx",
  "src/components/TipTapEditor/Sidebar/components/VisibilityItem.tsx",
  "src/lib/editor/nodes/MiniPostCard/MiniPostCardButton.tsx",
  "src/themes/raised-land/NewPostCard/index.tsx",
].map((f) => path.join(__dirname, "..", f));

// Sub-component map (from both scripts)
const subComponentMap: Record<string, string> = {
  // Old v2 compound names → v3 namespace
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

// Sort by length descending
const sortedEntries = Object.entries(subComponentMap).sort(
  (a, b) => b[0].length - a[0].length
);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let totalChanges = 0;
let filesChanged = 0;

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // === IMPORT CHANGES ===

  // Replace useToast import + usage
  if (content.includes("useToast")) {
    content = content.replace(
      /import\s*\{([^}]*)\buse[Tt]oast\b([^}]*)\}\s*from\s*["']@chakra-ui\/react["']/g,
      (match, before, after) => {
        const remaining = (before + after)
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        const chakraImport =
          remaining.length > 0
            ? `import { ${remaining.join(", ")} } from "@chakra-ui/react"`
            : "";
        const toasterImport = `import { toaster } from "@/components/ui/toaster"`;
        return [chakraImport, toasterImport].filter(Boolean).join(";\n");
      }
    );
    // Replace toast() calls with toaster.create()
    content = content.replace(
      /const\s+toast\s*=\s*useToast\(\s*\)/g,
      "// toaster imported from @/components/ui/toaster"
    );
    content = content.replace(/\btoast\(\{/g, "toaster.create({");
    content = content.replace(/\btoast\.promise/g, "toaster.promise");
    content = content.replace(/\btoast\.close/g, "toaster.dismiss");
  }

  // Replace useColorMode/useColorModeValue imports
  content = content.replace(
    /import\s*\{([^}]*)\b(useColorMode|useColorModeValue)\b([^}]*)\}\s*from\s*["']@chakra-ui\/react["']/g,
    (match, before, colorModeImport, after) => {
      const allImports = (before + colorModeImport + after)
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const colorModeImports = allImports.filter(
        (i: string) => i === "useColorMode" || i === "useColorModeValue" || i === "LightMode" || i === "DarkMode"
      );
      const chakraImports = allImports.filter(
        (i: string) => !colorModeImports.includes(i)
      );
      const parts: string[] = [];
      if (chakraImports.length > 0) {
        parts.push(
          `import { ${chakraImports.join(", ")} } from "@chakra-ui/react"`
        );
      }
      if (colorModeImports.length > 0) {
        parts.push(
          `import { ${colorModeImports.join(", ")} } from "@/components/ui/color-mode"`
        );
      }
      return parts.join(";\n");
    }
  );

  // Replace old icon imports
  content = content.replace(
    /import\s*\{[^}]*\}\s*from\s*["']@chakra-ui\/icons["']/g,
    ""
  );

  // === V2 → V3 COMPONENT RENAMES (import-level) ===

  // FormControl → Field, FormLabel → Field.Label, FormHelperText → Field.HelperText, FormErrorMessage → Field.ErrorText
  content = content.replace(/\bFormControl\b/g, "Field.Root");
  content = content.replace(/\bFormLabel\b/g, "Field.Label");
  content = content.replace(/\bFormHelperText\b/g, "Field.HelperText");
  content = content.replace(/\bFormErrorMessage\b/g, "Field.ErrorText");

  // Modal* → Dialog.*
  content = content.replace(/\bModalOverlay\b/g, "Dialog.Backdrop");
  content = content.replace(/\bModalContent\b/g, "Dialog.Content");
  content = content.replace(/\bModalHeader\b/g, "Dialog.Header");
  content = content.replace(/\bModalBody\b/g, "Dialog.Body");
  content = content.replace(/\bModalFooter\b/g, "Dialog.Footer");
  content = content.replace(/\bModalCloseButton\b/g, "Dialog.CloseTrigger");
  content = content.replace(/\bModal\b(?!\.)/g, "Dialog");

  // === JSX TAG RENAMES (namespace components) ===

  // Sub-component JSX tags FIRST (before base components, to avoid partial matches)
  for (const [oldName, newName] of sortedEntries) {
    const openRegex = new RegExp(
      `<${escapeRegex(oldName)}(?=[\\s>\/])`,
      "g"
    );
    content = content.replace(openRegex, `<${newName}`);

    const closeRegex = new RegExp(`<\\/${escapeRegex(oldName)}>`, "g");
    content = content.replace(closeRegex, `</${newName}>`);
  }

  // Base components become .Root (AFTER sub-components are handled)
  for (const comp of ["Card", "Alert", "Menu", "Avatar", "Switch", "Checkbox", "Tooltip", "Tag", "Table", "Tabs", "Progress", "Drawer", "List", "Popover", "Accordion"]) {
    content = content.replace(
      new RegExp(`<${comp}(?=[\\s>\/])(?!\\.)`, "g"),
      `<${comp}.Root`
    );
    // For closing tags, require > immediately after name to avoid matching sub-components
    content = content.replace(
      new RegExp(`<\\/${comp}>`, "g"),
      `</${comp}.Root>`
    );
  }

  // Remove sub-component names from imports
  const importRegex =
    /import\s*\{([^}]+)\}\s*from\s*["']@chakra-ui\/react["']/g;
  content = content.replace(importRegex, (match, imports) => {
    const importList = imports
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    const newImports = importList.filter((imp: string) => {
      return !subComponentMap[imp];
    });
    if (newImports.length === 0) return match;
    if (newImports.length === importList.length) return match;
    return `import { ${newImports.join(", ")} } from "@chakra-ui/react"`;
  });

  // === PROP RENAMES ===
  content = content.replace(/\bcolorScheme=/g, "colorPalette=");
  content = content.replace(/\bspacing=/g, "gap=");
  content = content.replace(/\bspacing=\{/g, "gap={");
  content = content.replace(/\bisOpen\b(?=\s*[=}])/g, "open");
  content = content.replace(/\bonClose\b(?=\s*[=}])/g, "onOpenChange");
  content = content.replace(/\bisRequired\b/g, "required");
  content = content.replace(/\bisInvalid\b/g, "invalid");
  content = content.replace(/\bisDisabled\b/g, "disabled");
  content = content.replace(/\bisLoading\b/g, "loading");
  content = content.replace(/\bisChecked\b/g, "checked");
  content = content.replace(/\bisTruncated\b/g, "truncate");
  content = content.replace(/\bisReadOnly\b/g, "readOnly");
  content = content.replace(/\bnoOfLines=/g, "lineClamp=");

  // Fix toaster status → type
  content = content.replace(
    /(toaster\.create\(\{[^}]*?)\bstatus:/g,
    "$1type:"
  );

  // Fix Tooltip label → content
  content = content.replace(
    /<Tooltip\.Root(\s+)label=/g,
    "<Tooltip.Root$1content="
  );

  // Fix animateOpacity (removed in v3)
  content = content.replace(/\s+animateOpacity/g, "");

  // Fix useDisclosure references - add useState import and pattern
  if (content.includes("useDisclosure")) {
    // Replace useDisclosure import from chakra
    content = content.replace(/\buseDisclosure\b,?\s*/g, "");
    // Add useState to react import if not present
    if (!content.includes("useState")) {
      content = content.replace(
        /import\s*\{([^}]+)\}\s*from\s*["']react["']/,
        (match, imports) => {
          return `import { ${imports.trim()}, useState } from "react"`;
        }
      );
    }
    // Replace useDisclosure() calls
    content = content.replace(
      /const\s*\{\s*isOpen\s*,\s*onOpen\s*,\s*onClose\s*\}\s*=\s*useDisclosure\(\)/g,
      "const [open, setOpen] = useState(false)"
    );
    content = content.replace(
      /const\s*\{\s*isOpen\s*,\s*onClose\s*,\s*onOpen\s*\}\s*=\s*useDisclosure\(\)/g,
      "const [open, setOpen] = useState(false)"
    );
    // Fix onOpen() → setOpen(true)
    content = content.replace(/\bonOpen\(\)/g, "setOpen(true)");
    content = content.replace(/\bonClose\(\)/g, "setOpen(false)");
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    filesChanged++;
    totalChanges++;
    console.log(`Fixed: ${path.relative(path.join(__dirname, ".."), filePath)}`);
  }
}

console.log("Re-applying safe Chakra v3 migrations to restored files...\n");
for (const file of targetFiles) {
  if (fs.existsSync(file)) {
    processFile(file);
  } else {
    console.log(`File not found: ${file}`);
  }
}
console.log(`\nDone! Fixed ${filesChanged} files.`);
