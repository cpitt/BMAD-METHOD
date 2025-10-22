const path = require('node:path');
const fs = require('fs-extra');
const chalk = require('chalk');
const { BaseIdeSetup } = require('./_base-ide');
const { getAgentsFromBmad } = require('./shared/bmad-artifacts');
const { WorkflowCommandGenerator } = require('./workflow-command-generator');

class OpenCodeSetup extends BaseIdeSetup {
  constructor() {
    super('opencode', 'OpenCode', true);
    this.configDir = '.opencode';
    this.agentDir = 'agent';
    this.commandDir = 'command';
  }

  async collectConfiguration(options = {}) {
    const config = {
      selectedModules: options.selectedModules || [],
    };
    return config;
  }

  async setup(projectDir, bmadDir, options = {}) {
    console.log(chalk.cyan(`Setting up ${this.name}...`));

    const openCodeDir = path.join(projectDir, this.configDir);
    const agentPath = path.join(openCodeDir, this.agentDir);
    const commandPath = path.join(openCodeDir, this.commandDir);

    await this.ensureDir(agentPath);
    await this.ensureDir(commandPath);

    const agents = await getAgentsFromBmad(bmadDir, options.selectedModules || []);

    let agentCount = 0;
    for (const agent of agents) {
      const content = await fs.readFile(agent.path, 'utf8');
      const targetPath = path.join(agentPath, `${agent.name}.md`);
      await fs.writeFile(targetPath, content, 'utf8');
      agentCount++;
    }

    const workflowGen = new WorkflowCommandGenerator();
    const workflows = await workflowGen.loadWorkflowManifest(bmadDir);
    let workflowCount = 0;

    if (workflows && workflows.length > 0) {
      for (const workflow of workflows) {
        const commandContent = await workflowGen.generateCommandContent(workflow, bmadDir);
        const cmdPath = path.join(commandPath, `${workflow.module}-${workflow.name}.md`);
        await fs.writeFile(cmdPath, commandContent, 'utf8');
        workflowCount++;
      }
    }

    await this.generateOpenCodeConfig(projectDir);

    console.log(chalk.green(`✓ ${this.name} configured:`));
    console.log(chalk.dim(`  - ${agentCount} agents installed`));
    console.log(chalk.dim(`  - ${workflowCount} workflow commands configured`));
    console.log(chalk.dim(`  - Config directory: ${path.relative(projectDir, openCodeDir)}`));

    return {
      success: true,
      agents: agentCount,
      workflows: workflowCount,
    };
  }

  async generateOpenCodeConfig(projectDir) {
    const openCodeDir = path.join(projectDir, this.configDir);
    const configPath = path.join(openCodeDir, 'opencode.jsonc');

    let config = {
      $schema: 'https://opencode.ai/config.json',
      instructions: ['{project-root}/bmad/core/config.yaml'],
    };

    if (await fs.pathExists(configPath)) {
      try {
        const existingContent = await fs.readFile(configPath, 'utf8');
        const existingConfig = this.parseJsonc(existingContent);
        config = { ...existingConfig, ...config };
      } catch {
        console.log(chalk.yellow('  Warning: Could not parse existing opencode.jsonc'));
      }
    }

    const configContent = this.formatJsonc(config);
    await fs.writeFile(configPath, configContent, 'utf8');
  }

  parseJsonc(content) {
    let cleaned = content
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(cleaned);
  }

  formatJsonc(obj, indent = 0) {
    const spaces = ' '.repeat(indent);
    const nextSpaces = ' '.repeat(indent + 2);
    const lines = [];

    lines.push('{');

    const entries = Object.entries(obj);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      const isLast = i === entries.length - 1;
      const comma = isLast ? '' : ',';

      if (Array.isArray(value)) {
        lines.push(`${nextSpaces}"${key}": [`);
        value.forEach((item, idx) => {
          const itemComma = idx === value.length - 1 ? '' : ',';
          lines.push(`${nextSpaces}  "${item}"${itemComma}`);
        });
        lines.push(`${nextSpaces}]${comma}`);
      } else if (typeof value === 'object' && value !== null) {
        const nestedStr = this.formatJsonc(value, indent + 2)
          .split('\n')
          .map((line, idx) => (idx === 0 ? line : nextSpaces + line))
          .join('\n');
        lines.push(`${nextSpaces}"${key}": ${nestedStr}${comma}`);
      } else if (typeof value === 'string') {
        lines.push(`${nextSpaces}"${key}": "${value}"${comma}`);
      } else {
        lines.push(`${nextSpaces}"${key}": ${JSON.stringify(value)}${comma}`);
      }
    }

    lines.push(`${spaces}}`);
    return lines.join('\n');
  }
}

module.exports = { OpenCodeSetup };
