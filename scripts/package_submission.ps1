$targetDir = "e:\Kalvium\campus_connect"
$stageDir = "e:\Kalvium\campus_connect\staging_submission"
$zipPath = "e:\Kalvium\campus_connect\CampusConnect_Shivamsh_Anil_Menon.zip"

if (Test-Path $stageDir) { Remove-Item $stageDir -Recurse -Force }
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

New-Item -ItemType Directory -Path $stageDir -Force | Out-Null

$directories = @("backend", "frontend", "database", "mongodb", "reports", "docs", "screenshots", "scripts")

foreach ($d in $directories) {
    $srcPath = Join-Path $targetDir $d
    $dstPath = Join-Path $stageDir $d
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $dstPath -Recurse -Force
        # Remove node_modules, dist, .env, .db from copied staging directory
        Get-ChildItem -Path $dstPath -Recurse -Force | Where-Object {
            $_.Name -eq "node_modules" -or
            $_.Name -eq "dist" -or
            $_.Name -eq ".env" -or
            $_.Name -like "*.db" -or
            $_.Name -like "*.db-journal"
        } | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Copy root files
$rootFiles = @("README.md", "package.json", ".gitignore", ".env.example", "progress-checklist.md", "submission-checklist.md")
foreach ($f in $rootFiles) {
    $srcFile = Join-Path $targetDir $f
    if (Test-Path $srcFile) {
        Copy-Item -Path $srcFile -Destination $stageDir -Force
    }
}

Write-Output "Staging prepared cleanly. Creating ZIP archive..."
Compress-Archive -Path "$stageDir\*" -DestinationPath $zipPath -CompressionLevel Optimal -Force

# Verify ZIP exists and remove temporary staging folder
if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Output "ZIP Archive successfully created: $zipPath"
    Write-Output "Archive Size: $([Math]::Round($zipSize, 2)) MB"
    Remove-Item $stageDir -Recurse -Force
} else {
    Write-Error "Failed to generate ZIP archive."
}
