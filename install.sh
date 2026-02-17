#!/bin/bash
#
# OpenLearn Installer Script
# One-liner: curl -fsSL https://raw.githubusercontent.com/menshikow/openlearn/main/install.sh | bash
#

set -e

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

# Check if opencode is installed
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
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        show_error "Installation cancelled"
        exit 1
    fi
fi

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

# Copy root level config files if they don't exist
if [ ! -f "$INSTALL_DIR/AGENTS.md" ] && [ -f "$TEMP_DIR/openlearn/AGENTS.md" ]; then
    cp "$TEMP_DIR/openlearn/AGENTS.md" "$INSTALL_DIR/AGENTS.md"
    echo "    AGENTS.md: added"
fi

if [ ! -f "$INSTALL_DIR/PROJECT.md" ] && [ -f "$TEMP_DIR/openlearn/PROJECT.md" ]; then
    cp "$TEMP_DIR/openlearn/PROJECT.md" "$INSTALL_DIR/PROJECT.md"
    echo "    PROJECT.md: added"
fi

echo ""
show_success "File merge complete"

# Cleanup
rm -rf "$TEMP_DIR"

# Check if SQLite database needs to be initialized
DB_PATH="$INSTALL_DIR/.opencode/openlearn/openlearn.db"
if [ ! -f "$DB_PATH" ]; then
    show_progress "SQLite database will be created on first use"
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
echo "  3. Plan your first feature"
echo "     /openlearn-feature"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "For help: ${BOLD}/openlearn-guide${NC}"
echo -e "Status:  ${BOLD}/openlearn-status${NC}"
echo ""
