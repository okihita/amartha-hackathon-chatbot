# Contributing Guidelines

Thank you for contributing to Amartha WhatsApp Chatbot! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow project standards

## Development Workflow

### 1. Fork and Clone

```bash
git clone <your-fork-url>
cd wa-chatbot-gcp-ai
git remote add upstream <original-repo-url>
```

### 2. Create Branch

Use descriptive branch names following this pattern:

```bash
# Feature
git checkout -b feat/user-authentication

# Bug fix
git checkout -b fix/webhook-timeout

# Documentation
git checkout -b docs/api-examples

# Refactor
git checkout -b refactor/db-queries
```

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes

```bash
# Run locally
npm start

# Test endpoints
curl http://localhost:8080/health

# Check logs
# Look for errors or warnings
```


### 5. Commit Changes

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <subject>

# Examples:
git commit -m "feat(bot): add voice message support"
git commit -m "fix(db): handle null user context"
git commit -m "docs(api): add pagination examples"
git commit -m "refactor(ai): optimize prompt generation"
git commit -m "test(webhook): add integration tests"
```

**Commit Types**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code formatting
- `refactor` - Code restructuring
- `perf` - Performance improvement
- `test` - Adding tests
- `chore` - Maintenance tasks

### 6. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference related issues
- Screenshots (if UI changes)
- Test results

## Code Style Guide

### JavaScript

```javascript
// ✅ Good
async function getUserProfile(phoneNumber) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  try {
    const user = await db.collection('users').doc(cleanPhone).get();
    return user.exists ? user.data() : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

// ❌ Bad
function getUser(phone){
const p=phone.replace(/\D/g,'')
return db.collection('users').doc(p).get().then(u=>u.data())
}
```

**Rules**:
- Use `async/await` over promises
- Use descriptive variable names
- Add error handling
- Use `const` by default, `let` when needed
- No `var`
- Use template literals for strings
- Add JSDoc comments for functions

### File Organization

```javascript
// 1. Imports
const express = require('express');
const { getUserContext } = require('./db');

// 2. Constants
const PORT = process.env.PORT || 8080;
const MAX_MESSAGE_LENGTH = 1000;

// 3. Helper functions
function validateInput(text) {
  // ...
}

// 4. Main functions
async function processMessage(message) {
  // ...
}

// 5. Exports
module.exports = { processMessage };
```

### Naming Conventions

```javascript
// Variables and functions: camelCase
const userName = 'Ibu Siti';
function getUserProfile() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = 'https://api.example.com';

// Classes: PascalCase
class UserManager {}

// Files: kebab-case
// user-manager.js, image-analyzer.js
```

## Testing Guidelines

### Manual Testing Checklist

Before submitting PR:

- [ ] Code runs without errors
- [ ] All endpoints return expected responses
- [ ] Dashboard loads correctly
- [ ] WhatsApp messages work
- [ ] No console errors
- [ ] Logs are clean
- [ ] Documentation updated

### Test Scenarios

Test these flows:
1. New user registration
2. Existing user conversation
3. Image upload and analysis
4. Dashboard user management
5. Majelis creation and member assignment
6. Error handling (invalid input, API failures)

## Documentation Standards

### Code Comments

```javascript
// ✅ Good: Explain WHY, not WHAT
// Validate input to prevent spam and malicious content
if (!validateInput(text)) {
  return "Invalid message";
}

// ❌ Bad: Obvious comment
// Check if text is valid
if (!validateInput(text)) {
  return "Invalid message";
}
```

### Function Documentation

```javascript
/**
 * Register a new user in the system
 * 
 * @param {string} phoneNumber - User's phone number (e.g., "628567881764")
 * @param {Object} data - User registration data
 * @param {string} data.name - User's name
 * @param {string} data.business_type - Type of business
 * @param {string} data.location - City or village
 * @returns {Promise<Object|null>} User object or null if failed
 */
async function registerNewUser(phoneNumber, data) {
  // Implementation
}
```

### README Updates

When adding features, update:
- Feature list
- API endpoints
- Configuration options
- Examples

## Pull Request Guidelines

### PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(bot): add savings goal tracker
fix(dashboard): resolve member autocomplete bug
docs(setup): add Docker Compose instructions
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Tested on staging
- [ ] All tests pass

## Screenshots (if applicable)
[Add screenshots]

## Related Issues
Closes #123
```

### Review Process

1. Automated checks run (linting, tests)
2. Code review by maintainer
3. Address feedback
4. Approval and merge

## Common Issues and Solutions

### Issue: Firestore permission denied

```javascript
// Solution: Check security rules and authentication
// Ensure service account has proper permissions
```

### Issue: Webhook timeout

```javascript
// Solution: Respond to webhook immediately
app.post('/webhook', async (req, res) => {
  res.sendStatus(200); // Respond first
  await processMessage(req.body); // Process async
});
```

### Issue: Memory leak

```javascript
// Solution: Clean up resources
const chat = model.startChat();
// Use chat
chat = null; // Clean up when done
```

## Release Process

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- `1.0.0` → `1.0.1` (patch: bug fix)
- `1.0.0` → `1.1.0` (minor: new feature)
- `1.0.0` → `2.0.0` (major: breaking change)

### Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md`
- [ ] Test all features
- [ ] Update documentation
- [ ] Create git tag
- [ ] Deploy to production
- [ ] Announce release

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Security**: Email maintainers directly
- **Documentation**: Check `/docs` folder

## Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Mentioned in release notes
- Credited in documentation

Thank you for contributing! 🎉
