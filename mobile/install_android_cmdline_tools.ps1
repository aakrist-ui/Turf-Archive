$url = 'https://dl.google.com/android/repository/commandlinetools-win-14742923_latest.zip'
$dest = "$env:USERPROFILE\AppData\Local\Android\Sdk\cmdline-tools.zip"
$extractRoot = "$env:USERPROFILE\AppData\Local\Android\Sdk\cmdline-tools"
$latestDir = Join-Path $extractRoot 'latest'

if (Test-Path $dest) { Remove-Item -Force $dest }
if (Test-Path $latestDir) { Remove-Item -Recurse -Force $latestDir }

Write-Host "Downloading $url to $dest"
Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing

Write-Host "Extracting command-line tools"
if (Test-Path $extractRoot) { Remove-Item -Recurse -Force $extractRoot }
Expand-Archive -Path $dest -DestinationPath $extractRoot -Force

$extractedCmdLine = Join-Path $extractRoot 'cmdline-tools'
if (Test-Path $extractedCmdLine) {
    Rename-Item -Path $extractedCmdLine -NewName 'latest' -Force
}

Remove-Item -Force $dest
Write-Host 'download-extracted'