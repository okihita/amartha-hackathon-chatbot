# Git Best Practices

## Commit Format

```
<type>: <subject>

<body>

<footer>
```

### Types
`feat`, `fix`, `refactor`, `docs`, `style`, `perf`, `test`, `chore`, `build`

### Rules
- Imperative mood ("Add" not "Added")
- No period at end
- Max 50 chars for subject
- Capitalize first letter
- Wrap body at 72 chars
- Explain WHAT and WHY, not HOW

## Examples

### Good
```
feat: add literacy tracking system to user model

- Add literacy object with week-based scores
- Implement progress calculation methods
- Create factory methods for score management

Each week stores score (0-100%) and timestamp.
Passing score is 70% or higher.
```

```
fix: prevent duplicate majelis members

- Add validation in MajelisService.addMember()
- Check if user already belongs to majelis
- Return error message for duplicates

Closes #45
```

### Bad
```
❌ Update files
❌ Fix bug
❌ WIP
❌ Changes
```

## Branch Naming

```
<type>/<short-description>

Examples:
feat/literacy-tracking
fix/duplicate-members
refactor/solid-architecture
```

## Rewriting History

```bash
# Amend last commit
git commit --amend -m "New message"

# Clean up last 3 commits
git rebase -i HEAD~3

# Force push (use with caution)
git push --force-with-lease
```

**Rules**:
- Never rewrite public history
- Only rebase unpushed commits

## Review Checklist

- [ ] Commit message follows format
- [ ] Changes are atomic
- [ ] No sensitive data
- [ ] No commented code
- [ ] No debug console.log()
- [ ] Documentation updated
- [ ] Tests pass
- [ ] No merge conflicts

## Useful Commands

```bash
git log --oneline --graph --all
git diff --staged
git commit --amend
git rebase -i HEAD~3
git log --grep="literacy"
```
