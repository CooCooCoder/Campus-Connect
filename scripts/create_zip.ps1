
Add-Type -AssemblyName System.IO.Compression.FileSystem;
$sourceDir = "E:\Kalvium\campus_connect";
$zipPath = "E:\Kalvium\campus_connect\CampusConnect_Shivamsh_Anil_Menon.zip";
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

$zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create);

$items = Get-ChildItem -Path $sourceDir -Recurse -File | Where-Object {
    $_.FullName -notmatch '\\node_modules(\\|$)' -and
    $_.FullName -notmatch '\\dist(\\|$)' -and
    $_.FullName -notmatch '\.env$' -and
    $_.FullName -notmatch '\.db$' -and
    $_.FullName -notmatch '\.db-journal$' -and
    $_.FullName -notmatch '\\.git(\\|$)' -and
    $_.FullName -notmatch '\.zip$'
};

foreach ($item in $items) {
    $relPath = $item.FullName.Substring($sourceDir.Length + 1);
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $item.FullName, $relPath);
}

$zip.Dispose();
Write-Output "ZIP creation finished. Total entries: $($items.Count)";
