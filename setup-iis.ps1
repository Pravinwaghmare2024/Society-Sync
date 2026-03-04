# SocietySync IIS Automated Setup Script
# Run this script as Administrator to configure IIS for SocietySync

$siteName = "SocietySync"
$port = 8080
$physicalPath = $PSScriptRoot

Write-Host "--- SocietySync IIS Installer ---" -ForegroundColor Cyan

# 1. Check for IIS
if (!(Get-Service W3SVC -ErrorAction SilentlyContinue)) {
    Write-Host "[!] IIS is not installed. Please enable IIS in Windows Features." -ForegroundColor Red
    exit
}

# 2. Check for URL Rewrite Module
$urlRewriteKey = "HKLM:\SOFTWARE\Microsoft\IIS Extensions\URL Rewrite"
if (!(Test-Path $urlRewriteKey)) {
    Write-Host "[!] URL Rewrite Module not found." -ForegroundColor Yellow
    Write-Host "Please download and install it from: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor White
    # We continue anyway as the user might install it later
}

# 3. Create Application Pool
$poolName = "SocietySyncPool"
if (!(Get-WebAppPool -Name $poolName -ErrorAction SilentlyContinue)) {
    Write-Host "[+] Creating Application Pool: $poolName"
    New-WebAppPool -Name $poolName
    Set-ItemProperty "IIS:\AppPools\$poolName" -Name "managedRuntimeVersion" -Value "" # No Managed Code
}

# 4. Create Website
if (!(Get-Website -Name $siteName -ErrorAction SilentlyContinue)) {
    Write-Host "[+] Creating Website: $siteName on port $port"
    New-Website -Name $siteName -Port $port -PhysicalPath $physicalPath -ApplicationPool $poolName
} else {
    Write-Host "[*] Website $siteName already exists. Updating physical path."
    Set-ItemProperty "IIS:\Sites\$siteName" -Name "physicalPath" -Value $physicalPath
}

# 5. Set Permissions
Write-Host "[+] Setting folder permissions for IIS_IUSRS..."
$acl = Get-Acl $physicalPath
$permission = "IIS_IUSRS","ReadAndExecute","Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $physicalPath $acl

Write-Host "`n--- Installation Complete ---" -ForegroundColor Green
Write-Host "Your society portal is now available at: http://localhost:$port"
Write-Host "Ensure the URL Rewrite module is installed for routing to work."
