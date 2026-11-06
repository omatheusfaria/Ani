# Converte um .docx em PDF usando o Microsoft Word instalado (COM).
# Uso: powershell -File scripts/docx_para_pdf.ps1 entrega/TG-Ani.docx
param([Parameter(Mandatory=$true)][string]$Docx)
$entrada = (Resolve-Path $Docx).Path
$saida = [System.IO.Path]::ChangeExtension($entrada, ".pdf")
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($entrada, $false, $true)
    $doc.SaveAs2($saida, 17)
    $doc.Close($false)
    Write-Output "PDF: $saida"
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
