import { test, expect, describe } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

describe('Cross-Reference Validation', () => {
  const rootDir = path.resolve(__dirname, '..');

  test('AGENTS.md references existing commands', async () => {
    const agentsMdPath = path.join(rootDir, 'AGENTS.md');
    const agentsMdContent = fs.readFileSync(agentsMdPath, 'utf-8');
    
    const commandsDir = path.join(rootDir, '.opencode/commands');
    const commandFiles = await glob('*.md', { cwd: commandsDir });
    const commandNames = commandFiles.map(f => f.replace('.md', ''));

    // Check that each command is mentioned in AGENTS.md
    commandNames.forEach(cmd => {
      expect(agentsMdContent).toContain(cmd);
    });
  });

  test('AGENTS.md references existing agents', async () => {
    const agentsMdPath = path.join(rootDir, 'AGENTS.md');
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

  test('no placeholder text in templates', async () => {
    const productDir = path.join(rootDir, '.opencode/openlearn/product');
    const specTemplatesDir = path.join(rootDir, '.opencode/openlearn/specs/active');
    
    const productFiles = await glob('*.md', { cwd: productDir });
    const specFiles = await glob('*.md', { cwd: specTemplatesDir });
    
    const allFiles = [...productFiles.map(f => path.join(productDir, f)), 
                      ...specFiles.map(f => path.join(specTemplatesDir, f))];

    const placeholderPatterns = [
      /\[Feature Name\]/i,
      /\[Your Project\]/i,
      /\[TODO\]/i,
      /\[Describe/i,
    ];

    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      placeholderPatterns.forEach(pattern => {
        expect(content).not.toMatch(pattern);
      });
    });
  });
});
