param(
  [Parameter(Mandatory)][string]$In,
  [Parameter(Mandatory)][string]$Out,
  [int]$W = 640,
  [int]$H = 360
)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile((Resolve-Path $In))
try {
  $dst = New-Object System.Drawing.Bitmap($W, $H)
  $gfx = [System.Drawing.Graphics]::FromImage($dst)
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $gfx.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $W, $H)),
    0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()
  $dst.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
  $dst.Dispose()
  Write-Output "OK ${W}x${H} -> $Out"
} finally { $src.Dispose() }
