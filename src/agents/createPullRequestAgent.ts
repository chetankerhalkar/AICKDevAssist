import { getLLM } from "../llm";
import { getLLMConfig } from "../config";
import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function createPullRequestAgent(changesSummary?: string): Promise<string> {
  const llmConfig = getLLMConfig();
  if (!llmConfig) {
    vscode.window.showErrorMessage(
      'No LLM provider configured. Please run "AICKStudio AI: Configure Settings" first.'
    );
    //await vscode.commands.executeCommand('AICKStudioAI.configureSettingsDevFix');
    return '❌ LLM configuration missing. Cannot generate pull request description.';
  }
  const llm = getLLM(llmConfig);

  // Get git information
  let gitInfo = '';
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length > 0) {
      const workspaceRoot = workspaceFolders[0].uri.fsPath;
      
      // Get current branch
      const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: workspaceRoot });
      
      // Get recent commits
      const { stdout: recentCommits } = await execAsync('git log --oneline -5', { cwd: workspaceRoot });
      
      // Get git diff summary
      const { stdout: diffStat } = await execAsync('git diff --stat HEAD~1', { cwd: workspaceRoot });
      
      // Get modified files
      const { stdout: modifiedFiles } = await execAsync('git diff --name-only HEAD~1', { cwd: workspaceRoot });

      gitInfo = `
Current Branch: ${currentBranch.trim()}

Recent Commits:
${recentCommits.trim()}

Diff Statistics:
${diffStat.trim()}

Modified Files:
${modifiedFiles.trim()}
      `;
    }
  } catch (error) {
    gitInfo = 'Could not retrieve git information. Make sure you are in a git repository.';
  }

  const prompt = `Generate a comprehensive pull request description based on the following information:

${changesSummary ? `Changes Summary:\n${changesSummary}\n` : ''}

${gitInfo ? `Git Information:\n${gitInfo}\n` : ''}

Please create a pull request description that includes:

## 📋 Summary
A clear and concise description of what this PR does.

## 🔄 Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Other (please describe):

## ✨ What's Changed
- List the key changes made in this PR
- Include any new features or improvements
- Mention any bug fixes

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No breaking changes

## 📸 Screenshots (if applicable)
Add screenshots or GIFs to help explain your changes.

## 🔗 Related Issues
Closes #[issue number]
Fixes #[issue number]
Related to #[issue number]

## 📝 Additional Notes
Any additional information that reviewers should know.

## ✅ Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

Make the description professional, informative, and easy to review. Use proper Markdown formatting and include relevant emojis for better readability.`;

  const result = await llm.invoke(prompt);
  return result.content as string;
}

export async function createGitHubPullRequest(title: string, description: string, baseBranch: string = 'main'): Promise<string> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found');
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    
    // Get current branch
    const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: workspaceRoot });
    const branch = currentBranch.trim();

    if (branch === baseBranch) {
      throw new Error(`Cannot create PR from ${baseBranch} to ${baseBranch}. Please create a feature branch first.`);
    }

    // Check if GitHub CLI is available
    try {
      await execAsync('gh --version', { cwd: workspaceRoot });
    } catch (error) {
      throw new Error('GitHub CLI (gh) is not installed. Please install it to create pull requests automatically.');
    }

    // Create pull request using GitHub CLI
    const command = `gh pr create --title "${title}" --body "${description.replace(/"/g, '\\"')}" --base ${baseBranch} --head ${branch}`;
    const { stdout } = await execAsync(command, { cwd: workspaceRoot });

    return `✅ Pull request created successfully!\n\n${stdout}`;
  } catch (error: any) {
    return `❌ Failed to create pull request: ${error.message}\n\nYou can manually create the PR using the generated description.`;
  }
}

export async function analyzeCodeChanges(): Promise<string> {
  try {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return 'No workspace folder found';
    }

    const workspaceRoot = workspaceFolders[0].uri.fsPath;
    
    // Get detailed diff
    const { stdout: diff } = await execAsync('git diff HEAD~1', { cwd: workspaceRoot });
    
    if (!diff.trim()) {
      return 'No changes detected in the current branch';
    }

    const llmConfig = getLLMConfig()!;
    // if (!llmConfig) {
    //   throw new Error("LLM configuration not found.");
    // }
    const llm = getLLM(llmConfig);

    const prompt = `Analyze the following git diff and provide a summary of the changes:

\`\`\`diff
${diff}
\`\`\`

Please provide:
1. A brief summary of what was changed
2. The impact of these changes
3. Any potential risks or considerations
4. Suggested testing areas

Keep the analysis concise but informative.`;

    const result = await llm.invoke(prompt);
    return result.content as string;
  } catch (error: any) {
    return `Error analyzing changes: ${error.message}`;
  }
}

