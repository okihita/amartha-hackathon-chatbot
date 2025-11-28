# Git Commit Standards

## Commit Message Format

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
Must be one of:
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools
- **ci**: CI/CD configuration changes

### Scope (optional)
The scope should be the name of the affected module:
- `db` - Database related
- `api` - API endpoints
- `dashboard` - Dashboard UI
- `bot` - WhatsApp bot logic
- `ai` - AI engine/Gemini integration
- `auth` - Authentication/verification

### Subject
- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period (.) at the end
- Maximum 50 characters

### Body (optional)
- Use imperative, present tense
- Include motivation for the change
- Contrast with previous behavior
- Wrap at 72 characters

### Footer (optional)
- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Good Commits
```
feat(bot): add user registration via WhatsApp

Implement tool calling for registerUser function.
Users can now provide name, business type, and location
to register in the system.

Closes #45
```

```
fix(db): handle async Firestore operations

Convert all database functions to async/await to properly
handle Firestore promises.
```

```
feat(dashboard): add vanilla HTML admin interface

Replace Next.js dashboard with simple HTML/CSS/JS for
easier maintenance and faster deployment.
```

```
chore: migrate from in-memory to Firestore database

- Add @google-cloud/firestore dependency
- Update all db functions to async
- Enable Firestore in GCP project
```

### Bad Commits (Avoid)
```
❌ update stuff
❌ fix bug
❌ WIP
❌ asdfasdf
❌ Fixed the thing that was broken
```

## Rules
1. Always write meaningful commit messages
2. One logical change per commit
3. Commit often, push when stable
4. Never commit sensitive data (API keys, tokens)
5. Test before committing
