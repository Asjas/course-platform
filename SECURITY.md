# Security Policy

## Reporting a Vulnerability

Any security vulnerabilities can be reported via email to
<security@codewizard.training>.

## API Key and Secret Management

This project follows strict security practices for managing API keys and secrets.

### Important Guidelines

1. **Never commit API keys or secrets** to version control
2. **Use environment variables** for all sensitive configuration
3. **Enable GitHub secret scanning** to detect accidental commits
4. **Revoke compromised keys immediately** if leaked

For detailed guidance on managing API keys securely, including:
- How to handle leaked API keys
- Prevention best practices
- Remediation steps
- Tools for secret detection

See: [API Key Security Guide](docs/SECURITY-API-KEYS.md)

## Recent Security Alerts

### Google API Key Detection (December 2025)

A Google API key was detected in a branch of this repository. If you receive a similar alert:

1. **Immediately revoke the key** in Google Cloud Console
2. **Generate a new key** with appropriate restrictions
3. **Follow the remediation guide** in [docs/SECURITY-API-KEYS.md](docs/SECURITY-API-KEYS.md)
4. **Remove the key from git history** using the documented procedures

The key pattern detected: `AIzaSy...` (Google API keys start with this prefix)
