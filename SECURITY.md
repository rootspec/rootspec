# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 4.0.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Reporting a Vulnerability

We take the security of RootSpec seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Where to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

**rootspec-security@example.com**

(Replace with actual email address)

### What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., command injection, path traversal, etc.)
- **Full paths of source file(s)** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it

This information will help us triage your report more quickly.

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Assessment**: We will send you a more detailed response within 5 business days indicating the next steps
- **Communication**: We will keep you informed about the progress towards a fix and announcement
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

### Security Update Process

When we receive a security bug report, we will:

1. **Confirm the problem** and determine affected versions
2. **Audit code** to find similar problems
3. **Prepare fixes** for all supported versions
4. **Release new versions** as soon as possible
5. **Publish a security advisory** on GitHub

### Disclosure Policy

We follow a coordinated disclosure process:

1. Security issue is reported privately
2. Issue is confirmed and a fix is prepared
3. A new version is released with the fix
4. A security advisory is published

We kindly ask that you:

- Give us reasonable time to fix the issue before public disclosure
- Make a good faith effort to avoid privacy violations, data destruction, and service interruption
- Do not exploit the vulnerability beyond what is necessary to demonstrate the issue

### Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit a security issue you discover for any reason beyond validating the vulnerability
- Report any vulnerability you've discovered promptly

We will not pursue legal action against researchers who follow this policy.

## Security Best Practices for Users

When using RootSpec:

### 1. Keep Up to Date

Always use the latest version of RootSpec:

```bash
npm update -g rootspec
```

### 2. Review Generated Files

Review AI-generated specification files before committing them to your repository, especially if they contain sensitive information.

### 3. Validate Input

When using RootSpec prompts with AI assistants, be careful not to include sensitive information (API keys, passwords, etc.) in your project context.

### 4. File Permissions

Ensure proper file permissions on your specification files and configuration:

```bash
chmod 644 spec/*.md
chmod 600 .rootspecrc.json  # If it contains sensitive paths
```

### 5. Use .gitignore

Make sure sensitive files are not committed to version control. RootSpec's default .gitignore should handle this, but always verify.

## Known Security Considerations

### Command Execution

RootSpec CLI executes shell commands for:

- Opening prompts in browser (with `-o` flag)
- This uses platform-specific commands (`open`, `xdg-open`, `start`)

These commands only execute with user-provided flags and do not accept arbitrary input.

### File System Operations

RootSpec reads and writes files to:

- User-specified spec directory (default: `./spec`)
- Cypress configuration and templates (when using `rootspec cypress`)
- Configuration file (`.rootspecrc.json`)

All file operations are restricted to explicitly specified paths and do not follow symbolic links outside the project directory.

### Template Rendering

RootSpec uses a custom template engine to fill prompts with project context. This engine:

- Only reads files from the project directory
- Does not execute code in template variables
- Escapes output to prevent injection attacks

## Questions?

If you have questions about this security policy, please open a [Discussion](https://github.com/rootspec/rootspec/discussions) or contact the maintainers.

---

**Last Updated**: 2025-11-21
**Version**: 1.0
