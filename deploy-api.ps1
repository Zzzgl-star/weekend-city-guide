# Deploy via GitHub Contents API (no git protocol needed, bypasses network issues)
# Usage: run "npm run build" first, then this script
param(
  [Parameter(Mandatory = $true)][string]$Token,
  [string]$Owner = "Zzzgl-star",
  [string]$Repo = "weekend-city-guide",
  [string]$Branch = "gh-pages",
  [string]$DistDir = "dist"
)

$ErrorActionPreference = "Stop"
$headers = @{
  Authorization = "Bearer $Token"
  Accept        = "application/vnd.github+json"
}

function Get-RemoteSha($path) {
  try {
    $u = "https://api.github.com/repos/$Owner/$Repo/contents/$path" + "?ref=$Branch"
    $r = Invoke-RestMethod -Uri $u -Headers $headers -Method Get
    return $r.sha
  } catch { return $null }
}

function Upload-File($localPath, $remotePath) {
  $bytes = [IO.File]::ReadAllBytes($localPath)
  $b64 = [Convert]::ToBase64String($bytes)
  $body = @{
    message = "deploy: $remotePath"
    content = $b64
    branch  = $Branch
  }
  $sha = Get-RemoteSha $remotePath
  if ($sha) { $body.sha = $sha }
  $json = $body | ConvertTo-Json
  $u = "https://api.github.com/repos/$Owner/$Repo/contents/$remotePath"
  $r = Invoke-RestMethod -Uri $u -Method Put -Headers $headers -ContentType "application/json" -Body $json
  $short = $r.commit.sha.Substring(0, 7)
  Write-Output "UPLOADED $remotePath ($($bytes.Length) bytes, commit $short)"
}

Get-ChildItem $DistDir -Recurse -File | ForEach-Object {
  $distAbs = (Resolve-Path $DistDir).Path
  $rel = $_.FullName.Substring($distAbs.Length + 1).Replace("\", "/")
  Upload-File $_.FullName $rel
}
Write-Output "ALL DONE. Pages: https://$($Owner.ToLower()).github.io/$Repo/"
