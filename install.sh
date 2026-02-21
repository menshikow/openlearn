#!/bin/bash
#
# OpenLearn Installer Script
# One-liner: curl -fsSL https://raw.githubusercontent.com/menshikow/openlearn/main/install.sh | bash
#

set -e

# Defaults and flags
NON_INTERACTIVE=false
ASSUME_YES=false
USE_GLOBAL_PROFILE=false
CREATE_GLOBAL_PROFILE=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ASCII Art Header
echo -e "${BLUE}"
cat << 'EOF'
   ____                   __                 __
  / __ \____  ___  ____  / /   _____  ____  / /___  __________
 / / / / __ \/ _ \/ __ \/ / | / / _ \/ __ \/ __/ / / / ___/ _ \
/ /_/ / /_/ /  __/ / / / /| |/ /  __/ / / / /_/ /_/ / /  /  __/
\____/ .___/\___/_/ /_/_/ |___/\___/_/ /_/\__/\__,_/_/   \___/
    /_/
EOF
echo -e "${NC}"
echo -e "${BOLD}AI-mentored development framework for opencode${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Progress indicator function
show_progress() {
    echo -e "${BLUE}[...]${NC} $1"
}

show_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

show_error() {
    echo -e "${RED}[✗]${NC} $1"
}

show_usage() {
    cat << 'EOF'
Usage: install.sh [options]

Options:
  -y, --yes            Non-interactive mode, assume yes for all prompts
      --non-interactive Non-interactive mode, use default answers
  -h, --help           Show this help message
EOF
}

parse_args() {
    while [ $# -gt 0 ]; do
        case "$1" in
            -y|--yes)
                ASSUME_YES=true
                NON_INTERACTIVE=true
                ;;
            --non-interactive)
                NON_INTERACTIVE=true
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                show_warning "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
        shift
    done
}

prompt_yn() {
    local prompt="$1"
    local default="$2"

    if [ "$ASSUME_YES" = true ]; then
        REPLY="Y"
        show_progress "Auto-yes: ${prompt}"
        return
    fi

    if [ "$NON_INTERACTIVE" = true ] || [ ! -r /dev/tty ]; then
        REPLY="$default"
        if [[ "$default" =~ ^[Yy]$ ]]; then
            show_progress "No TTY detected, defaulting to yes: ${prompt}"
        else
            show_progress "No TTY detected, defaulting to no: ${prompt}"
        fi
        return
    fi

    read -p "$prompt" -n 1 -r < /dev/tty
    echo ""
    if [ -z "$REPLY" ]; then
        REPLY="$default"
    fi
}

# Global profile functions
get_global_profile_path() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "$HOME/Library/Application Support/openlearn/profile.json"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "$HOME/.config/openlearn/profile.json"
    else
        echo "$HOME/.openlearn/profile.json"
    fi
}

check_global_profile() {
    local profile_path=$(get_global_profile_path)
    if [ -f "$profile_path" ]; then
        return 0
    else
        return 1
    fi
}

install_with_bun() {
    show_progress "Checking for bun..."
    if command -v bun &> /dev/null; then
        show_success "bun found"
        return 0
    else
        show_warning "bun not found"
        return 1
    fi
}

# Check if opencode is installed
parse_args "$@"

show_progress "Checking for opencode..."
if command -v opencode &> /dev/null; then
    show_success "opencode found: $(opencode --version 2>/dev/null || echo 'installed')"
else
    show_warning "opencode not found in PATH"
    echo ""
    echo -e "${YELLOW}OpenLearn requires opencode to be installed first.${NC}"
    echo ""
    echo "Install opencode:"
    echo "  macOS:    brew install opencode"
    echo "  Linux:    curl -fsSL https://opencode.ai/install.sh | bash"
    echo "  Windows:  winget install opencode"
    echo ""
    echo -e "${YELLOW}You can continue installation, but opencode is required to use OpenLearn.${NC}"
    echo ""
    prompt_yn "Continue anyway? (y/N) " "N"
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        show_error "Installation cancelled"
        exit 1
    fi
fi

# Check for existing global profile
show_progress "Checking for global profile..."
if check_global_profile; then
    show_success "Global profile found"
    echo ""
    echo -e "${BLUE}A global OpenLearn profile already exists.${NC}"
    echo ""
    prompt_yn "Use global profile for this project? (Y/n) " "Y"
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        USE_GLOBAL_PROFILE=false
        show_progress "Will create project-specific profile"
    else
        USE_GLOBAL_PROFILE=true
        show_success "Will use global profile"
    fi
else
    USE_GLOBAL_PROFILE=false
    show_progress "No global profile found"
    echo ""
    echo -e "${BLUE}Would you like to create a global profile?${NC}"
    echo "A global profile allows you to reuse settings across all projects."
    echo ""
    prompt_yn "Create global profile? (y/N) " "N"
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        CREATE_GLOBAL_PROFILE=true
        show_success "Will create global profile"
    else
        CREATE_GLOBAL_PROFILE=false
        show_progress "Will create project-specific profile"
    fi
fi

# Check for bun
install_with_bun

# Set up variables
REPO_URL="https://github.com/menshikow/openlearn.git"
TEMP_DIR=$(mktemp -d)
INSTALL_DIR="$PWD"

echo ""
show_progress "Installing OpenLearn to: $INSTALL_DIR"

# Clone the repository
show_progress "Downloading OpenLearn..."
if git clone --depth 1 "$REPO_URL" "$TEMP_DIR/openlearn" 2>/dev/null; then
    show_success "Downloaded OpenLearn"
else
    show_error "Failed to download OpenLearn"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Function to merge files (add missing, don't overwrite)
merge_directory() {
    local src="$1"
    local dest="$2"
    local name="$3"
    
    mkdir -p "$dest"
    
    local added=0
    local skipped=0
    
    for item in "$src"/*; do
        if [ -e "$item" ]; then
            local basename=$(basename "$item")
            local dest_path="$dest/$basename"
            
            if [ -e "$dest_path" ]; then
                skipped=$((skipped + 1))
                if [ -d "$item" ]; then
                    # Recursively merge subdirectories
                    merge_directory "$item" "$dest_path" "$basename"
                fi
            else
                cp -r "$item" "$dest_path"
                added=$((added + 1))
            fi
        fi
    done
    
    if [ $added -gt 0 ] || [ $skipped -gt 0 ]; then
        echo "    $name: $added added, $skipped existing"
    fi
}

# Merge .opencode directory
echo ""
show_progress "Merging OpenLearn files..."
echo ""
echo "    (Existing files will be preserved, only missing files added)"
echo ""

merge_directory "$TEMP_DIR/openlearn/.opencode" "$INSTALL_DIR/.opencode" ".opencode"

# Copy AGENTS.md and PROJECT.md to .opencode/openlearn/
mkdir -p "$INSTALL_DIR/.opencode/openlearn"
if [ -f "$TEMP_DIR/openlearn/AGENTS.md" ]; then
    cp "$TEMP_DIR/openlearn/AGENTS.md" "$INSTALL_DIR/.opencode/openlearn/AGENTS.md"
    echo "    AGENTS.md: copied to .opencode/openlearn/"
fi

if [ -f "$TEMP_DIR/openlearn/PROJECT.md" ]; then
    cp "$TEMP_DIR/openlearn/PROJECT.md" "$INSTALL_DIR/.opencode/openlearn/PROJECT.md"
    echo "    PROJECT.md: copied to .opencode/openlearn/"
fi

# Ask about temporary files in root
echo ""
echo -e "${BLUE}Would you like temporary copies of AGENTS.md and PROJECT.md in your project root?${NC}"
echo "These files help during development but should not be committed."
echo ""
prompt_yn "Keep temporary copies in root? (Y/n) " "Y"
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    # Copy to root as temporary files
    if [ ! -f "$INSTALL_DIR/AGENTS.md" ] && [ -f "$TEMP_DIR/openlearn/AGENTS.md" ]; then
        cp "$TEMP_DIR/openlearn/AGENTS.md" "$INSTALL_DIR/AGENTS.md"
        echo "    AGENTS.md: temporary copy added to root"
    fi
    
    if [ ! -f "$INSTALL_DIR/PROJECT.md" ] && [ -f "$TEMP_DIR/openlearn/PROJECT.md" ]; then
        cp "$TEMP_DIR/openlearn/PROJECT.md" "$INSTALL_DIR/PROJECT.md"
        echo "    PROJECT.md: temporary copy added to root"
    fi
    
    show_success "Temporary files added (will be cleaned up on /openlearn-done)"
else
    show_success "Files kept only in .opencode/openlearn/"
fi

# Create global profile if requested
if [ "$CREATE_GLOBAL_PROFILE" = true ]; then
    show_progress "Creating global profile..."
    GLOBAL_PROFILE_PATH=$(get_global_profile_path)
    mkdir -p "$(dirname "$GLOBAL_PROFILE_PATH")"
    
    cat > "$GLOBAL_PROFILE_PATH" << 'PROFILEEOF'
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
PROFILEEOF
    
    show_success "Global profile created at: $GLOBAL_PROFILE_PATH"
fi

echo ""
show_success "File merge complete"

# Cleanup
rm -rf "$TEMP_DIR"

# Check if JSON storage file needs to be initialized
DB_PATH="$INSTALL_DIR/.opencode/openlearn/openlearn.json"
if [ ! -f "$DB_PATH" ]; then
    show_progress "JSON storage file will be created on first use"
fi

# Install dependencies with best available package manager
if [ -f "$INSTALL_DIR/.opencode/package.json" ]; then
    echo ""
    
    # Detect package manager: bun > npm > pnpm
    if command -v bun &> /dev/null; then
        show_progress "Installing dependencies with bun..."
        cd "$INSTALL_DIR/.opencode" && bun install
        show_success "Dependencies installed with bun"
    elif command -v npm &> /dev/null; then
        show_progress "Installing dependencies with npm..."
        cd "$INSTALL_DIR/.opencode" && npm install
        show_success "Dependencies installed with npm"
    elif command -v pnpm &> /dev/null; then
        show_progress "Installing dependencies with pnpm..."
        cd "$INSTALL_DIR/.opencode" && pnpm install
        show_success "Dependencies installed with pnpm"
    else
        show_warning "No package manager found (bun, npm, or pnpm)"
        echo "    You can install dependencies manually later:"
        echo "      cd .opencode && bun install  # or npm install, pnpm install"
    fi
fi

# Final success message
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  OpenLearn installed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo ""
echo "  1. Start opencode in this directory"
echo "     $ opencode"
echo ""
echo "  2. Initialize your OpenLearn project"
echo "     /openlearn-init"
echo ""
echo "  3. Plan your first task"
echo "     /openlearn-task"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "For help: ${BOLD}/openlearn-guide${NC}"
echo -e "Status:  ${BOLD}/openlearn-status${NC}"
echo ""
