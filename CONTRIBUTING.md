# Contributing to RootSpec

Thanks for your interest. RootSpec is a small, open project — contributions are welcome.

## Ways to Contribute

- **Bug reports** — [open an issue](https://github.com/rootspec/rootspec/issues/new/choose) using the Bug Report template.
- **Feature requests** — open a Feature Request issue. For larger ideas, start a [Discussion](https://github.com/rootspec/rootspec/discussions) first.
- **Questions** — use the Question issue template or a Discussion.
- **Documentation, examples, skill improvements** — PRs welcome.

## Security

Do **not** open a public issue for security vulnerabilities. See [SECURITY.md](SECURITY.md).

## Before You Start

1. Check existing issues to avoid duplicates.
2. For anything beyond a small fix, open an issue or discussion first — saves rework.
3. Read [`CLAUDE.md`](CLAUDE.md) and [`00.FRAMEWORK.md`](00.FRAMEWORK.md) before proposing structural changes.
4. Remember the core principle: **philosophy guides implementation, never vice versa**. The five-level hierarchy (philosophy → truths → interactions → systems → implementation) is load-bearing. Higher levels constrain lower; lower levels never constrain higher.

## Development Setup

```bash
git clone https://github.com/rootspec/rootspec.git
cd rootspec

# Activate commit hooks (conventional-prefix + changelog check)
git config core.hooksPath .githooks
```

RootSpec's primary artifacts are the skills in `skills/` and the spec in `rootspec/` (self-hosted product spec). There's no build step.

## Pull Request Workflow

1. **Fork** and create a branch from `main`.
2. **Make your changes** following the conventions below.
3. **Validate locally**:
   - Framework changes: `./scripts/release.sh <next-patch> --dry-run` to sanity-check the release flow.
   - Skill changes: try the skill against a demo in `rootspec/demos`.
4. **Open the PR** against `main`. The PR template will prompt for the rest.
5. **Wait for review.** First-time contributor CI runs require manual approval — this is intentional.

## Commit Conventions

All commits use conventional prefixes, enforced by the pre-commit hook:

| Prefix      | Use                                      | CHANGELOG entry required |
| ----------- | ---------------------------------------- | ------------------------ |
| `feat:`     | New feature                              | Yes                      |
| `fix:`      | Bug fix                                  | Yes                      |
| `chore:`    | Maintenance, cleanup                     | No                       |
| `docs:`     | Documentation only                       | No                       |
| `refactor:` | Code restructure, no behavior change     | No                       |
| `style:`    | Formatting, whitespace                   | No                       |
| `test:`     | Test additions/changes                   | No                       |
| `release:`  | Version bumps (release script only)      | No                       |

In-flight changes that require a CHANGELOG entry go under `## [Unreleased]` in `CHANGELOG.md`. The release script promotes `[Unreleased]` to a version heading at release time — don't do that yourself.

To bypass the CHANGELOG check for a `feat:`/`fix:` that genuinely doesn't need one: `SKIP_CHANGELOG_CHECK=1 git commit ...`.

## Code of Conduct

Be kind. Assume good faith. No harassment, discrimination, or personal attacks. Disagreements about technical direction are welcome — make them about the work, not the person.

## Licensing & Sign-off

By submitting a pull request, you agree your contribution is licensed under the same terms as the project (see [LICENSE](LICENSE)). No CLA is required.

## Release Process

*For maintainers only.* See `scripts/release.sh` — it handles version bumps, CHANGELOG promotion, tagging, and GitHub release creation. Do not bump versions manually.

## Questions?

Open a [Discussion](https://github.com/rootspec/rootspec/discussions) or ping on an issue.
