# Push a directory snapshot to a GitHub branch as one commit (Git Data API).
# Preserves history if the branch already exists (parent = current head).
# Usage:
#   .\push-source.ps1 -Token <GH_TOKEN> -Branch main -SourceDir . -Message "docs: ..."
#   .\push-source.ps1 -Token <GH_TOKEN> -Branch gh-pages -SourceDir dist -Message "deploy: build"
param(
  [Parameter(Mandatory = $true)][string]$Token,
  [string]$Owner = "Zzzgl-star",
  [string]$Repo = "weekend-city-guide",
  [string]$Branch = "main",
  [string]$SourceDir = ".",
  [string]$Message = "update"
)

$ErrorActionPreference = "Stop"
$headers = @{
  Authorization = "Bearer $Token"
  Accept        = "application/vnd.github+json"
}

# Collect files, excluding build output / deps / secrets (relative to SourceDir)
$root = (Resolve-Path $SourceDir).Path
$files = Get-ChildItem $root -Recurse -File | Where-Object {
  $rel = $_.FullName.Substring($root.Length + 1)
  -not ($rel -match "^(node_modules|dist)[\\/]" -or $rel -match "^token\.txt$")
}
Write-Output "Collecting $($files.Count) files from $SourceDir for branch $Branch ..."

# 1. Create blobs
$tree = @()
foreach ($f in $files) {
  $rel = $f.FullName.Substring($root.Length + 1).Replace("\", "/")
  $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($f.FullName))
  $blob = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/git/blobs" -Method Post -Headers $headers -ContentType "application/json" -Body (@{ content = $b64; encoding = "base64" } | ConvertTo-Json)
  $tree += @{ path = $rel; mode = "100644"; type = "blob"; sha = $blob.sha }
  Write-Output "  blob $rel"
}

# 2. Create tree (full snapshot)
$treeRes = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/git/trees" -Method Post -Headers $headers -ContentType "application/json" -Body (@{ tree = $tree } | ConvertTo-Json -Depth 5)
Write-Output "tree created: $($treeRes.sha.Substring(0,7))"

# 3. Create commit (attach parent if branch exists -> history preserved)
$parentSha = $null
try {
  $ref = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/git/refs/heads/$Branch" -Headers $headers
  $parentSha = $ref.object.sha
} catch { }
$commitBody = @{ message = $Message; tree = $treeRes.sha; parents = @() }
if ($parentSha) { $commitBody.parents = @($parentSha) }
$commit = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/git/commits" -Method Post -Headers $headers -ContentType "application/json" -Body ($commitBody | ConvertTo-Json -Depth 5)
Write-Output "commit created: $($commit.sha.Substring(0,7)) (parent: $(if($parentSha){$parentSha.Substring(0,7)}else{'none'}))"

# 4. Create branch ref (root commit) or fast-forward existing ref
if (-not $parentSha) {
  $r = Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/git/refs" -Method Post -Headers $headers -ContentType "application/json" -Body (@{ ref = "refs/heads/$Branch"; sha = $commit.sha } | ConvertTo-Json)
  Write-Output "branch created: $($r.ref)"
} else {
  Invoke-RestMethod -Uri "https://api.github.com/repos/$Owner/$Repo/git/refs/heads/$Branch" -Method Patch -Headers $headers -ContentType "application/json" -Body (@{ sha = $commit.sha; force = $false } | ConvertTo-Json) | Out-Null
  Write-Output "branch fast-forwarded: $Branch"
}
Write-Output "DONE. https://github.com/$Owner/$Repo/tree/$Branch"
