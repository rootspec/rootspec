I have an existing Cypress setup and want to integrate RootSpec's test generation system.

Please help me merge the RootSpec Cypress templates with my existing configuration.

## My Current Cypress Files

Please read these files:
{{#EACH CYPRESS_FILES}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_CYPRESS_FILES}}(No Cypress files found){{/IF}}

## RootSpec Templates

Please fetch and read ALL of these template files:
- https://raw.githubusercontent.com/rootspec/rootspec/main/templates/cypress.config.ts
- https://raw.githubusercontent.com/rootspec/rootspec/main/templates/cypress/support/e2e.ts
- https://raw.githubusercontent.com/rootspec/rootspec/main/templates/cypress/support/schema.ts
- https://raw.githubusercontent.com/rootspec/rootspec/main/templates/cypress/support/steps.ts
- https://raw.githubusercontent.com/rootspec/rootspec/main/templates/cypress/e2e/by_priority.cy.ts
- https://raw.githubusercontent.com/rootspec/rootspec/main/templates/cypress/e2e/by_journey.cy.ts
- https://raw.githubusercontent.com/rootspec/rootspec/main/templates/cypress/e2e/by_system.cy.ts

## What I Need

1. **Merge cypress.config.ts**: Add RootSpec tasks (loginAs, seedItem, resetDatabase, log) while keeping my existing configuration
2. **Merge cypress/support/e2e.ts**: Add global hooks and console capture without breaking my existing setup
3. **Add new files**: Add schema.ts, steps.ts, and the test generators to my cypress directory
4. **Update paths**: Adjust YAML story paths for my project structure

Please provide the merged/new files, explaining what was added and why.
