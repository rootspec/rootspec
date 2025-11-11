# Migrate Specification to Newer Framework Version

Complete prompt for upgrading your specification to a newer version of the Hierarchical Specification Framework.

## Prerequisites

- [ ] Existing specification using an older framework version
- [ ] Downloaded new version of `00.SPEC_FRAMEWORK.md`
- [ ] Read CHANGELOG.md to understand what changed
- [ ] Backup of your current specification

## When to Use This Prompt

Use this prompt when:

- A new major version of the framework is released (e.g., v2.x → v3.0)
- You want to adopt new framework features
- You need to ensure compatibility with updated tooling

## The Prompt

```
I have an existing specification using Hierarchical Specification Framework
v[OLD_VERSION]. I've updated 00.SPEC_FRAMEWORK.md to v3.0.0.

Please read the updated 00.SPEC_FRAMEWORK.md and CHANGELOG.md to understand
what has changed.

My current specification structure:
[Paste your current file structure or describe your spec]

## MIGRATION STRATEGY

Use the appropriate strategy based on version change:

### For Major Version Upgrades (e.g., v2.0 → v3.0)

**Strategy:** Methodical file-by-file migration

1. Review CHANGELOG.md for breaking changes
2. Create new files in new format alongside old files
3. Migrate content section by section
4. Validate new files
5. Delete old files once migration is complete

### For Minor Version Upgrades (e.g., v3.0 → v3.1)

**Strategy:** Incremental additions

1. Review CHANGELOG.md for new features
2. Add new optional sections to existing files
3. Validate updated files

## VERSION-SPECIFIC MIGRATION PATHS

### Migrating from v2.x → v3.0 (YAML User Stories)

**Major changes:**
- User story files: `.md` → `.yaml`
- Add test DSL structure
- Set up Cypress templates

**Migration steps:**
1. Copy Cypress templates to project
2. Convert each markdown user story to YAML format
3. Add given/when/then test specifications to each story
4. Add `data-test` attributes to application code
5. Implement Cypress tasks for test setup/teardown
6. Run generated tests to validate conversion

**Example conversion:**

From markdown:
```
# User Story: Complete Task

As a user, I want to mark tasks as complete...

## Acceptance Criteria
- Task shows completed state
- Completion time is recorded
```

To YAML:
```yaml
story: "As a user, I want to mark tasks complete, so that I can track progress"
system: TASK_SYSTEM
priority: MVP
test:
  given: "I have an incomplete task"
  when: "I mark the task as complete"
  then: "The task shows completed state"
```

### Migrating from v1.x → v2.0 (Design Pillars)

**Major changes:**
- File rename: `01.FIRST_PRINCIPLES.md` → `01.FOUNDATIONAL_PHILOSOPHY.md`
- Add Design Pillars section

**Migration steps:**
1. Rename Level 1 file to `01.FOUNDATIONAL_PHILOSOPHY.md`
2. Extract 3-5 Design Pillars from existing mission/principles
3. Add Design Pillar sections with proper structure:
   - Pillar name
   - Emotional statement
   - Explanation
   - User perspective
   - Examples
4. Search all files for references to old filename and update
5. Validate new structure

## MIGRATION EXECUTION

Help me migrate my specification by:

1. **Identify Breaking Changes**
   - Read CHANGELOG.md between v[OLD_VERSION] and v3.0.0
   - List all breaking changes that affect my spec
   - Highlight critical changes that require immediate attention

2. **Create Migration Plan**
   - Files that need to be renamed
   - New sections that need to be added (based on 00.SPEC_FRAMEWORK.md)
   - Structural changes required
   - Cross-references that need updating

3. **Execute Migration**
   - Apply the version-specific migration path from above
   - Convert file formats as needed
   - Add new required sections
   - Update all cross-references

4. **Validate Migrated Spec**
   - Ensure it follows v3.0.0 rules from 00.SPEC_FRAMEWORK.md
   - Check reference hierarchy compliance
   - Verify all cross-references work
   - Confirm no content was lost

Walk me through each step with specific changes for each file.
```

## Tips for Working with AI on Migration

1. **Don't rush** - Take time to understand what changed
2. **Test incrementally** - Validate each file as you migrate it
3. **Keep backups** - Maintain original files until migration is complete
4. **Update cross-references** - Search for all references to renamed files
5. **Use validation prompt** - Run validation after migration

## Expected Outcome

- All specification files updated to new framework version
- New features adopted (e.g., YAML user stories, Design Pillars)
- Validation passing
- Cross-references updated

## Next Steps

After migration:
1. Run [validate-spec.md](validate-spec.md) to ensure compliance
2. Review with team to ensure content integrity
3. Update any custom tooling to work with new format
4. Archive old version for reference
