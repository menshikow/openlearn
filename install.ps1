#
# OpenLearn Installer Script for PowerShell
# Install: iwr -useb https://raw.githubusercontent.com/menshikow/openlearn/main/install.ps1 | iex
#

$ErrorActionPreference = "Stop"

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"
$Bold = "`e[1m"

# ASCII Art Header
Write-Host "$Blue" -NoNewline
Write-Host @"
   ____                   __                 __
  / __ \____  ___  ____  / /   _____  ____  / /___  __________
 / / / / __ \/ _ \/ __ \/ / | / / _ \/ __ \/ __/ / / / ___/ _ \
/ /_/ / /_/ /  __/ / / / /| |/ /  __/ / / / /_/ /_/ / /  /  __/
\____/ .___/\___/_/ /_/_/ |___/\___/_/ /_/\__/\__,_/_/   \___/
    /_/
"@
Write-Host "$Reset"
Write-Host "$Bold AI-mentored development framework for opencode$Reset"
Write-Host "$Blue━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$Reset"
Write-Host ""

# Progress functions
function Show-Progress {
    param([string]$Message)
    Write-Host "$Blue[...]$Reset $Message"
}

function Show-Success {
    param([string]$Message)
    Write-Host "$Green[✓]$Reset $Message"
}

function Show-Warning {
    param([string]$Message)
    Write-Host "$Yellow[!]$Reset $Message"
}

function Show-Error {
    param([string]$Message)
    Write-Host "$Red[✗]$Reset $Message"
}

# Check if opencode is installed
Show-Progress "Checking for opencode..."
$opencodePath = Get-Command opencode -ErrorAction SilentlyContinue

if ($opencodePath) {
    $version = (opencode --version 2>$null) -or "installed"
    Show-Success "opencode found: $version"
} else {
    Show-Warning "opencode not found in PATH"
    Write-Host ""
    Write-Host "$Yellow OpenLearn requires opencode to be installed first.$Reset"
    Write-Host ""
    Write-Host "Install opencode:"
    Write-Host "  Windows:  winget install opencode"
    Write-Host "  Or visit: https://opencode.ai/download"
    Write-Host ""
    Write-Host "$Yellow You can continue installation, but opencode is required to use OpenLearn.$Reset"
    Write-Host ""
    
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -notmatch '^[Yy]$') {
        Show-Error "Installation cancelled"
        exit 1
    }
}

# Set up variables
$RepoUrl = "https://github.com/menshikow/openlearn.git"
$TempDir = Join-Path $env:TEMP ([System.Guid]::NewGuid().ToString())
$InstallDir = Get-Location

Write-Host ""
Show-Progress "Installing OpenLearn to: $InstallDir"

# Create temp directory
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# Clone the repository
Show-Progress "Downloading OpenLearn..."
try {
    git clone --depth 1 $RepoUrl (Join-Path $TempDir "openlearn") 2>$null
    Show-Success "Downloaded OpenLearn"
} catch {
    Show-Error "Failed to download OpenLearn"
    Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue
    exit 1
}

# Function to merge directories
function Merge-Directory {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Name
    )
    
    if (-not (Test-Path $Destination)) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }
    
    $added = 0
    $skipped = 0
    
    if (Test-Path $Source) {
        $items = Get-ChildItem -Path $Source -Force
        
        foreach ($item in $items) {
            $destPath = Join-Path $Destination $item.Name
            
            if (Test-Path $destPath) {
                $skipped++
                if ($item.PSIsContainer) {
                    # Recursively merge subdirectories
                    Merge-Directory -Source $item.FullName -Destination $destPath -Name $item.Name
                }
            } else {
                Copy-Item -Path $item.FullName -Destination $destPath -Recurse -Force
                $added++
            }
        }
    }
    
    if ($added -gt 0 -or $skipped -gt 0) {
        Write-Host "    $Name`: $added added, $skipped existing"
    }
}

# Merge .opencode directory
Write-Host ""
Show-Progress "Merging OpenLearn files..."
Write-Host ""
Write-Host "    (Existing files will be preserved, only missing files added)"
Write-Host ""

$sourceOpencode = Join-Path $TempDir "openlearn\.opencode"
$destOpencode = Join-Path $InstallDir ".opencode"

Merge-Directory -Source $sourceOpencode -Destination $destOpencode -Name ".opencode"

# Copy root level config files if they don't exist
$sourceAgentsMd = Join-Path $TempDir "openlearn\AGENTS.md"
$destAgentsMd = Join-Path $InstallDir "AGENTS.md"
if ((-not (Test-Path $destAgentsMd)) -and (Test-Path $sourceAgentsMd)) {
    Copy-Item $sourceAgentsMd $destAgentsMd
    Write-Host "    AGENTS.md: added"
}

$sourceProjectMd = Join-Path $TempDir "openlearn\PROJECT.md"
$destProjectMd = Join-Path $InstallDir "PROJECT.md"
if ((-not (Test-Path $destProjectMd)) -and (Test-Path $sourceProjectMd)) {
    Copy-Item $sourceProjectMd $destProjectMd
    Write-Host "    PROJECT.md: added"
}

Write-Host ""
Show-Success "File merge complete"

# Cleanup
Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue

# Check if SQLite database needs to be initialized
$DbPath = Join-Path $InstallDir ".opencode\openlearn\openlearn.db"
if (-not (Test-Path $DbPath)) {
    Show-Progress "SQLite database will be created on first use"
}

# Final success message
Write-Host ""
Write-Host "$Green━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$Reset"
Write-Host "$Green  OpenLearn installed successfully!$Reset"
Write-Host "$Green━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$Reset"
Write-Host ""
Write-Host "$Bold Next Steps:$Reset"
Write-Host ""
Write-Host "  1. Start opencode in this directory"
Write-Host "     PS> opencode"
Write-Host ""
Write-Host "  2. Initialize your OpenLearn project"
Write-Host "     /openlearn-init"
Write-Host ""
Write-Host "  3. Plan your first feature"
Write-Host "     /openlearn-feature"
Write-Host ""
Write-Host "$Blue━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$Reset"
Write-Host ""
Write-Host "For help: $Bold/openlearn-guide$Reset"
Write-Host "Status:  $Bold/openlearn-status$Reset"
Write-Host ""
