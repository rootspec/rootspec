I have an existing specification using RootSpec
{{OLD_VERSION}}. I want to upgrade to {{TARGET_VERSION}}.

Please read the updated 00.SPEC_FRAMEWORK.md and CHANGELOG.md to understand
what has changed.

My specification is located in: {{SPEC_DIR}}

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
   - Read CHANGELOG.md between {{OLD_VERSION}} and {{TARGET_VERSION}}
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
   - Ensure it follows {{TARGET_VERSION}} rules from 00.SPEC_FRAMEWORK.md
   - Check reference hierarchy compliance
   - Verify all cross-references work
   - Confirm no content was lost

5. **Update Version References**
   After migration, ensure all version references are updated:
   - `00.SPEC_FRAMEWORK.md` - replace with new version from rootspec package
{{#IF HAS_CONFIG}}
   - `.rootspecrc.json` - update `version` field to {{TARGET_VERSION}}
{{/IF}}
{{#IF HAS_PACKAGE}}
   - `package.json` - update rootspec dependency to {{TARGET_VERSION}}
{{/IF}}

Walk me through each step with specific changes for each file.
