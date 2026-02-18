import { test, expect, describe } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

describe('Project Structure', () => {
  // Try multiple strategies to find project root
  function findProjectRoot(): string {
    // Strategy 1: Start from current file and go up
    let currentDir = __dirname;
    while (currentDir !== path.parse(currentDir).root) {
      if (fs.existsSync(path.join(currentDir, 'package.json')) &&
          fs.existsSync(path.join(currentDir, '.opencode'))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    
    // Strategy 2: Use process.cwd() as fallback
    if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
      return process.cwd();
    }
    
    // Strategy 3: Use __dirname parent
    return path.resolve(__dirname, '..');
  }
  
  const rootDir = findProjectRoot();

  test('required root files exist', () => {
    const requiredFiles = [
      'README.md',
      'package.json',
      'tsconfig.json',
      '.gitignore',
      'install.sh',
      'install.ps1',
    ];

    requiredFiles.forEach(file => {
      const fullPath = path.join(rootDir, file);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect(fs.statSync(fullPath).isFile()).toBe(true);
    });
  });

  test('AGENTS.md and PROJECT.md exist in .opencode/openlearn/', () => {
    const opencodeLearnDir = path.join(rootDir, '.opencode/openlearn');
    
    expect(fs.existsSync(path.join(opencodeLearnDir, 'AGENTS.md'))).toBe(true);
    expect(fs.existsSync(path.join(opencodeLearnDir, 'PROJECT.md'))).toBe(true);
  });

  test('.gitignore contains OpenLearn temporary files', () => {
    const gitignorePath = path.join(rootDir, '.gitignore');
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    
    expect(gitignoreContent).toContain('AGENTS.md');
    expect(gitignoreContent).toContain('PROJECT.md');
    expect(gitignoreContent).toContain('.DS_Store');
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
      const isGate = /^[a-z-]+-gate\.md$/.test(file);
      expect(isMentor || isGate).toBe(true);
    });
  });
});
