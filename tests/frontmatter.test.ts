import { test, expect, describe } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

describe('Frontmatter Validation', () => {
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

  async function getAllMarkdownFiles(): Promise<string[]> {
    const commandsDir = path.join(rootDir, '.opencode/commands');
    const agentsDir = path.join(rootDir, '.opencode/agents');
    const skillsDir = path.join(rootDir, '.opencode/skills/openlearn');

    const commandFiles = (await glob('*.md', { cwd: commandsDir })).map(f => path.join(commandsDir, f));
    const agentFiles = (await glob('*.md', { cwd: agentsDir })).map(f => path.join(agentsDir, f));
    const skillFiles = (await glob('*.md', { cwd: skillsDir })).map(f => path.join(skillsDir, f));

    return [...commandFiles, ...agentFiles, ...skillFiles];
  }

  test('all markdown files have valid frontmatter', async () => {
    const files = await getAllMarkdownFiles();
    expect(files.length).toBeGreaterThan(0);

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check if file has frontmatter (starts with ---)
      if (content.startsWith('---')) {
        const parsed = matter(content);
        expect(parsed.data).toBeDefined();
        expect(parsed.content).toBeDefined();
      }
    });
  });

  test('commands have required frontmatter fields', async () => {
    const commandsDir = path.join(rootDir, '.opencode/commands');
    const commandFiles = await glob('*.md', { cwd: commandsDir });

    commandFiles.forEach(file => {
      const content = fs.readFileSync(path.join(commandsDir, file), 'utf-8');
      
      if (content.startsWith('---')) {
        const parsed = matter(content);
        
        expect(parsed.data.description).toBeDefined();
        expect(typeof parsed.data.description).toBe('string');
        expect(parsed.data.description.length).toBeGreaterThan(0);

        expect(parsed.data.agent).toBeDefined();
        expect(typeof parsed.data.agent).toBe('string');
        expect(parsed.data.agent).toBe('mentor');
      }
    });
  });

  test('agents have required frontmatter fields', async () => {
    const agentsDir = path.join(rootDir, '.opencode/agents');
    const agentFiles = await glob('*.md', { cwd: agentsDir });

    agentFiles.forEach(file => {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf-8');
      
      if (content.startsWith('---')) {
        const parsed = matter(content);
        
        expect(parsed.data.description).toBeDefined();
        expect(typeof parsed.data.description).toBe('string');
        expect(parsed.data.description.length).toBeGreaterThan(0);

        expect(parsed.data.mode).toBeDefined();
        expect(parsed.data.mode).toBe('subagent');

        expect(parsed.data.temperature).toBeDefined();
        expect(typeof parsed.data.temperature).toBe('number');
        expect(parsed.data.temperature).toBeGreaterThanOrEqual(0);
        expect(parsed.data.temperature).toBeLessThanOrEqual(1);

        expect(parsed.data.tools).toBeDefined();
        expect(typeof parsed.data.tools).toBe('object');

        expect(parsed.data.permission).toBeDefined();
        expect(typeof parsed.data.permission).toBe('object');
      }
    });
  });

  test('agent prompts do not exceed 6000 tokens (estimated)', async () => {
    const agentsDir = path.join(rootDir, '.opencode/agents');
    const agentFiles = await glob('*.md', { cwd: agentsDir });
    const MAX_TOKENS = 6000;
    const TOKENS_PER_CHAR = 0.25; // Rough estimate

    agentFiles.forEach(file => {
      const content = fs.readFileSync(path.join(agentsDir, file), 'utf-8');
      const parsed = matter(content);
      
      // Rough token estimation
      const estimatedTokens = parsed.content.length * TOKENS_PER_CHAR;
      
      expect(estimatedTokens).toBeLessThan(MAX_TOKENS);
    });
  });
});
