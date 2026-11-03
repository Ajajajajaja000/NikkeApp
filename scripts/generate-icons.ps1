Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $projectRoot "public"

function New-NikkeCompassIcon {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Size,
        [Parameter(Mandatory = $true)]
        [string]$OutputPath
    )

    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $scale = $Size / 512.0
    $background = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#0a0d14"))
    $graphics.FillRectangle($background, 0, 0, $Size, $Size)

    $borderPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#202838"), (12 * $scale))
    $borderPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $x = 18 * $scale
    $y = 18 * $scale
    $width = 476 * $scale
    $height = 476 * $scale
    $diameter = 208 * $scale
    $borderPath.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $borderPath.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
    $borderPath.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
    $borderPath.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
    $borderPath.CloseFigure()
    $graphics.DrawPath($borderPen, $borderPath)

    $points = @(
        [System.Drawing.PointF]::new(116 * $scale, 366 * $scale),
        [System.Drawing.PointF]::new(116 * $scale, 146 * $scale),
        [System.Drawing.PointF]::new(172 * $scale, 146 * $scale),
        [System.Drawing.PointF]::new(340 * $scale, 278 * $scale),
        [System.Drawing.PointF]::new(340 * $scale, 146 * $scale),
        [System.Drawing.PointF]::new(396 * $scale, 146 * $scale),
        [System.Drawing.PointF]::new(396 * $scale, 366 * $scale),
        [System.Drawing.PointF]::new(343 * $scale, 366 * $scale),
        [System.Drawing.PointF]::new(172 * $scale, 233 * $scale),
        [System.Drawing.PointF]::new(172 * $scale, 366 * $scale)
    )
    $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.PointF]::new(116 * $scale, 146 * $scale),
        [System.Drawing.PointF]::new(396 * $scale, 366 * $scale),
        [System.Drawing.ColorTranslator]::FromHtml("#5eead4"),
        [System.Drawing.ColorTranslator]::FromHtml("#7c3aed")
    )
    $graphics.FillPolygon($gradient, $points)

    $accent = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#ffb547"))
    $graphics.FillEllipse($accent, 346 * $scale, 106 * $scale, 60 * $scale, 60 * $scale)

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $accent.Dispose()
    $gradient.Dispose()
    $borderPath.Dispose()
    $borderPen.Dispose()
    $background.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-NikkeCompassIcon -Size 180 -OutputPath (Join-Path $publicDir "apple-touch-icon.png")
New-NikkeCompassIcon -Size 192 -OutputPath (Join-Path $publicDir "icon-192.png")
New-NikkeCompassIcon -Size 512 -OutputPath (Join-Path $publicDir "icon-512.png")
New-NikkeCompassIcon -Size 512 -OutputPath (Join-Path $publicDir "icon-maskable-512.png")

Write-Output "PWA icons generated in $publicDir"
