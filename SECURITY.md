# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 7.3.x   | :white_check_mark: |
| < 7.3   | :x:                |

## Reporting a Vulnerability

We take the security of RootSpec seriously. **Please do NOT report security vulnerabilities through public GitHub issues.**

### How to Report

Use GitHub's **Private Vulnerability Reporting**:

**→ https://github.com/rootspec/rootspec/security/advisories/new**

This keeps the report private, notifies maintainers directly, and lets us collaborate with you on a coordinated fix and disclosure.

### What to Include

- **Type of vulnerability** (e.g., command injection, path traversal)
- **Full paths of source file(s)** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce
- **Proof-of-concept or exploit code** (if possible)
- **Impact**, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: within 72 hours
- **Assessment**: initial triage within 7 days
- **Communication**: updates as we investigate and patch
- **Credit**: we'll credit you in the security advisory unless you prefer to remain anonymous

### Disclosure Policy

We follow coordinated disclosure:

1. Issue is reported privately
2. Issue is confirmed and a fix is prepared
3. A new version is released with the fix
4. A public security advisory is published

We ask that you give us reasonable time to fix the issue before public disclosure, avoid privacy violations and service disruption, and do not exploit the vulnerability beyond what is necessary to demonstrate it.

### Safe Harbor

We will not pursue legal action against researchers who:

- Make a good faith effort to avoid privacy violations, data destruction, and service interruption
- Only interact with accounts they own or with explicit permission of the account holder
- Do not exploit a security issue for any purpose beyond validating the vulnerability
- Report discovered vulnerabilities promptly

## Security Best Practices for Users

### Keep Up to Date

Always use the latest version:

```bash
npx skills add rootspec/rootspec
```

### Review Generated Files

Review AI-generated specification files before committing, especially if they may contain sensitive context.

### Don't Leak Secrets via Prompts

When using RootSpec skills with AI assistants, avoid including API keys, passwords, or other secrets in your project context.

## Known Security Considerations

### Command Execution

RootSpec scripts (e.g. `scripts/release.sh`) execute shell commands such as `git`, `gh`, and `npm`. These run only via explicit user invocation and do not accept untrusted input.

### File System Operations

RootSpec reads and writes files within the project directory — spec files, `CONVENTIONS/`, and `05.IMPLEMENTATION/` artifacts. No symlinks are followed outside the project root.

## Questions?

For non-security questions about this policy, open a [Discussion](https://github.com/rootspec/rootspec/discussions).

---

**Last Updated**: 2026-04-23
