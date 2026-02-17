import { test, expect, describe } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';

describe('JSON Validation', () => {
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

  test('config.json is valid JSON', () => {
    const configPath = path.join(rootDir, '.opencode/openlearn/config.json');
    const content = fs.readFileSync(configPath, 'utf-8');
    
    expect(() => JSON.parse(content)).not.toThrow();
  });

  test('config.json has required fields', () => {
    const configPath = path.join(rootDir, '.opencode/openlearn/config.json');
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);

    // Required top-level fields
    expect(config.version).toBeDefined();
    expect(config.initialized_at).toBeDefined();
    expect(config.profile).toBeDefined();
    expect(config.context7).toBeDefined();
    expect(config.project).toBeDefined();
    expect(config.learning_goals).toBeDefined();
    expect(config.stats).toBeDefined();
  });

  test('config.json has valid context7 configuration', () => {
    const configPath = path.join(rootDir, '.opencode/openlearn/config.json');
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config.context7).toBeDefined();
    expect(config.context7.mode).toBeDefined();
    expect(['auto', 'suggest', 'manual']).toContain(config.context7.mode);
    expect(typeof config.context7.enabled).toBe('boolean');
  });

  test('config.json has valid profile configuration', () => {
    const configPath = path.join(rootDir, '.opencode/openlearn/config.json');
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);

    expect(config.profile).toBeDefined();
    expect(config.profile.type).toBeDefined();
    expect(config.profile.settings).toBeDefined();
    expect(typeof config.profile.settings.design_involvement).toBe('boolean');
    expect(typeof config.profile.settings.analogies).toBe('object');
  });

  test('package.json is valid JSON', () => {
    const packagePath = path.join(rootDir, 'package.json');
    const content = fs.readFileSync(packagePath, 'utf-8');
    
    expect(() => JSON.parse(content)).not.toThrow();
  });

  test('package.json has required fields', () => {
    const packagePath = path.join(rootDir, 'package.json');
    const content = fs.readFileSync(packagePath, 'utf-8');
    const pkg = JSON.parse(content);

    expect(pkg.name).toBeDefined();
    expect(pkg.version).toBeDefined();
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
  });

  test('tsconfig.json is valid JSON', () => {
    const tsconfigPath = path.join(rootDir, 'tsconfig.json');
    const content = fs.readFileSync(tsconfigPath, 'utf-8');
    
    expect(() => JSON.parse(content)).not.toThrow();
  });
});
