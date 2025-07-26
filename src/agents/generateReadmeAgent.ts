import { getLLM } from "../llm";
import { getLLMConfig } from "../config";
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function generateReadmeAgent(projectDescription?: string): Promise<string> {
  const llmConfig = getLLMConfig();
  if (!llmConfig) {
    vscode.window.showErrorMessage(
      'No LLM provider configured. Please run "AICKStudio AI: Configure Settings" first.'
    );
    //await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
    return '❌ LLM configuration missing. Cannot generate pull request description.';
  }
  const llm = getLLM(llmConfig);

  // Get project structure if workspace is available
  let projectStructure = '';
  const workspaceFolders = vscode.workspace.workspaceFolders;
  
  if (workspaceFolders && workspaceFolders.length > 0) {
    const rootPath = workspaceFolders[0].uri.fsPath;
    projectStructure = getProjectStructure(rootPath);
  }

  // Get package.json info if available
  let packageInfo = '';
  if (workspaceFolders && workspaceFolders.length > 0) {
    const packageJsonPath = path.join(workspaceFolders[0].uri.fsPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageInfo = `
Project Name: ${packageJson.name || 'Unknown'}
Version: ${packageJson.version || '1.0.0'}
Description: ${packageJson.description || 'No description provided'}
Dependencies: ${Object.keys(packageJson.dependencies || {}).join(', ') || 'None'}
Dev Dependencies: ${Object.keys(packageJson.devDependencies || {}).join(', ') || 'None'}
Scripts: ${Object.keys(packageJson.scripts || {}).join(', ') || 'None'}
        `;
      } catch (error) {
        packageInfo = 'Could not parse package.json';
      }
    }
  }

  const prompt = `Generate a comprehensive and professional README.md file for this project. Use the following information:

${packageInfo ? `Package Information:\n${packageInfo}\n` : ''}

${projectStructure ? `Project Structure:\n${projectStructure}\n` : ''}

${projectDescription ? `Project Description:\n${projectDescription}\n` : ''}

Please create a README.md that includes:

1. **Project Title** - Clear and descriptive
2. **Description** - What the project does and why it's useful
3. **Features** - Key features and capabilities
4. **Installation** - Step-by-step installation instructions
5. **Usage** - How to use the project with examples
6. **API Documentation** - If applicable, document key APIs/functions
7. **Configuration** - Any configuration options
8. **Contributing** - Guidelines for contributors
9. **License** - License information
10. **Contact/Support** - How to get help

Make it professional, well-formatted with proper Markdown syntax, and include relevant badges, code examples, and clear sections. The README should be informative for both users and developers.`;

  const result = await llm.invoke(prompt);
  return result.content as string;
}

function getProjectStructure(rootPath: string, maxDepth: number = 3, currentDepth: number = 0): string {
  if (currentDepth >= maxDepth) return '';
  
  let structure = '';
  try {
    const items = fs.readdirSync(rootPath);
    const filteredItems = items.filter(item => 
      !item.startsWith('.') && 
      !['node_modules', 'dist', 'build', 'out', '.git'].includes(item)
    );

    filteredItems.forEach(item => {
      const fullPath = path.join(rootPath, item);
      const indent = '  '.repeat(currentDepth);
      
      if (fs.statSync(fullPath).isDirectory()) {
        structure += `${indent}📁 ${item}/\n`;
        structure += getProjectStructure(fullPath, maxDepth, currentDepth + 1);
      } else {
        const ext = path.extname(item);
        const icon = getFileIcon(ext);
        structure += `${indent}${icon} ${item}\n`;
      }
    });
  } catch (error) {
    structure += `${' '.repeat(currentDepth * 2)}❌ Error reading directory\n`;
  }
  
  return structure;
}

function getFileIcon(extension: string): string {
  const iconMap: { [key: string]: string } = {
    '.js': '📄',
    '.ts': '📘',
    '.jsx': '⚛️',
    '.tsx': '⚛️',
    '.json': '📋',
    '.md': '📝',
    '.html': '🌐',
    '.css': '🎨',
    '.scss': '🎨',
    '.py': '🐍',
    '.java': '☕',
    '.cs': '🔷',
    '.cpp': '⚙️',
    '.c': '⚙️',
    '.php': '🐘',
    '.rb': '💎',
    '.go': '🐹',
    '.rs': '🦀',
    '.yml': '⚙️',
    '.yaml': '⚙️',
    '.xml': '📄',
    '.sql': '🗃️',
    '.sh': '🐚',
    '.bat': '🐚',
    '.dockerfile': '🐳',
    '.gitignore': '🚫',
    '.env': '🔐'
  };
  
  return iconMap[extension.toLowerCase()] || '📄';
}

