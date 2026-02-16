I have an existing {{#IF FRAMEWORK}}{{FRAMEWORK}} {{/IF}}project and want to adopt the RootSpec framework.

Please help me create my specification by reverse-engineering from my codebase.

## My Project Structure

**Source directories:**
{{#EACH SOURCE_DIRS}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_SOURCE_DIRS}}(No common source directories detected){{/IF}}

**Configuration files:**
{{#EACH CONFIG_FILES}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_CONFIG_FILES}}(None detected){{/IF}}

**Framework/Stack:** {{#IF FRAMEWORK}}{{FRAMEWORK}}{{/IF}}{{#IF NO_FRAMEWORK}}(Not detected){{/IF}}

**Specification directory:** {{SPEC_DIR}}/

## RootSpec Framework

Please fetch the framework definition:
https://raw.githubusercontent.com/rootspec/rootspec/main/00.SPEC_FRAMEWORK.md

## What I Need

Please analyze my codebase and help me create specification files in {{SPEC_DIR}}/:

1. **{{SPEC_DIR}}/01.FOUNDATIONAL_PHILOSOPHY.md**
   - Research competitors in this space (web search if needed)
   - Identify table stakes features (what baseline features exist?)
   - Infer pain points being solved (what does the code avoid/improve?)
   - Identify influences from architecture/UX patterns
   - Infer mission and design pillars from the product
2. **{{SPEC_DIR}}/02.STABLE_TRUTHS.md** - Document core strategies and mental models
3. **{{SPEC_DIR}}/03.INTERACTION_ARCHITECTURE.md** - Map user journeys and behavioral loops
4. **{{SPEC_DIR}}/04.SYSTEMS/** - Document technical systems and their interactions
5. **{{SPEC_DIR}}/05.IMPLEMENTATION/** - Extract key implementation details

**Approach:** {{ADOPTION_APPROACH}}

Please read my source code to understand the product, then guide me through creating each level of the specification.
