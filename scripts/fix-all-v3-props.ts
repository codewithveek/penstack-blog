/**
 * Fix all remaining Chakra v3 prop issues:
 * 1. leftIcon/rightIcon on Button -> children
 * 2. icon on IconButton -> children
 * 3. as={Component} -> asChild pattern
 * 4. Icon as={Component} -> direct rendering
 * 5. Menu.Item icon prop -> children
 */

import * as fs from "fs";
import * as path from "path";

const SRC = path.resolve(__dirname, "..", "src");

// Utility: extract brace-balanced content starting from a { at position idx
function extractBraceContent(
  str: string,
  startIdx: number
): { content: string; endIdx: number } | null {
  if (str[startIdx] !== "{") return null;
  let depth = 0;
  let i = startIdx;
  while (i < str.length) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) {
        return {
          content: str.slice(startIdx + 1, i),
          endIdx: i,
        };
      }
    }
    i++;
  }
  return null;
}

// Find and remove a JSX prop, returning its value (brace-balanced)
function removeProp(
  line: string,
  propName: string
): { newLine: string; value: string } | null {
  const propPattern = new RegExp(`\\b${propName}=`);
  const match = propPattern.exec(line);
  if (!match) return null;

  const propStart = match.index;
  const afterEquals = propStart + match[0].length;

  if (line[afterEquals] === "{") {
    const result = extractBraceContent(line, afterEquals);
    if (!result) return null;
    const value = result.content;
    const propEnd = result.endIdx + 1;
    // Remove prop and any trailing/leading whitespace
    let newLine = line.slice(0, propStart) + line.slice(propEnd);
    // Clean up double spaces
    newLine = newLine.replace(/  +/g, " ").replace(/ +>/g, ">");
    return { newLine, value };
  } else if (line[afterEquals] === '"') {
    const end = line.indexOf('"', afterEquals + 1);
    if (end === -1) return null;
    const value = line.slice(afterEquals + 1, end);
    const propEnd = end + 1;
    let newLine = line.slice(0, propStart) + line.slice(propEnd);
    newLine = newLine.replace(/  +/g, " ");
    return { newLine, value };
  }
  return null;
}

// Process a file's content for leftIcon/rightIcon on Button
function fixLeftRightIcon(content: string): string {
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check for leftIcon or rightIcon on a single line
    if (/\bleftIcon=\{/.test(line) || /\brightIcon=\{/.test(line)) {
      // Check if the prop is on a single line (brace balanced)
      const isLeftIcon = /\bleftIcon=\{/.test(line);
      const propName = isLeftIcon ? "leftIcon" : "rightIcon";

      // Try single-line extraction first
      const result = removeProp(line, propName);
      if (result) {
        lines[i] = result.newLine;
        const iconJsx = result.value.trim();

        // Find the children - look for closing tag or self-closing
        // Walk forward to find the Button's content
        if (isLeftIcon) {
          // Need to prepend icon to children
          // Find the > that closes the opening tag props
          let found = false;
          for (let j = i; j < Math.min(i + 20, lines.length); j++) {
            if (lines[j].includes(">") && !lines[j].includes("/>")) {
              // Check if this line ends with > (closing the opening tag)
              const trimmed = lines[j].trim();
              if (
                trimmed.endsWith(">") &&
                !trimmed.endsWith("/>") &&
                !trimmed.startsWith("</") &&
                !trimmed.startsWith("//")
              ) {
                // Add icon before the next line's content
                const indent =
                  lines[j + 1]?.match(/^(\s*)/)?.[1] || "              ";
                lines.splice(j + 1, 0, `${indent}{${iconJsx}} `);
                found = true;
                break;
              }
            }
          }
        } else {
          // rightIcon - need to append icon after children, before closing tag
          // Find </Button> or </Menu.Trigger>
          for (let j = i; j < Math.min(i + 20, lines.length); j++) {
            if (
              /^\s*<\/Button>/.test(lines[j]) ||
              /^\s*<\/Menu\.Trigger>/.test(lines[j])
            ) {
              const indent = lines[j].match(/^(\s*)/)?.[1] || "              ";
              lines.splice(j, 0, `${indent}  {${iconJsx}}`);
              break;
            }
          }
        }
        continue;
      } else {
        // Multi-line prop value - handle by joining lines
        const propMatch = line.match(new RegExp(`\\b${propName}=\\{`));
        if (propMatch) {
          const propStart = propMatch.index!;
          const braceStart = propStart + propMatch[0].length - 1;

          // Join lines until we balance braces
          let depth = 0;
          let joined = "";
          let endLineIdx = i;

          for (let j = i; j < lines.length; j++) {
            const startChar = j === i ? braceStart : 0;
            for (let k = startChar; k < lines[j].length; k++) {
              if (lines[j][k] === "{") depth++;
              else if (lines[j][k] === "}") {
                depth--;
                if (depth === 0) {
                  // Found the end
                  const value = lines.slice(i, j + 1).join("\n");
                  const fullMatch = value.slice(
                    value.indexOf(`${propName}={`) + `${propName}={`.length
                  );
                  const iconJsx = fullMatch
                    .slice(0, fullMatch.lastIndexOf("}"))
                    .trim();

                  // Remove the prop lines
                  const beforeProp = lines[i].slice(0, propStart).trimEnd();
                  const afterProp = lines[j].slice(k + 1);

                  if (beforeProp.trim() === "" && afterProp.trim() === "") {
                    // Entire lines are the prop
                    lines.splice(i, j - i + 1);
                  } else {
                    lines[i] = beforeProp;
                    if (j > i) {
                      lines.splice(i + 1, j - i);
                    }
                    if (afterProp.trim()) {
                      lines[i] += " " + afterProp.trim();
                    }
                  }

                  // Now add the icon as children
                  if (isLeftIcon) {
                    for (let m = i; m < Math.min(i + 20, lines.length); m++) {
                      const trimmed = lines[m].trim();
                      if (
                        trimmed.endsWith(">") &&
                        !trimmed.endsWith("/>") &&
                        !trimmed.startsWith("</") &&
                        !trimmed.startsWith("//")
                      ) {
                        const indent =
                          lines[m + 1]?.match(/^(\s*)/)?.[1] ||
                          "              ";
                        lines.splice(m + 1, 0, `${indent}{${iconJsx}}`);
                        break;
                      }
                    }
                  } else {
                    for (let m = i; m < Math.min(i + 20, lines.length); m++) {
                      if (
                        /^\s*<\/Button>/.test(lines[m]) ||
                        /^\s*<\/Menu\.Trigger>/.test(lines[m])
                      ) {
                        const indent =
                          lines[m].match(/^(\s*)/)?.[1] || "              ";
                        lines.splice(m, 0, `${indent}  {${iconJsx}}`);
                        break;
                      }
                    }
                  }

                  endLineIdx = j;
                  break;
                }
              }
            }
            if (depth === 0) break;
          }
        }
      }
    }
    i++;
  }

  return lines.join("\n");
}

// Fix icon= on IconButton (convert from self-closing to children pattern)
function fixIconButtonIcon(content: string): string {
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check for icon= prop (but not leftIcon/rightIcon)
    if (/(?<!left|right)\bicon=\{/.test(line)) {
      // Make sure we're inside an IconButton context
      // Look backwards for <IconButton
      let isIconButton = false;
      for (let j = i; j >= Math.max(0, i - 10); j--) {
        if (
          /\bIconButton\b/.test(lines[j]) &&
          !/<\/IconButton/.test(lines[j])
        ) {
          isIconButton = true;
          break;
        }
      }
      // Also check if icon is on same line as IconButton
      if (/\bIconButton\b/.test(line)) isIconButton = true;

      // Also check for Menu.Item with icon
      let isMenuItem = false;
      for (let j = i; j >= Math.max(0, i - 5); j--) {
        if (/Menu\.Item\b/.test(lines[j])) {
          isMenuItem = true;
          break;
        }
      }

      if (!isIconButton && !isMenuItem) {
        i++;
        continue;
      }

      // Extract icon value
      const result = removeProp(line, "icon");
      if (result) {
        lines[i] = result.newLine;
        const iconJsx = result.value.trim();

        if (isIconButton) {
          // Find the self-closing /> and convert to >{icon}</IconButton>
          for (let j = i; j < Math.min(i + 10, lines.length); j++) {
            if (/\/>/.test(lines[j])) {
              lines[j] = lines[j].replace("/>", `>{${iconJsx}}</IconButton>`);
              break;
            }
          }
        } else if (isMenuItem) {
          // For Menu.Item, add icon as first child
          for (let j = i; j < Math.min(i + 10, lines.length); j++) {
            if (lines[j].includes(">") && !lines[j].includes("/>")) {
              const trimmed = lines[j].trim();
              if (trimmed.endsWith(">") && !trimmed.startsWith("</")) {
                const indent =
                  lines[j + 1]?.match(/^(\s*)/)?.[1] || "            ";
                lines.splice(j + 1, 0, `${indent}{${iconJsx}}`);
                break;
              }
            }
          }
        }
      } else {
        // Multi-line icon prop
        const propMatch = line.match(/(?<!left|right)\bicon=\{/);
        if (propMatch) {
          const propStart = propMatch.index!;
          const braceStart = propStart + propMatch[0].length - 1;
          let depth = 0;

          for (let j = i; j < lines.length; j++) {
            const startChar = j === i ? braceStart : 0;
            for (let k = startChar; k < lines[j].length; k++) {
              if (lines[j][k] === "{") depth++;
              else if (lines[j][k] === "}") {
                depth--;
                if (depth === 0) {
                  const fullLines = lines.slice(i, j + 1).join("\n");
                  const iconStartIdx =
                    fullLines.indexOf("icon={") + "icon={".length;
                  const iconContent = fullLines.slice(iconStartIdx);
                  const iconJsx = iconContent
                    .slice(0, iconContent.lastIndexOf("}"))
                    .trim();

                  // Remove prop lines
                  const beforeProp = lines[i].slice(0, propStart).trimEnd();
                  const afterProp = lines[j].slice(k + 1);

                  if (beforeProp.trim() === "" && afterProp.trim() === "") {
                    lines.splice(i, j - i + 1);
                  } else {
                    lines[i] = beforeProp;
                    if (j > i) lines.splice(i + 1, j - i);
                    if (afterProp.trim()) lines[i] += " " + afterProp.trim();
                  }

                  // Find /> and convert
                  if (isIconButton) {
                    for (let m = i; m < Math.min(i + 10, lines.length); m++) {
                      if (/\/>/.test(lines[m])) {
                        lines[m] = lines[m].replace(
                          "/>",
                          `>{${iconJsx}}</IconButton>`
                        );
                        break;
                      }
                    }
                  }
                  break;
                }
              }
            }
            if (depth === 0) break;
          }
        }
      }
    }
    i++;
  }

  return lines.join("\n");
}

// Fix <Icon as={Component} .../> -> <Component .../>
function fixIconAs(content: string): string {
  // Simple case: <Icon as={LuSomething} /> -> <LuSomething />
  // With other props: <Icon as={LuSomething} size={20} /> -> <LuSomething size={20} />

  // Single-line pattern
  content = content.replace(
    /<Icon\s+as=\{(\w+)\}\s*((?:[^/](?!\/>))*?)\s*\/>/g,
    (match, component, restProps) => {
      const props = restProps.trim();
      return props ? `<${component} ${props} />` : `<${component} />`;
    }
  );

  // Multi-line Icon as= pattern
  const lines = content.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/<Icon\s+as=\{/.test(line) || /<Icon$/.test(line.trim())) {
      // Check next line for as=
      if (/<Icon\s+as=\{(\w+)\}/.test(line)) {
        const match = line.match(/<Icon\s+as=\{(\w+)\}/);
        if (match) {
          const component = match[1];
          lines[i] = line.replace(/<Icon\s+as=\{\w+\}/, `<${component}`);
        }
      } else if (
        /<Icon$/.test(line.trim()) &&
        i + 1 < lines.length &&
        /\s*as=\{/.test(lines[i + 1])
      ) {
        const asMatch = lines[i + 1].match(/\s*as=\{(\w+)\}/);
        if (asMatch) {
          const component = asMatch[1];
          lines[i] = line.replace(/<Icon/, `<${component}`);
          lines.splice(i + 1, 1); // Remove the as= line
          continue;
        }
      }
    }
    i++;
  }

  return lines.join("\n");
}

// Fix as={Button} on Menu.Trigger -> asChild with nested Button
function fixMenuTriggerAsButton(content: string): string {
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Look for Menu.Trigger with as={Button}
    if (/Menu\.Trigger/.test(line) && /as=\{Button\}/.test(line)) {
      // Remove as={Button} and replace with asChild
      lines[i] = line
        .replace(/\s*as=\{Button\}/, "")
        .replace(/Menu\.Trigger/, "Menu.Trigger asChild");

      // Collect all props from Menu.Trigger to move to Button
      // Find the end of Menu.Trigger opening tag
      let tagEndLine = i;
      let depth = 0;
      for (let j = i; j < lines.length; j++) {
        for (const ch of lines[j]) {
          if (ch === "<") depth++;
        }
        if (lines[j].includes(">") && !lines[j].includes("/>")) {
          tagEndLine = j;
          break;
        }
      }

      // Extract props between <Menu.Trigger asChild and >
      // We need to wrap children in <Button ...props>...</Button>
      // Collect props from Menu.Trigger lines
      const propsLines: string[] = [];
      for (let j = i; j <= tagEndLine; j++) {
        propsLines.push(lines[j]);
      }
      const propsText = propsLines.join(" ");

      // Extract individual props from Menu.Trigger
      const triggerPropsMatch = propsText.match(
        /<Menu\.Trigger\s+asChild\s*([\s\S]*?)>/
      );
      const triggerProps = triggerPropsMatch ? triggerPropsMatch[1].trim() : "";

      // Rewrite: <Menu.Trigger asChild>\n<Button ...props>
      const indent = lines[i].match(/^(\s*)/)?.[1] || "";
      lines[i] = `${indent}<Menu.Trigger asChild>`;

      // Remove old prop lines
      if (tagEndLine > i) {
        lines.splice(i + 1, tagEndLine - i);
      }

      // Insert <Button with props> after Menu.Trigger
      lines.splice(i + 1, 0, `${indent}  <Button ${triggerProps}>`);

      // Find matching </Menu.Trigger> and insert </Button> before it
      for (let j = i + 2; j < lines.length; j++) {
        if (/^\s*<\/Menu\.Trigger>/.test(lines[j])) {
          lines.splice(j, 0, `${indent}  </Button>`);
          break;
        }
      }
    }
    // Handle as={Button} on a different line from Menu.Trigger
    else if (/Menu\.Trigger/.test(line) && !/<\/Menu\.Trigger>/.test(line)) {
      // Check next few lines for as={Button}
      let hasAsButton = false;
      let asButtonLine = -1;
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        if (/\bas=\{Button\}/.test(lines[j])) {
          hasAsButton = true;
          asButtonLine = j;
          break;
        }
        if (lines[j].includes(">")) break; // End of opening tag
      }

      if (hasAsButton && asButtonLine >= 0) {
        // Remove as={Button} line or just the prop
        const asLine = lines[asButtonLine];
        if (asLine.trim() === "as={Button}") {
          lines.splice(asButtonLine, 1);
        } else {
          lines[asButtonLine] = asLine.replace(/\s*as=\{Button\}/, "");
        }

        // Collect remaining props from the Menu.Trigger tag
        let tagEndLine = i;
        for (let j = i; j < lines.length; j++) {
          if (lines[j].includes(">") && !lines[j].includes("/>")) {
            tagEndLine = j;
            break;
          }
        }

        // Extract props
        const propLines: string[] = [];
        for (let j = i; j <= tagEndLine; j++) {
          propLines.push(lines[j]);
        }
        const propsText = propLines.join("\n");
        const propsMatch = propsText.match(/<Menu\.Trigger\s*([\s\S]*?)>/);
        let triggerProps = propsMatch ? propsMatch[1].trim() : "";

        const indent = lines[i].match(/^(\s*)/)?.[1] || "";

        // Rewrite
        lines[i] = `${indent}<Menu.Trigger asChild>`;
        if (tagEndLine > i) {
          lines.splice(i + 1, tagEndLine - i);
        }
        lines.splice(i + 1, 0, `${indent}  <Button ${triggerProps}>`);

        // Find </Menu.Trigger> and add </Button> before it
        for (let j = i + 2; j < lines.length; j++) {
          if (/^\s*<\/Menu\.Trigger>/.test(lines[j])) {
            lines.splice(j, 0, `${indent}  </Button>`);
            break;
          }
        }
      }
    }
    i++;
  }

  return lines.join("\n");
}

// Fix as={Link} patterns -> asChild with nested Link
function fixAsLink(content: string): string {
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Check for as={Link} on various components
    if (/\bas=\{Link\}/.test(line)) {
      // Identify the component (Button, IconButton, HStack, etc.)
      const componentMatch = line.match(/<(\w+(?:\.\w+)?)\s/);
      if (!componentMatch) {
        i++;
        continue;
      }
      const component = componentMatch[1];

      // Remove as={Link} and extract href
      lines[i] = line.replace(/\s*as=\{Link\}/, "");

      // Find href prop (might be on same line or different line)
      let hrefValue = "";
      let hrefLine = -1;
      for (let j = i; j < Math.min(i + 15, lines.length); j++) {
        const hrefMatch = lines[j].match(/\bhref=(\{[^}]+\}|"[^"]*")/);
        if (hrefMatch) {
          hrefValue = hrefMatch[1];
          hrefLine = j;
          // Remove href from this line
          lines[j] = lines[j].replace(/\s*href=(\{[^}]+\}|"[^"]*")/, "");
          if (lines[j].trim() === "") {
            lines.splice(j, 1);
            if (j <= i) i--;
          }
          break;
        }
        if (lines[j].includes(">")) break;
      }

      // Add asChild to the component
      lines[i] = lines[i].replace(
        new RegExp(`<${component.replace(".", "\\.")}\\s`),
        `<${component} asChild `
      );
      // Clean up potential double spaces
      lines[i] = lines[i].replace(/\s{2,}/g, " ");

      // Find end of opening tag
      let tagEndLine = i;
      for (let j = i; j < lines.length; j++) {
        if (lines[j].includes(">") && !lines[j].includes("/>")) {
          tagEndLine = j;
          break;
        }
        if (lines[j].includes("/>")) {
          tagEndLine = j;
          break;
        }
      }

      // After the opening tag's >, insert <Link href={...}>
      const indent = lines[i].match(/^(\s*)/)?.[1] || "";

      // Check if self-closing
      if (lines[tagEndLine].includes("/>")) {
        // Self-closing: convert to <Component asChild><Link href={...}>content</Link></Component>
        // This case is unlikely for as={Link} but handle it
        lines[tagEndLine] = lines[tagEndLine].replace(
          "/>",
          `><Link href=${hrefValue} /></${component}>`
        );
      } else {
        // After >, insert <Link href={...}>
        // Find the > position
        const gtIdx = lines[tagEndLine].lastIndexOf(">");
        const afterGt = lines[tagEndLine].slice(gtIdx + 1);
        lines[tagEndLine] = lines[tagEndLine].slice(0, gtIdx + 1);

        // Insert Link wrapper
        lines.splice(tagEndLine + 1, 0, `${indent}  <Link href=${hrefValue}>`);
        if (afterGt.trim()) {
          lines.splice(tagEndLine + 2, 0, `${indent}    ${afterGt.trim()}`);
        }

        // Find closing tag and wrap with </Link>
        const closingTag = `</${component}>`;
        for (let j = tagEndLine + 2; j < lines.length; j++) {
          if (lines[j].includes(closingTag)) {
            lines.splice(j, 0, `${indent}  </Link>`);
            break;
          }
        }
      }
    }
    i++;
  }

  return lines.join("\n");
}

// Process all TypeScript/TSX files
function processFiles(): void {
  const allFiles: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".next") {
          walk(fullPath);
        }
      } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        allFiles.push(fullPath);
      }
    }
  }

  walk(SRC);

  let totalChanges = 0;
  let filesChanged = 0;

  for (const filePath of allFiles) {
    const original = fs.readFileSync(filePath, "utf8");
    let content = original;

    // Apply transformations in order
    content = fixLeftRightIcon(content);
    content = fixIconButtonIcon(content);
    content = fixIconAs(content);
    // Don't run as={Button} and as={Link} fixes in this automated script
    // They're too complex and context-dependent

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      const changes = countDifferences(original, content);
      totalChanges += changes;
      filesChanged++;
      console.log(
        `  Fixed ${filePath.replace(SRC, "src")} (${changes} changes)`
      );
    }
  }

  console.log(`\nTotal: ${filesChanged} files, ${totalChanges} changes`);
}

function countDifferences(a: string, b: string): number {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  let diff = 0;
  const maxLen = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < maxLen; i++) {
    if (aLines[i] !== bLines[i]) diff++;
  }
  return diff;
}

processFiles();
