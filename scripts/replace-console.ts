import fs from 'fs';
import path from 'path';

const filesToUpdate = [
    'src/app/api/webhooks/resend/route.ts',
    'src/app/api/upload/route.ts',
    'src/app/api/settings/route.ts',
    'src/app/api/posts/[slugOrPostId]/route.ts',
    'src/app/api/posts/featured/route.ts',
    'src/app/api/cron/route.ts',
];

const replacements = [
    {
        pattern: /console\.log\(/g,
        replacement: 'logger.debug(',
    },
    {
        pattern: /console\.error\(/g,
        replacement: 'logger.error(',
    },
    {
        pattern: /console\.warn\(/g,
        replacement: 'logger.warn(',
    },
    {
        pattern: /console\.info\(/g,
        replacement: 'logger.info(',
    },
];

function addLoggerImport(content: string): string {
    if (content.includes('from "@/lib/logger"')) {
        return content;
    }

    const importMatch = content.match(/^(import .+;\n)+/m);
    if (importMatch) {
        const lastImportIndex = content.lastIndexOf(importMatch[0]);
        const insertPosition = lastImportIndex + importMatch[0].length;
        return (
            content.slice(0, insertPosition) +
            'import { logger } from "@/lib/logger";\n' +
            content.slice(insertPosition)
        );
    }

    return 'import { logger } from "@/lib/logger";\n' + content;
}

function updateFile(filePath: string): void {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    let modified = false;

    for (const { pattern, replacement } of replacements) {
        if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            modified = true;
        }
    }

    if (modified) {
        content = addLoggerImport(content);
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated: ${filePath}`);
    } else {
        console.log(`No changes needed: ${filePath}`);
    }
}

console.log('Replacing console statements with logger...\n');

for (const file of filesToUpdate) {
    updateFile(file);
}

console.log('\nDone!');
