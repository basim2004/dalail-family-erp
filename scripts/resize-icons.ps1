Add-Type -AssemblyName System.Drawing

$baseDir = Get-Location
$sourceIcon = Join-Path $baseDir "public\icons\app-icon.png"

function Resize-Png($srcPath, $dstPath, [int]$targetW, [int]$targetH, [bool]$maskable) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $bmp = New-Object System.Drawing.Bitmap $targetW, $targetH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(12, 47, 102))

    if ($maskable) {
        $insetX = [int]($targetW * 0.12)
        $insetY = [int]($targetH * 0.12)
        $w = $targetW - (2 * $insetX)
        $h = $targetH - (2 * $insetY)
        $g.DrawImage($src, $insetX, $insetY, $w, $h)
    } else {
        $g.DrawImage($src, 0, 0, $targetW, $targetH)
    }

    $g.Dispose()
    $src.Dispose()

    $tmp = $dstPath + ".tmp.png"
    $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Move-Item -Path $tmp -Destination $dstPath -Force
    Write-Host "Generated $dstPath ($targetW x $targetH)"
}

Resize-Png $sourceIcon (Join-Path $baseDir "public\icons\icon-192x192.png") 192 192 $false
Resize-Png $sourceIcon (Join-Path $baseDir "public\icons\icon-512x512.png") 512 512 $false
Resize-Png $sourceIcon (Join-Path $baseDir "public\icons\icon-maskable.png") 512 512 $true
Resize-Png $sourceIcon (Join-Path $baseDir "public\icon.png") 192 192 $false
Resize-Png $sourceIcon (Join-Path $baseDir "public\apple-touch-icon.png") 192 192 $false
