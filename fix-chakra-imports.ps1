$srcDir = "c:\Users\HP\gel-apps\blog\src"

# Replace @chakra-ui/next-js Link with next/link
Get-ChildItem -Path $srcDir -Include "*.ts","*.tsx" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content.Contains('@chakra-ui/next-js')) {
        $content = $content -replace 'import\s*\{\s*Link\s*\}\s*from\s*"@chakra-ui/next-js"', 'import Link from "next/link"'
        $content = $content -replace "import\s*\{\s*Link\s*\}\s*from\s*'@chakra-ui/next-js'", "import Link from 'next/link'"
        Set-Content $_.FullName -Value $content -NoNewline
        Write-Host "Fixed @chakra-ui/next-js: $($_.Name)"
    }
}

Write-Host "`nDone!"
