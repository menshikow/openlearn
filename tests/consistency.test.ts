import { test, expect, describe } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

describe('Documentation Consistency', () => {
  function findProjectRoot(): string {
    let currentDir = __dirname;
    while (currentDir !== path.parse(currentDir).root) {
      if (fs.existsSync(path.join(currentDir, 'package.json')) &&
          fs.existsSync(path.join(currentDir, '.opencode'))) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
    return path.resolve(__dirname, '..');
  }

  const rootDir = findProjectRoot();

  test('all documentation uses 5-line limit (not 8)', async () => {
    const files = await glob('**/*.md', { 
      cwd: rootDir,
      ignore: ['node_modules/**', '.opencode/node_modules/**']
    });
    
    const filesWithEightLines: string[] = [];
    
    files.forEach(file => {
      const filePath = path.join(rootDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for "8 lines" or "8-line" patterns (but not "5" near them)
      const eightLinePattern = /8\s*lines?|8-line/gi;
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        if (eightLinePattern.test(line)) {
          // Check if this line or surrounding lines mention "5"
          const context = lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join(' ');
          if (!context.includes('5')) {
            filesWithEightLines.push(`${file}:${index + 1}`);
          }
        }
      });
    });
    
    if (filesWithEightLines.length > 0) {
      console.log('Files with "8 lines" reference (should be "5"):');
      filesWithEightLines.forEach(f => console.log(`  - ${f}`));
    }
    
    expect(filesWithEightLines).toEqual([]);
  });

  test('README files are consistent', () => {
    const readmeEn = fs.readFileSync(path.join(rootDir, 'README.md'), 'utf8');
    const readmeDe = fs.readFileSync(path.join(rootDir, 'README.de.md'), 'utf8');
    const readmeRu = fs.readFileSync(path.join(rootDir, 'README.ru.md'), 'utf8');
    
    // All should mention openlearn-task (not just openlearn-feature)
    expect(readmeEn).toContain('/openlearn-task');
    expect(readmeDe).toContain('/openlearn-task');
    expect(readmeRu).toContain('/openlearn-task');
    
    // All should mention Theory Mode
    expect(readmeEn.toLowerCase()).toContain('theory mode');
    expect(readmeDe.toLowerCase()).toContain('theory mode');
    expect(readmeRu.toLowerCase()).toContain('theory mode');
    

  });

  test('all commands have frontmatter', async () => {
    const commandsDir = path.join(rootDir, '.opencode/commands');
    const commandFiles = await glob('*.md', { cwd: commandsDir });
    
    commandFiles.forEach(file => {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Should have YAML frontmatter
      expect(content.startsWith('---')).toBe(true);
      
      // Should have description
      expect(content).toContain('description:');
      
      // Should have agent specified
      expect(content).toContain('agent:');
    });
  });

  test('mentor agent has strict permissions', () => {
    const mentorPath = path.join(rootDir, '.opencode/agents/mentor.md');
    const content = fs.readFileSync(mentorPath, 'utf8');
    
    // Should mention 5 lines max
    expect(content).toContain('5 lines');
    
    // Should have strict permission rules
    expect(content).toContain('permission:');
    expect(content.toLowerCase()).toContain('ask');
  });
});
