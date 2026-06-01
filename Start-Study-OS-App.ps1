$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ports = 8765..8775
$listener = $null
$prefix = $null

foreach ($p in $ports) {
  try {
    $listener = [System.Net.HttpListener]::new()
    $prefix = "http://localhost:$p/"
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    $port = $p
    break
  } catch {
    $listener = $null
    $prefix = $null
    continue
  }
}

if (-not $listener -or -not $listener.IsListening) {
  Write-Host "Study OS server could not start on any port in $($ports -join ', ')"
  Write-Host "Opening the app file directly instead..."
  Start-Process (Join-Path $root "index.html")
  exit
}

Write-Host ""
Write-Host "Study OS is running."
Write-Host "URL: $prefix"
Write-Host "Keep this window open while using the app."
Write-Host "Press Ctrl+C to stop."
Write-Host ""

Start-Process $prefix

function Get-ContentType($path) {
  switch ([IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".js" { "text/javascript; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".webmanifest" { "application/manifest+json; charset=utf-8" }
    ".svg" { "image/svg+xml" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    default { "application/octet-stream" }
  }
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($requestPath)) {
      $requestPath = "index.html"
    }

    $candidate = Join-Path $root $requestPath
    $fullPath = [IO.Path]::GetFullPath($candidate)
    $rootFullPath = [IO.Path]::GetFullPath($root)

    if (-not $fullPath.StartsWith($rootFullPath, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $bytes = [Text.Encoding]::UTF8.GetBytes("Not found")
    } else {
      $context.Response.StatusCode = 200
      $context.Response.ContentType = Get-ContentType $fullPath
      $bytes = [IO.File]::ReadAllBytes($fullPath)
    }

    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.OutputStream.Close()
  } catch {
    if ($listener.IsListening) {
      Write-Host $_.Exception.Message
    }
  }
}
