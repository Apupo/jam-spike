# Jednoduchy staticky server pre spike na Windows bez Pythonu a Node.
# Servuje priecinok so skriptom na http://localhost:<Port>/ a vypina cache.
# Pouzitie: powershell -NoProfile -ExecutionPolicy Bypass -File serve.ps1 -Port 8787
param([int]$Port = 8787)

$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$types = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".md"   = "text/plain; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
$Host.UI.RawUI.WindowTitle = "Jam spike server :$Port"
Write-Host "Servujem $root na http://localhost:$Port/ (zastavenie: zavri okno)"

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $res = $ctx.Response
  try {
    $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
    if ($rel -eq "" -or $rel.EndsWith("/")) { $rel += "index.html" }
    $path = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
    $res.Headers.Add("Cache-Control", "no-store")

    if ($path.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $path -PathType Leaf)) {
      $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
      $res.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($path)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $status = 200
    } else {
      $res.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      $status = 404
    }
    Write-Host ("{0} {1} {2}" -f $status, $ctx.Request.HttpMethod, $ctx.Request.Url.PathAndQuery)
  } catch {
    Write-Host "Chyba: $_"
  } finally {
    $res.Close()
  }
}
