# OpenCode Installation Guide

OpenCode is an AI terminal coding agent designed for powerful, interactive coding workflows. BMAD integrates seamlessly with OpenCode to provide access to agents, commands, and workflows.

## Installation

When you run the BMAD installer, select **OpenCode** as one of your tools:

```bash
npm run install
```

Select OpenCode during the **Tool Integration** step.

## What Gets Installed

The installer will create:

- **`.opencode/agent/`** - All BMAD agents as markdown files
- **`.opencode/command/`** - Workflow command templates
- **`.opencode/opencode.jsonc`** - OpenCode configuration with instructions pointing to BMAD resources

## Using BMAD with OpenCode

### 1. Start OpenCode in your project

```bash
cd /path/to/your-project
opencode
```

### 2. Access BMAD Agents and Commands

OpenCode will load the BMAD agents and make them available through the `.opencode/agent/` directory. You can reference them directly in prompts:

```
@.opencode/agent/bmad-master
```

Or use workflow commands if they're exposed through your configuration:

```
/bmad-workflow-name
```

### 3. Access BMAD Resources

Your `opencode.jsonc` includes instructions that point to:

- **Core configuration**: `{project-root}/bmad/core/config.yaml`
- **Agents directory**: `.opencode/agent/`

These are automatically loaded when OpenCode starts.

## Configuration

### Manual Configuration

If you need to customize your `opencode.jsonc`, edit `.opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": ["{project-root}/bmad/core/config.yaml", ".opencode/agent/*.md"],
  // Add your own custom configuration here
  "model": "anthropic/claude-sonnet-4-20250514",
}
```

### Adding Custom Commands

Create command files in `.opencode/command/` or define them in `opencode.jsonc`:

```jsonc
{
  "command": {
    "my-task": {
      "template": "Your prompt template here",
      "description": "Description shown in OpenCode UI",
    },
  },
}
```

## Referencing BMAD Agents

To use a BMAD agent in OpenCode:

1. Use the `@` symbol to reference agent files:

   ```
   @.opencode/agent/agent-name
   ```

2. Or reference through the file directly:

   ```
   Check this agent: @.opencode/agent/bmad-master
   ```

3. OpenCode will load the agent's persona and instructions automatically.

## Using Workflow Commands

If workflows were exported as commands in `.opencode/command/`:

```
/module-workflow-name
```

OpenCode will execute the workflow command template.

## Tips

- **Keep `.opencode/` in Git**: Commit `.opencode/opencode.jsonc` and `.opencode/agent/` to share with your team
- **Project-specific setup**: Each project gets its own `.opencode/` directory, so different projects can have different configurations
- **Run the compiler**: When BMAD is updated, run the compiler to regenerate agents:
  ```bash
  npm run install
  # Select "Compile Agents (Quick rebuild of all agent .md files)"
  ```

## Troubleshooting

### OpenCode not finding agents

Make sure:

1. `.opencode/agent/` exists and contains `.md` files
2. Your `opencode.jsonc` has the correct `instructions` path
3. You're in the project root when starting OpenCode

### Configuration not loading

- Check that `opencode.jsonc` is valid JSON (with or without comments)
- Validate paths use relative notation (`.opencode/...`) or `{project-root}/...`
- Review OpenCode logs for parsing errors

### Agents not showing metadata

Make sure agent `.md` files include proper XML agent blocks with metadata. BMAD ensures this automatically during installation.

## More Information

- [OpenCode Documentation](https://opencode.ai/docs)
- [OpenCode Config Guide](https://opencode.ai/docs/config)
- [OpenCode Commands](https://opencode.ai/docs/commands)
