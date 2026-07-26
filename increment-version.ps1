using namespace System.Text.Json
using namespace System.Text.Encodings.Web

$ErrorActionPreference = 'Stop'

$manifestPath = Join-Path $PSScriptRoot manifest.json

$manifest = Get-Content  $manifestPath | ConvertFrom-Json -AsHashtable

[string] $currentVersion = $manifest.version

$versionParts = $currentVersion -split '\.'

$patchIndex = $versionParts.Length - 1

$currentPatch = [int]$versionParts[$patchIndex]
$newPatch = $currentPatch + 1

$versionParts[$patchIndex] = $newPatch

$newVersion = $versionParts -join '.'

$manifest.version = $newVersion

$options = [JsonSerializerOptions]::new()
$options.Encoder = [JavaScriptEncoder]::UnsafeRelaxedJsonEscaping
$options.WriteIndented = $true
$options.IndentSize = 3

$manifestJson = [JsonSerializer]::Serialize($manifest, $options)

$manifestJson | Out-File -NoNewline $manifestPath

git commit --message "Increment manifest version to $newVersion" -- $manifestPath

npm version patch
