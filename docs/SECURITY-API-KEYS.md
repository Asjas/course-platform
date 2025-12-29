# API Key Security Guide

## Overview

This document provides guidelines for securely managing API keys and secrets in the course platform project, including how to prevent accidental commits and how to remediate leaked secrets.

## Google API Key Security Alert

### Current Status
- ✅ **Current branch (`copilot/add-google-api-integration`) is clean** - No API keys present
- ⚠️ A Google API key was detected in another branch (security alert)

### Flagged API Key
```
AIzaSyBqJZh-7pA44blAaAkH6490hUFOwX0KCYM
```

**Important:** This key has been publicly exposed and should be considered compromised.

## Immediate Remediation Steps

If an API key has been committed to a branch:

### 1. Revoke the Compromised Key
- **Immediately revoke the exposed key** in Google Cloud Console
- Go to: https://console.cloud.google.com/apis/credentials
- Find the compromised key and delete/regenerate it
- ⚠️ **Do NOT reuse a leaked key** - it must be revoked

### 2. Generate a New Key
- Create a new API key in Google Cloud Console
- Set appropriate restrictions:
  - **API restrictions**: Limit to only the APIs you need
  - **Application restrictions**: Limit to your domain/IP addresses
  - **Usage quotas**: Set reasonable limits

### 3. Remove from Git History
If the key was committed to git, you must remove it from history:

```bash
# Option 1: For recent commits on a feature branch
git rebase -i HEAD~N  # where N is the number of commits to review
# In the editor, mark the commit with the key for editing
# Remove the key from the file, then continue:
git add .
git rebase --continue
git push --force-with-lease origin <branch-name>

# Option 2: Using git-filter-repo (recommended for complex cases)
# Install: pip install git-filter-repo
git filter-repo --invert-paths --path <file-with-key>

# Option 3: Using BFG Repo-Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

⚠️ **Warning:** Rewriting git history affects all collaborators. Coordinate with your team before force-pushing.

### 4. Update Environment Variables
Store the new key securely:

```bash
# For local development
echo "GOOGLE_API_KEY=your-new-key-here" >> apps/server/.env

# For production (use secrets manager)
# - AWS Secrets Manager
# - Azure Key Vault
# - Google Secret Manager
# - HashiCorp Vault
```

## Prevention: Best Practices

### 1. Use Environment Variables
**Never hardcode API keys in source code.**

```typescript
// ❌ BAD - Hardcoded key
const apiKey = "AIzaSyBqJZh-7pA44blAaAkH6490hUFOwX0KCYM";

// ✅ GOOD - Environment variable
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY environment variable is required");
}
```

### 2. Add to .env Files (Already Configured)
Our `.gitignore` already excludes:
- `.env`
- `.env.local`
- `.env.*.local`

Always use `.env` files for secrets:

```bash
# apps/server/.env
GOOGLE_API_KEY=your-api-key-here
GOOGLE_MAPS_API_KEY=another-key-here
```

### 3. Use .env.sample for Documentation
Provide templates without actual values:

```bash
# apps/server/.env.sample
GOOGLE_API_KEY=""
GOOGLE_MAPS_API_KEY=""
```

### 4. Pre-commit Hooks
We use Husky for pre-commit hooks. Consider adding secret detection:

```bash
# Install gitleaks for secret scanning
# Add to package.json devDependencies
pnpm add -D -w gitleaks

# Update .husky/pre-commit to include:
pnpm run check-secrets
```

### 5. GitHub Secret Scanning
Enable GitHub secret scanning (already enabled for public repos):
- Settings → Security & analysis → Secret scanning
- Configure alerts for exposed secrets
- Set up notification channels

## Configuration Best Practices

### Local Development
```bash
# 1. Copy sample environment files
cp apps/server/.env.sample apps/server/.env
cp apps/web/.env.sample apps/web/.env

# 2. Fill in your local development keys
# Edit apps/server/.env with your actual keys

# 3. Verify .env is gitignored
git check-ignore apps/server/.env
# Should output: apps/server/.env
```

### Production Deployment
**Never commit production secrets to git.**

Use a secrets management service:

#### AWS Secrets Manager
```typescript
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });
const response = await client.send(
  new GetSecretValueCommand({ SecretId: "prod/google-api-key" })
);
const apiKey = response.SecretString;
```

#### Environment Variables (Docker/Kubernetes)
```yaml
# docker-compose.yml
services:
  server:
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    env_file:
      - .env.production  # Not committed to git!

# kubernetes secret
apiVersion: v1
kind: Secret
metadata:
  name: api-keys
type: Opaque
stringData:
  GOOGLE_API_KEY: "your-key-here"
```

## API Key Restrictions (Google Cloud)

Always configure restrictions on your Google API keys:

### 1. Application Restrictions
- **HTTP referrers** (for web apps)
  ```
  https://yourdomain.com/*
  https://*.yourdomain.com/*
  ```
- **IP addresses** (for server-side apps)
  ```
  203.0.113.0/24
  ```

### 2. API Restrictions
Limit to only the APIs you use:
- ✅ Maps JavaScript API
- ✅ Geocoding API
- ❌ (disable all others)

### 3. Usage Quotas
Set reasonable daily quotas to limit damage if key is compromised:
- Example: 10,000 requests per day
- Set up billing alerts

## Incident Response Checklist

If an API key is leaked:

- [ ] **Immediately revoke the compromised key** in the provider's console
- [ ] **Generate a new key** with appropriate restrictions
- [ ] **Update all services** using the old key
- [ ] **Remove key from git history** using appropriate tools
- [ ] **Force push** to update remote repository (coordinate with team)
- [ ] **Notify team members** to pull the cleaned branch
- [ ] **Review access logs** for unauthorized usage
- [ ] **Check billing/usage** for unexpected costs
- [ ] **Update documentation** to prevent recurrence
- [ ] **Conduct post-mortem** to improve processes

## Tools for Secret Detection

### Pre-commit Scanning
- **gitleaks**: https://github.com/gitleaks/gitleaks
- **detect-secrets**: https://github.com/Yelp/detect-secrets
- **git-secrets**: https://github.com/awslabs/git-secrets

### Repository Scanning
- **GitHub Secret Scanning**: Built-in (public repos)
- **GitHub Advanced Security**: For private repos
- **TruffleHog**: https://github.com/trufflesecurity/trufflehog
- **GitGuardian**: https://www.gitguardian.com/

### IDE Plugins
- **GitLens** (VS Code): Highlights potential secrets
- **SonarLint**: Detects security issues in real-time

## Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Google Cloud: API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [OWASP: Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App: Config](https://12factor.net/config)

## Questions?

If you have questions about API key security, contact:
- Security team: security@codewizard.training
- See also: [SECURITY.md](../SECURITY.md)
