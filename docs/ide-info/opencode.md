# BMAD Method - OpenCode Instructions

## Activating Agents

BMAD agents are installed in `.opencode/agent/` as markdown files and auto-discovered by OpenCode.

### How to Use

1. **Reference in Chat**: Use `@{agent-name}`
2. **Switch Agents**: Press **Tab** key during session
3. **List Agents**: Run `/agents` command

### Examples

```
@bmad-master - Activate master agent
@pm help me plan this feature - Quick reference by shorthand
```

### Workflow Commands

```
/module-workflow-name
```

### Notes

- Agents auto-load from `.opencode/agent/` on startup
- Workflows auto-load from `.opencode/command/` on startup
- Configuration in `.opencode/opencode.jsonc` includes core BMAD instructions
- Commit `.opencode/` to Git to share with team
- Re-run installer after BMAD updates to regenerate agents
