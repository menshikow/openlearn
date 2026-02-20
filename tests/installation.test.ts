import { test, expect, describe } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';

describe('Installation Scripts', () => {
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

  test('install.sh exists and is executable', () => {
    const installShPath = path.join(rootDir, 'install.sh');
    expect(fs.existsSync(installShPath)).toBe(true);
    
    const stats = fs.statSync(installShPath);
    // Check if executable (Unix systems)
    const mode = stats.mode;
    const isExecutable = (mode & parseInt('111', 8)) !== 0;
    expect(isExecutable).toBe(true);
  });

  test('install.sh contains required features', () => {
    const installShPath = path.join(rootDir, 'install.sh');
    const content = fs.readFileSync(installShPath, 'utf8');
    
    // Check for global profile support
    expect(content).toContain('get_global_profile_path');
    expect(content).toContain('check_global_profile');
    
    // Check for package manager auto-detection
    expect(content).toContain('bun');
    expect(content).toContain('npm');
    expect(content).toContain('pnpm');
    
    // Check for new file structure
    expect(content).toContain('.opencode/openlearn');
    expect(content).toContain('AGENTS.md');
    expect(content).toContain('PROJECT.md');

    // Check for JSON storage message
    expect(content).toContain('openlearn.json');
  });

  test('install.ps1 exists', () => {
    const installPs1Path = path.join(rootDir, 'install.ps1');
    expect(fs.existsSync(installPs1Path)).toBe(true);
  });

  test('install.ps1 contains required features', () => {
    const installPs1Path = path.join(rootDir, 'install.ps1');
    const content = fs.readFileSync(installPs1Path, 'utf8');
    
    // Check for global profile support
    expect(content).toContain('Get-GlobalProfilePath');
    expect(content).toContain('Test-GlobalProfile');
    
    // Check for package manager detection
    expect(content).toContain('Test-PackageManager');
    
    // Check for new file structure
    expect(content).toContain('.opencode\\openlearn');

    // Check for JSON storage message
    expect(content).toContain('openlearn.json');
  });
});

describe('Command Files', () => {
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
  const commandsDir = path.join(rootDir, '.opencode/commands');

  test('openlearn-task.md exists (renamed from feature)', () => {
    const taskPath = path.join(commandsDir, 'openlearn-task.md');
    expect(fs.existsSync(taskPath)).toBe(true);
    
    // Ensure old name doesn't exist
    const featurePath = path.join(commandsDir, 'openlearn-feature.md');
    expect(fs.existsSync(featurePath)).toBe(false);
  });

  test('openlearn-setup-context7.md exists', () => {
    const context7Path = path.join(commandsDir, 'openlearn-setup-context7.md');
    expect(fs.existsSync(context7Path)).toBe(true);
  });

  test('commands contain Theory Mode notices', () => {
    const commandFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    
    commandFiles.forEach(file => {
      const filePath = path.join(commandsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Most commands should have Theory Mode or permission sections
      const hasTheoryMode = content.toLowerCase().includes('theory mode');
      const hasImportantSection = content.toLowerCase().includes('important:');
      const hasPermissionSection = content.toLowerCase().includes('permission');
      
      expect(hasTheoryMode || hasImportantSection || hasPermissionSection).toBe(true);
    });
  });
});
