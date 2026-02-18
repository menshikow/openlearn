---
description: Configure Context7 MCP server for official documentation lookups
agent: mentor
subtask: false
---

# /openlearn-setup-context7

Configure Context7 MCP server for official documentation lookups.

## What is Context7?

Context7 provides instant access to official documentation for libraries and frameworks. When you ask about React, Express, or any library, Context7 retrieves the official docs so you get accurate, up-to-date information.

## Prerequisites

- Node.js installed (v16+)
- opencode configured with MCP support

## Flow

1. **Check current configuration**
   - Detect opencode config location:
     - macOS: `~/Library/Application Support/opencode/mcp.json`
     - Linux: `~/.config/opencode/mcp.json`
     - Windows: `%APPDATA%/opencode/mcp.json`
   - Check if Context7 is already configured

2. **If not configured, present options**
   - Ask: "How would you like to configure Context7?"
     - [1] Auto-configure (recommended)
     - [2] Show manual instructions
     - [3] Skip for now

3. **Auto-configuration** (if selected)
   - Read existing MCP config (if any)
   - Add Context7 server configuration:
     ```json
     {
       "mcpServers": {
         "context7": {
           "command": "npx",
           "args": ["-y", "@upstash/context7-mcp@latest"]
         }
       }
     }
     ```
   - Save updated config
   - Explain: "You may need to restart opencode for changes to take effect"

4. **Manual instructions** (if selected)
   - Show exact steps:
     1. Locate opencode config file
     2. Add the Context7 MCP server entry
     3. Restart opencode
   - Provide the JSON snippet to add

5. **Verify configuration**
   - Check if config was saved correctly
   - Suggest testing with a simple query

6. **Update OpenLearn config**
   - Set `context7.enabled: true` in `.opencode/openlearn/config.json`
   - Ask for preferred mode (auto/suggest/manual)

## Example Session

```
Student: /openlearn-setup-context7

OpenLearn: Checking Context7 MCP configuration...

OpenLearn: Context7 is not configured yet.

Context7 provides official documentation lookups for libraries
and frameworks. When discussing React, Express, or other tools,
I'll use official docs instead of relying on training data.

How would you like to configure it?
[1] Auto-configure (add to opencode settings)
[2] Show manual instructions
[3] Skip for now

Student: 1

OpenLearn: Auto-configuring Context7...
Detected opencode config at: ~/.config/opencode/mcp.json
Adding Context7 MCP server...
✅ Configuration updated

Note: You may need to restart opencode for changes to take effect.

What Context7 mode would you prefer?
- Auto: Automatically check official docs (recommended)
- Suggest: Ask before checking docs
- Manual: Only check when you ask

Student: Auto

OpenLearn: ✅ Context7 configured successfully!
Mode: Auto

Context7 is now ready. When you ask about libraries or frameworks,
I'll automatically check official documentation for accurate,
up-to-date information.
```

## Troubleshooting

**"npx command not found"**
- Context7 requires Node.js
- Install from: https://nodejs.org/

**"Permission denied when saving config"**
- Check file permissions on opencode config directory
- Try manual configuration instead

**"Context7 not working after configuration"**
- Restart opencode completely
- Check that the config file was saved correctly
- Verify Node.js is accessible in PATH

## Security Note

Context7 MCP server runs locally and only accesses public documentation. It does not send your code or project data to external servers.