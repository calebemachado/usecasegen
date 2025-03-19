# Branch Naming Conventions

This repository follows strict branch naming conventions to maintain a clean and organized codebase.

## Branch Name Format

All branch names should follow this format:

```
<type>/<description>
```

Where:

- `<type>` is the type of change (see below)
- `<description>` is a brief description of the change (use hyphens for spaces)

## Branch Types

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `hotfix/` - Urgent fixes for production
- `chore/` - Maintenance tasks, refactoring, etc.
- `docs/` - Documentation updates
- `test/` - Adding or updating tests
- `release/` - Release branches (typically with version numbers)

## Examples

Good branch names:

- `feature/user-authentication`
- `fix/login-validation`
- `hotfix/security-vulnerability`
- `chore/refactor-error-handling`
- `docs/update-readme`
- `test/add-unit-tests`
- `release/v1.2.0`

Bad branch names:

- `my-branch` (missing type prefix)
- `feature-login` (incorrect format, missing slash)
- `fix/very_long_branch_name_with_excessive_details` (too long)

## How to Rename a Branch

If you need to rename your branch:

```bash
# If you're on the branch you want to rename
git branch -m <new-name>

# If you're on a different branch
git branch -m <old-name> <new-name>

# If you've already pushed the branch
git push origin -u <new-name>
git push origin --delete <old-name>
```

## Enforcement

These naming conventions are enforced through Git hooks. If you try to create a branch with an invalid name, you'll receive an error message.
