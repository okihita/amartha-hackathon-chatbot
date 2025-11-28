# Git Best Practices for AI Agents

## Commit Message Format

### Structure
```
<type>: <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance tasks
- `build`: Build system or dependencies

### Subject Line Rules
- Use imperative mood ("Add feature" not "Added feature")
- No period at the end
- Maximum 50 characters
- Capitalize first letter

### Body Rules
- Wrap at 72 characters
- Explain WHAT and WHY, not HOW
- Separate from subject with blank line
- Use bullet points for multiple changes

### Footer (Optional)
- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Good Commits

```
feat: Add literacy tracking system to user model

- Add literacy object with week-based scores
- Implement progress calculation methods
- Create factory methods for score management
- Update UserService with literacy methods

Each week stores score (0-100%) and timestamp.
Passing score is 70% or higher.
```

```
fix: Prevent duplicate majelis members

- Add validation in MajelisService.addMember()
- Check if user already belongs to majelis
- Return error message for duplicates

Closes #45
```

```
refactor: Extract database config to separate file

- Move Firestore initialization to config/database.js
- Update all imports to use new config
- Remove duplicate db instances

No functional changes.
```

```
docs: Add user data model specification

- Document literacy tracking structure
- Add factory method examples
- Include API integration guidelines
```

### Bad Commits (Avoid)

```
❌ Update files
❌ Fix bug
❌ WIP
❌ Changes
❌ asdf
❌ Fixed the thing that was broken
```

## Commit Frequency

### When to Commit
- After completing a logical unit of work
- Before switching tasks
- After fixing a bug
- After adding a feature
- Before refactoring

### Atomic Commits
- One logical change per commit
- Should be revertable independently
- All tests should pass

## Branch Strategy

### Branch Naming
```
<type>/<short-description>

Examples:
feat/literacy-tracking
fix/duplicate-members
refactor/solid-architecture
docs/api-documentation
```

### Main Branch
- Always deployable
- Protected from direct pushes
- Requires review (if team)

## File Organization

### What to Commit
- Source code
- Configuration files
- Documentation
- Build scripts
- Package manifests

### What NOT to Commit
- `node_modules/`
- `.env` files
- Build artifacts (`dist/`, `build/`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Logs
- Temporary files

## Rewriting History

### When to Amend
```bash
# Fix last commit message
git commit --amend -m "New message"

# Add forgotten files to last commit
git add forgotten-file.js
git commit --amend --no-edit
```

### When to Rebase
```bash
# Clean up last 3 commits
git rebase -i HEAD~3

# Options:
# pick = keep commit
# reword = change message
# squash = combine with previous
# drop = remove commit
```

### Rules
- Never rewrite public history
- Only rebase unpushed commits
- Use `--force-with-lease` if needed

## AI Agent Specific Guidelines

### Before Committing
1. Run syntax checks: `node -c file.js`
2. Test critical paths
3. Verify no breaking changes
4. Check for leftover debug code

### Commit Message Template
```
<type>: <what changed in 50 chars>

Why this change was needed:
- Reason 1
- Reason 2

What was changed:
- Change 1
- Change 2
- Change 3

Impact:
- Who/what is affected
- Any breaking changes
- Migration steps if needed
```

### Multi-File Changes
Group related changes:
```
refactor: Implement SOLID architecture

Config Layer:
- Extract database.js
- Create constants.js
- Add mockData.js

Core Layer:
- Create User.js entity
- Create Majelis.js entity

Repository Layer:
- Implement UserRepository
- Implement MajelisRepository

Service Layer:
- Implement UserService
- Implement MajelisService

No breaking changes to API.
```

### Documentation Changes
```
docs: Update architecture documentation

- Add SOLID principles explanation
- Document new directory structure
- Include migration guide
- Add usage examples
```

### Bug Fixes
```
fix: Resolve majelis_day sync issue

Problem:
- majelis_day stored in user was stale
- Changes to majelis schedule not reflected

Solution:
- Remove majelis_day from User model
- Fetch schedule from Majelis in real-time
- Update UserService.getUser() to join data

Impact:
- Users always see current schedule
- Reduced data duplication
```

## Review Checklist

Before pushing:
- [ ] Commit message follows format
- [ ] Changes are atomic and focused
- [ ] No sensitive data (keys, passwords)
- [ ] No commented-out code
- [ ] No console.log() for debugging
- [ ] Documentation updated if needed
- [ ] Tests pass (if applicable)
- [ ] No merge conflicts

## Common Patterns

### Feature Addition
```
feat: Add user literacy progress tracking

- Implement week-based score storage
- Add progress calculation methods
- Create API endpoints for score updates
- Update user model with literacy object

Enables tracking of financial literacy course completion.
```

### Bug Fix
```
fix: Prevent null reference in getUserContext

- Add null check before accessing user.majelis_id
- Return early if user not found
- Add error logging

Fixes crash when fetching unregistered user.
```

### Refactoring
```
refactor: Split monolithic db.js into layers

- Extract to repositories (data access)
- Extract to services (business logic)
- Extract to controllers (request handling)
- Update all imports

Improves maintainability and testability.
No functional changes.
```

### Performance
```
perf: Cache majelis data in getAllUsers

- Implement majelis lookup cache
- Reduce N+1 query problem
- Batch fetch majelis data

Reduces API response time from 2s to 200ms.
```

### Breaking Changes
```
feat: Restructure user literacy tracking

BREAKING CHANGE: User model schema changed

Before:
- literacy_score: "Low"

After:
- literacy: { week_01: { score: 0, last_updated: "..." } }

Migration:
- Initialize literacy: {} for existing users
- Remove literacy_score field
- Update frontend to use new structure
```

## Tools

### Useful Commands
```bash
# View commit history
git log --oneline --graph --all

# Check what will be committed
git diff --staged

# Amend last commit
git commit --amend

# Interactive rebase
git rebase -i HEAD~3

# Show file changes
git show <commit-hash>

# Search commits
git log --grep="literacy"

# Show who changed what
git blame <file>
```

### Aliases (Optional)
```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"
```

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
