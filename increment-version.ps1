$manifestPath = Join-Path $PSScriptRoot manifest.json

$manifest = Get-Content  $manifestPath | ConvertFrom-Json

[string] $currentVersion = $manifest.version

$versionParts = $currentVersion -split '\.'

$patchIndex = $versionParts.Length - 1

$currentPatch = [int]$versionParts[$patchIndex]
$newPatch = $currentPatch+ 1

$versionParts[$patchIndex] = $newPatch

$newVersion = $versionParts -join '.'

$manifest.version = $newVersion

$manifest | ConvertTo-Json -Depth 25 > $manifestPath

git commit --all --message 'Increment manifest version'

npm version patch
