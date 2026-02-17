import { test, expect, describe } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

describe('Project Structure', () => {
  const rootDir = path.resolve(__dirname, '..');

  test('required directories exist', () => {
    const requiredDirs = [
      '.opencode/commands',
      '.opencode/agents',
      '.opencode/skills/openlearn',
      '.opencode/openlearn/product',
      '.opencode/openlearn/specs/active',
      '.opencode/openlearn/learnings',
    ];

    requiredDirs.forEach(dir => {
      const fullPath = path.join(rootDir, dir);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).isDirectory()).toBe(true);
    });
  });

  test('required root files exist', () => {
    const requiredFiles = [
      'PROJECT.md',
      'README.md',
      'AGENTS.md',
      'package.json',
      'tsconfig.json',
      '.gitignore',
    ];

    requiredFiles.forEach(file => {
      const fullPath = path.join(rootDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).isFile()).toBe(true);
    });
  });

  test('command files follow naming convention', async () => {
    const commandsDir = path.join(rootDir, '.opencode/commands');
    const commandFiles = await glob('*.md', { cwd: commandsDir });

    expect(commandFiles.length).toBeGreaterThan(0);
    
    commandFiles.forEach(file => {
      expect(file).toMatch(/^openlearn-[a-z-]+\.md$/);
    });
  });

  test('agent files follow naming convention', async () => {
    const agentsDir = path.join(rootDir, '.opencode/agents');
    const agentFiles = await glob('*.md', { cwd: agentsDir });

    expect(agentFiles.length).toBeGreaterThan(0);

    agentFiles.forEach(file => {
      const isMentor = file === 'mentor.md';
      const isGate = file.match(/^[a-z-]+-gate\.md$/);
      expect(isMentor || isGate).toBe(true);
    });
  });
});
