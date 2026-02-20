import { test, expect, describe } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

describe('Cross-Reference Validation', () => {
  // Try multiple strategies to find project root
  function findProjectRoot(): string {
    let currentDir = __dirname;
    while (currentDir !== path.parse(currentDir).root) {
      if (fs.existsSync(path.join(currentDir, 'package.json')) &&
          fs.existsSync(path.join(currentDir, '.opencode'))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
      return process.cwd();
    }
    return path.resolve(__dirname, '..');
  }
  
  const rootDir = findProjectRoot();

  function getAgentsReferencePath(): string | null {
    const canonicalPath = path.join(rootDir, '.opencode/openlearn/AGENTS.md');
    if (fs.existsSync(canonicalPath)) {
      return canonicalPath;
    }

    const legacyPath = path.join(rootDir, 'AGENTS.md');
    if (fs.existsSync(legacyPath)) {
      return legacyPath;
    }

    return null;
  }

  test('AGENTS.md references existing commands', async () => {
    const agentsMdPath = getAgentsReferencePath();
    expect(agentsMdPath).not.toBeNull();
    if (!agentsMdPath) {
      return;
    }

    const agentsMdContent = fs.readFileSync(agentsMdPath, 'utf-8');
    
    const commandsDir = path.join(rootDir, '.opencode/commands');
    const commandFiles = await glob('*.md', { cwd: commandsDir });
    const commandNames = commandFiles.map(f => f.replace('.md', ''));

    commandNames.forEach(cmd => {
      expect(agentsMdContent).toContain(cmd);
    });
  });

  test('AGENTS.md references existing agents', async () => {
    const agentsMdPath = getAgentsReferencePath();
    expect(agentsMdPath).not.toBeNull();
    if (!agentsMdPath) {
      return;
    }

    const agentsMdContent = fs.readFileSync(agentsMdPath, 'utf-8');
    
    const agentsDir = path.join(rootDir, '.opencode/agents');
    const agentFiles = await glob('*.md', { cwd: agentsDir });
    const agentNames = agentFiles.map(f => f.replace('.md', ''));

    // Check that each agent is mentioned in AGENTS.md
    agentNames.forEach(agent => {
      expect(agentsMdContent).toContain(agent);
    });
  });

  test('README.md mentions all commands', async () => {
    const readmePath = path.join(rootDir, 'README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    
    const commandsDir = path.join(rootDir, '.opencode/commands');
    const commandFiles = await glob('*.md', { cwd: commandsDir });

    commandFiles.forEach(file => {
      const commandName = file.replace('.md', '');
      expect(readmeContent).toContain(commandName);
    });
  });

  test('commands reference valid agents', async () => {
    const commandsDir = path.join(rootDir, '.opencode/commands');
    const commandFiles = await glob('*.md', { cwd: commandsDir });
    
    const agentsDir = path.join(rootDir, '.opencode/agents');
    const agentFiles = await glob('*.md', { cwd: agentsDir });
    const validAgents = new Set(agentFiles.map(f => f.replace('.md', '')));

    // Add 'mentor' as a valid agent reference
    validAgents.add('mentor');

    commandFiles.forEach(file => {
      const content = fs.readFileSync(path.join(commandsDir, file), 'utf-8');
      
      // Check if command references an agent
      const agentMatch = content.match(/agent:\s*(\w+)/);
      if (agentMatch) {
        const referencedAgent = agentMatch[1];
        expect(validAgents.has(referencedAgent)).toBe(true);
      }
    });
  });


});
