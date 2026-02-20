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

# Global profile functions
function Get-GlobalProfilePath {
    $localAppData = $env:LOCALAPPDATA
    if (-not $localAppData) {
        $localAppData = Join-Path $env:USERPROFILE "AppData\Local"
    }
    return Join-Path $localAppData "openlearn\profile.json"
}

function Test-GlobalProfile {
    $profilePath = Get-GlobalProfilePath
    return Test-Path $profilePath
}

# Check package manager availability
function Test-PackageManager {
    param([string]$Name)
    $pm = Get-Command $Name -ErrorAction SilentlyContinue
    return $null -ne $pm
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

# Check for existing global profile
Show-Progress "Checking for global profile..."
$useGlobalProfile = $false
$createGlobalProfile = $false

if (Test-GlobalProfile) {
    Show-Success "Global profile found"
    Write-Host ""
    Write-Host "$Blue A global OpenLearn profile already exists.$Reset"
    Write-Host ""
    
    $useGlobal = Read-Host "Use global profile for this project? (Y/n)"
    if ($useGlobal -notmatch '^[Nn]$') {
        $useGlobalProfile = $true
        Show-Success "Will use global profile"
    } else {
        Show-Progress "Will create project-specific profile"
    }
} else {
    Show-Progress "No global profile found"
    Write-Host ""
    Write-Host "$Blue Would you like to create a global profile?$Reset"
    Write-Host "A global profile allows you to reuse settings across all projects."
    Write-Host ""
    
    $createGlobal = Read-Host "Create global profile? (y/N)"
    if ($createGlobal -match '^[Yy]$') {
        $createGlobalProfile = $true
        Show-Success "Will create global profile"
    } else {
        Show-Progress "Will create project-specific profile"
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

# Copy AGENTS.md and PROJECT.md to .opencode/openlearn/
$openlearnDir = Join-Path $destOpencode "openlearn"
if (-not (Test-Path $openlearnDir)) {
    New-Item -ItemType Directory -Path $openlearnDir -Force | Out-Null
}

$sourceAgentsMd = Join-Path $TempDir "openlearn\AGENTS.md"
$destAgentsMd = Join-Path $openlearnDir "AGENTS.md"
if (Test-Path $sourceAgentsMd) {
    Copy-Item $sourceAgentsMd $destAgentsMd -Force
    Write-Host "    AGENTS.md: copied to .opencode\openlearn\"
}

$sourceProjectMd = Join-Path $TempDir "openlearn\PROJECT.md"
$destProjectMd = Join-Path $openlearnDir "PROJECT.md"
if (Test-Path $sourceProjectMd) {
    Copy-Item $sourceProjectMd $destProjectMd -Force
    Write-Host "    PROJECT.md: copied to .opencode\openlearn\"
}

# Ask about temporary files in root
Write-Host ""
Write-Host "$Blue Would you like temporary copies of AGENTS.md and PROJECT.md in your project root?$Reset"
Write-Host "These files help during development but should not be committed."
Write-Host ""

$tempFiles = Read-Host "Keep temporary copies in root? (Y/n)"
if ($tempFiles -notmatch '^[Nn]$') {
    # Copy to root as temporary files
    $rootAgentsMd = Join-Path $InstallDir "AGENTS.md"
    $rootProjectMd = Join-Path $InstallDir "PROJECT.md"
    
    if ((-not (Test-Path $rootAgentsMd)) -and (Test-Path $sourceAgentsMd)) {
        Copy-Item $sourceAgentsMd $rootAgentsMd
        Write-Host "    AGENTS.md: temporary copy added to root"
    }
    
    if ((-not (Test-Path $rootProjectMd)) -and (Test-Path $sourceProjectMd)) {
        Copy-Item $sourceProjectMd $rootProjectMd
        Write-Host "    PROJECT.md: temporary copy added to root"
    }
    
    Show-Success "Temporary files added (will be cleaned up on /openlearn-done)"
} else {
    Show-Success "Files kept only in .opencode\openlearn\"
}

# Create global profile if requested
if ($createGlobalProfile) {
    Show-Progress "Creating global profile..."
    $globalProfilePath = Get-GlobalProfilePath
    $globalProfileDir = Split-Path $globalProfilePath -Parent
    
    if (-not (Test-Path $globalProfileDir)) {
        New-Item -ItemType Directory -Path $globalProfileDir -Force | Out-Null
    }
    
    $profileContent = @"
{
  "version": "1.0.0",
  "configured_at": null,
  "profile": {
    "type": "junior",
    "settings": {
      "background": "coding-basics",
      "design_involvement": true,
      "analogies": {
        "enabled": false,
        "source": null
      }
    }
  },
  "context7": {
    "mode": "auto",
    "enabled": true
  },
  "mode": "theory",
  "preferences": {
    "code_examples_max_lines": 5,
    "auto_cleanup_temp_files": true
  }
}
"@
    
    $profileContent | Out-File -FilePath $globalProfilePath -Encoding UTF8
    Show-Success "Global profile created at: $globalProfilePath"
}

Write-Host ""
Show-Success "File merge complete"

# Install dependencies with best available package manager
$packageJsonPath = Join-Path $destOpencode "package.json"
if (Test-Path $packageJsonPath) {
    Write-Host ""
    
    # Detect package manager: bun > npm > pnpm
    if (Test-PackageManager "bun") {
        Show-Progress "Installing dependencies with bun..."
        Push-Location $destOpencode
        & bun install
        Pop-Location
        Show-Success "Dependencies installed with bun"
    } elseif (Test-PackageManager "npm") {
        Show-Progress "Installing dependencies with npm..."
        Push-Location $destOpencode
        & npm install
        Pop-Location
        Show-Success "Dependencies installed with npm"
    } elseif (Test-PackageManager "pnpm") {
        Show-Progress "Installing dependencies with pnpm..."
        Push-Location $destOpencode
        & pnpm install
        Pop-Location
        Show-Success "Dependencies installed with pnpm"
    } else {
        Show-Warning "No package manager found (bun, npm, or pnpm)"
        Write-Host "    You can install dependencies manually later:"
        Write-Host "      cd .opencode && bun install  # or npm install, pnpm install"
    }
}

# Cleanup
Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue

# Check if JSON storage file needs to be initialized
$DbPath = Join-Path $InstallDir ".opencode\openlearn\openlearn.json"
if (-not (Test-Path $DbPath)) {
    Show-Progress "JSON storage file will be created on first use"
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
Write-Host "  3. Plan your first task"
Write-Host "     /openlearn-task"
Write-Host ""
Write-Host "$Blue━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$Reset"
Write-Host ""
Write-Host "For help: $Bold/openlearn-guide$Reset"
Write-Host "Status:  $Bold/openlearn-status$Reset"
Write-Host ""
