# Pre-commit Setup

This project uses pre-commit hooks to maintain code quality and consistency.

## What's Included

### Tools

- **ESLint**: TypeScript/JavaScript linting with TypeScript-specific rules
- **Prettier**: Code formatting for consistent style
- **Husky**: Git hooks management
- **lint-staged**: Run linters only on staged files

### Configuration Files

- `.eslintrc.js`: ESLint configuration with TypeScript support
- `.prettierrc.json`: Prettier formatting rules
- `.prettierignore`: Files to exclude from formatting
- `.lintstagedrc.json`: lint-staged configuration
- `.husky/pre-commit`: Pre-commit hook script

## Available Scripts

```bash
# Lint and fix all files
npm run lint

# Check linting without fixing
npm run lint:check

# Format all files
npm run format

# Check formatting without fixing
npm run format:check

# Run pre-commit manually
npm run pre-commit
```

## How Pre-commit Works

When you commit files:

1. Husky intercepts the commit
2. lint-staged runs on staged files only
3. Prettier formats the code
4. If successful, the commit proceeds
5. If there are issues, the commit is blocked

## Customizing Rules

### ESLint Rules

Edit `.eslintrc.js` to modify linting rules:

- Warnings vs errors
- TypeScript-specific rules
- Import/export rules

### Prettier Formatting

Edit `.prettierrc.json` to change formatting:

- Tab width
- Semicolons
- Quote style
- Line length

### Pre-commit Behavior

Edit `.lintstagedrc.json` to change what runs on commit:

- Add/remove tools
- Change file patterns
- Modify command flags

## Troubleshooting

### Skipping Pre-commit (Not Recommended)

```bash
git commit --no-verify -m "message"
```

### Fixing Lint Errors

```bash
# Auto-fix what can be fixed
npm run lint

# Check remaining issues
npm run lint:check
```

### Manual Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```
