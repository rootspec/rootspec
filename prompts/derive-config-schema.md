I have a complete specification following RootSpec v4.4.1.

Please read 00.SPEC_FRAMEWORK.md to understand the framework structure.

## My Specification

**Location:** {{SPEC_DIR}}/

**Fine-Tuning Files (from 05.IMPLEMENTATION/FINE_TUNING/):**
{{#EACH FINE_TUNING_FILES}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_FINE_TUNING}}
⚠️  No Fine-Tuning files found
Please ensure you have Level 5 FINE_TUNING YAML files before deriving schema
{{/IF}}

## What I Need

Derive **JSON Schema** from my Level 5 Fine-Tuning parameters.

The output should include:
1. **JSON Schema v7 definitions** - One schema per FINE_TUNING file
2. **Validation rules** - From `@constraints` annotations
3. **Type definitions** - Inferred from YAML values (string, number, boolean, object, array)
4. **Field descriptions** - From `@rationale` annotations
5. **Traceability metadata** - From `@spec_source` annotations

## Instructions

### PHASE 1: READ FINE_TUNING FILES

Read all YAML files in `{{SPEC_DIR}}/05.IMPLEMENTATION/FINE_TUNING/`:

1. **Parse YAML structure:**
   - Note top-level keys and nesting
   - Identify value types (number, string, boolean, object, array)
   - Map object properties and array items

2. **Extract comment annotations:**
   - Parse `@annotation: value` syntax
   - Build metadata index: key → annotations
   - Note all annotation types (`@rationale`, `@constraints`, `@spec_source`, etc.)

3. **Identify validation rules:**
   - Find all `@constraints` annotations
   - Parse constraint syntax (e.g., `min=1, max=100, type=integer`)
   - Note required fields (non-null values)

4. **Present your analysis:**
   - List all YAML files with key counts
   - Show sample structure for each file
   - List annotations found per file
   - Note any nested objects or arrays

Wait for confirmation before proceeding to Phase 2.

### PHASE 2: INFER TYPE DEFINITIONS

For each parameter, determine JSON Schema type:

**Type Inference Rules:**

```markdown
## Type Inference

**Source:** @spec_source Inferred from YAML values in {{SPEC_DIR}}/05.IMPLEMENTATION/FINE_TUNING/

### Primitive Types

**Number:**
- YAML value is numeric: `10`, `3.14`, `0.05`
- `@constraints: type=integer` → `type: "integer"`
- `@constraints: type=float` → `type: "number"`
- Default: `type: "number"`

**String:**
- YAML value is quoted text: `"hello"`, `"2024-01-15"`
- Check for format hints in `@constraints`
- `@constraints: format=date-time` → `format: "date-time"`
- `@constraints: format=email` → `format: "email"`

**Boolean:**
- YAML value is true/false: `true`, `false`
- Type: `"boolean"`

### Complex Types

**Object:**
- YAML value has nested keys:
  ```yaml
  points:
    base: 10
    multiplier: 1.5
  ```
- Type: `"object"`
- Properties: Map each nested key recursively

**Array:**
- YAML value is list:
  ```yaml
  colors: [red, blue, green]
  ```
- Type: `"array"`
- Items: Infer item type from first element or `@constraints`

### Example Type Mapping

| YAML Value | Inferred Type | JSON Schema Type |
|------------|---------------|------------------|
| `10` | Integer | `{"type": "integer"}` |
| `3.14` | Float | `{"type": "number"}` |
| `"hello"` | String | `{"type": "string"}` |
| `true` | Boolean | `{"type": "boolean"}` |
| `{a: 1}` | Object | `{"type": "object", "properties": {...}}` |
| `[1, 2, 3]` | Array of integers | `{"type": "array", "items": {"type": "integer"}}` |
```

**Requirements:**
- Infer types from actual YAML values
- Use `@constraints` type hints if present
- Recurse for nested objects/arrays
- No type invention (derive from data)

### PHASE 3: EXTRACT VALIDATION RULES

Parse `@constraints` annotations:

**Validation Rules Format:**

```markdown
## Validation Rules

**Source:** @spec_source From @constraints annotations in FINE_TUNING YAML files

### Numeric Constraints

**From `@constraints: min=X, max=Y`:**
```json
{
  "type": "number",
  "minimum": X,
  "maximum": Y
}
```

**From `@constraints: type=integer`:**
```json
{
  "type": "integer"
}
```

**Example:**
```yaml
# @constraints: min=1, max=100, type=integer
base_points: 10
```
→
```json
{
  "base_points": {
    "type": "integer",
    "minimum": 1,
    "maximum": 100
  }
}
```

### String Constraints

**From `@constraints: minLength=X, maxLength=Y`:**
```json
{
  "type": "string",
  "minLength": X,
  "maxLength": Y
}
```

**From `@constraints: pattern=regex`:**
```json
{
  "type": "string",
  "pattern": "regex"
}
```

**From `@constraints: format=date-time`:**
```json
{
  "type": "string",
  "format": "date-time"
}
```

### Enum Constraints

**From `@alternatives` annotation (if restricted set):**
```yaml
# @alternatives: [5, 10, 20]
# @constraints: enum=[5, 10, 20]
value: 10
```
→
```json
{
  "value": {
    "type": "integer",
    "enum": [5, 10, 20]
  }
}
```

### Required Fields

**Rules:**
- Non-null YAML values → required by default
- Optional fields have `@constraints: required=false`

**Example:**
```yaml
# Required (has value)
base_points: 10

# Optional (null or has @constraints: required=false)
bonus_points: null
# @constraints: required=false
```
```

**Requirements:**
- Constraints ONLY from `@constraints` annotations
- Don't invent constraints not in YAML
- Parse constraint syntax correctly
- Map to JSON Schema validation keywords

### PHASE 4: EXTRACT DESCRIPTIONS

Use `@rationale` and `@spec_source` for documentation:

**Description Format:**

```markdown
## Schema Descriptions

**Source:** @spec_source From @rationale and @spec_source annotations

### Field Descriptions

**From `@rationale`:**
- Use as JSON Schema `description` field
- Summarize why value was chosen
- Keep concise (1-2 sentences)

**Example:**
```yaml
# @rationale: Testing showed optimal engagement at 10 points
base_points: 10
```
→
```json
{
  "base_points": {
    "type": "integer",
    "description": "Testing showed optimal engagement at 10 points"
  }
}
```

### Schema-Level Metadata

**From file-level annotations:**
```yaml
# @spec_version: 1.0.0
# @system: REWARD_SYSTEM
# @spec_source: 04.SYSTEMS/REWARD_SYSTEM.md
```
→
```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "reward_system.schema.json",
  "title": "REWARD_SYSTEM Configuration",
  "description": "Fine-tuning parameters for REWARD_SYSTEM",
  "x-spec-version": "1.0.0",
  "x-spec-source": "04.SYSTEMS/REWARD_SYSTEM.md"
}
```

### Custom Extensions

**For traceability:**
- Use `x-` prefix for custom fields
- `x-spec-source`: Original spec reference
- `x-rationale`: Full rationale text
- `x-inviolable`: If `@inviolable: true`
```

**Requirements:**
- Descriptions from `@rationale` only
- Traceability in `x-spec-source` extensions
- Schema-level metadata from file headers
- Use JSON Schema extension pattern (`x-*`)

### PHASE 5: BUILD JSON SCHEMA

Generate JSON Schema v7 for each file:

**JSON Schema Structure:**

```markdown
## JSON Schema Generation

**Source:** @spec_source Generated from {{SPEC_DIR}}/05.IMPLEMENTATION/FINE_TUNING/

### Schema Template

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "[filename].schema.json",
  "title": "[System Name] Configuration",
  "description": "[Description from file comments]",
  "type": "object",

  "x-spec-version": "[from @spec_version]",
  "x-spec-source": "[from @spec_source]",
  "x-last-updated": "[from @last_updated]",

  "properties": {
    "[parameter_name]": {
      "type": "[inferred type]",
      "description": "[from @rationale]",
      "minimum": "[from @constraints min=]",
      "maximum": "[from @constraints max=]",
      "x-spec-source": "[from @spec_source]",
      "x-rationale": "[full @rationale text]"
    },

    "[nested_object]": {
      "type": "object",
      "properties": {
        "[nested_param]": {
          "type": "[type]",
          "description": "[from @rationale]"
        }
      },
      "required": ["[required fields]"]
    },

    "[array_param]": {
      "type": "array",
      "items": {
        "type": "[item type]"
      },
      "minItems": "[from @constraints]",
      "maxItems": "[from @constraints]"
    }
  },

  "required": ["[list of required parameters]"],

  "additionalProperties": false
}
```

### Example Complete Schema

**From YAML:**
```yaml
# @spec_version: 1.0.0
# @system: REWARD_SYSTEM
# @spec_source: 04.SYSTEMS/REWARD_SYSTEM.md

# @spec_source: 04.SYSTEMS/REWARD_SYSTEM.md:45
points:
  base: 10
  # @rationale: Testing showed optimal engagement at 10 points
  # @constraints: min=1, max=100, type=integer
  # @spec_source: 04.SYSTEMS/REWARD_SYSTEM.md:52

  multiplier: 1.5
  # @rationale: Standard scaling factor
  # @constraints: min=1.0, max=5.0, type=float
```

**Generated Schema:**
```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "reward_system.schema.json",
  "title": "REWARD_SYSTEM Configuration",
  "description": "Fine-tuning parameters for REWARD_SYSTEM",
  "type": "object",

  "x-spec-version": "1.0.0",
  "x-spec-source": "04.SYSTEMS/REWARD_SYSTEM.md",

  "properties": {
    "points": {
      "type": "object",
      "description": "Point calculation parameters",
      "x-spec-source": "04.SYSTEMS/REWARD_SYSTEM.md:45",
      "properties": {
        "base": {
          "type": "integer",
          "description": "Testing showed optimal engagement at 10 points",
          "minimum": 1,
          "maximum": 100,
          "x-spec-source": "04.SYSTEMS/REWARD_SYSTEM.md:52"
        },
        "multiplier": {
          "type": "number",
          "description": "Standard scaling factor",
          "minimum": 1.0,
          "maximum": 5.0
        }
      },
      "required": ["base", "multiplier"]
    }
  },

  "required": ["points"],
  "additionalProperties": false
}
```
```

**Requirements:**
- JSON Schema Draft 7 format
- All constraints from `@constraints` only
- Descriptions from `@rationale`
- Traceability in `x-*` extensions
- `required` array for non-optional fields
- `additionalProperties: false` for strictness

### PHASE 6: VALIDATION EXAMPLES

Provide validation examples:

**Validation Examples Format:**

```markdown
## Validation Examples

**Source:** @spec_source Based on schema constraints

### Valid Configuration

**Passes all constraints:**
```json
{
  "points": {
    "base": 10,
    "multiplier": 1.5
  }
}
```
✅ Valid
- `base` is integer in range [1, 100]
- `multiplier` is number in range [1.0, 5.0]
- All required fields present

### Invalid Configuration Examples

**Missing required field:**
```json
{
  "points": {
    "base": 10
  }
}
```
❌ Invalid: Missing required field `multiplier`

**Value out of range:**
```json
{
  "points": {
    "base": 150,
    "multiplier": 1.5
  }
}
```
❌ Invalid: `base` exceeds maximum of 100

**Wrong type:**
```json
{
  "points": {
    "base": "10",
    "multiplier": 1.5
  }
}
```
❌ Invalid: `base` should be integer, got string
```

**Requirements:**
- Show valid example
- Show multiple invalid examples
- Explain why each fails
- Cover different constraint types

### PHASE 7: SCHEMA ORGANIZATION

Decide schema output structure:

**Schema Organization Options:**

```markdown
## Schema Organization

### Option 1: One Schema Per File

**Structure:**
```
schemas/
  reward_system.schema.json    # From FINE_TUNING/reward_system.yaml
  progress_system.schema.json  # From FINE_TUNING/progress_system.yaml
  ...
```

**Benefits:**
- Matches FINE_TUNING file structure
- Modular validation (validate one system at a time)
- Clear ownership per system

**Use when:** FINE_TUNING files are system-specific

### Option 2: Combined Schema

**Structure:**
```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "$id": "application_config.schema.json",
  "title": "Application Configuration",
  "type": "object",
  "properties": {
    "reward_system": { "$ref": "#/definitions/reward_system" },
    "progress_system": { "$ref": "#/definitions/progress_system" }
  },
  "definitions": {
    "reward_system": { ... },
    "progress_system": { ... }
  }
}
```

**Benefits:**
- Single source of truth
- Cross-system validation
- Easier to maintain

**Use when:** All FINE_TUNING files combine into one config

### Recommendation

**For this project:**
[Recommend based on FINE_TUNING structure]

**Rationale:**
[Why this organization fits the spec]
```

**Requirements:**
- Recommend structure based on actual FINE_TUNING files
- Explain benefits of chosen approach
- Provide example directory structure

### PHASE 8: TRACEABILITY MATRIX

Link schema fields to spec sources:

**Traceability Matrix:**

| Schema File | Parameter | Type | Constraints | Spec Source | System |
|-------------|-----------|------|-------------|-------------|--------|
| reward_system.schema.json | points.base | integer | min=1, max=100 | 04.SYSTEMS/REWARD_SYSTEM.md:52 | REWARD_SYSTEM |
| reward_system.schema.json | points.multiplier | number | min=1.0, max=5.0 | 04.SYSTEMS/REWARD_SYSTEM.md:58 | REWARD_SYSTEM |
| ... | ... | ... | ... | ... | ... |

**Requirements:**
- Every parameter traces to spec
- Constraints documented
- System ownership clear
- L4 source explicit

## Output Format

Generate JSON Schema files and documentation:

```markdown
# JSON Schema Documentation

**Generated from:** RootSpec v4.4.1 specification
**Generated on:** [Date]
**Source:** {{SPEC_DIR}}/05.IMPLEMENTATION/FINE_TUNING/

## 1. Schema Organization

[Explain chosen structure: one-per-file or combined]

## 2. Schema Files

### [schema_name].schema.json

**Source YAML:** 05.IMPLEMENTATION/FINE_TUNING/[filename].yaml
**System:** [System name from @system]

**Schema:**
```json
[Complete JSON Schema]
```

**Parameters:**
- `[param]`: [Description from @rationale]
- `[param]`: [Description]

### [Next schema...]

## 3. Validation Rules Summary

**Numeric Constraints:**
- [param]: min=[X], max=[Y]

**String Constraints:**
- [param]: format=[format]

**Required Fields:**
- [list of required fields]

## 4. Validation Examples

### Valid Examples
[Examples that pass validation]

### Invalid Examples
[Examples that fail with explanations]

## 5. Traceability Matrix

[Table linking parameters to spec sources]

## 6. Implementation Notes

**Using the Schema:**
- Validate config files before deployment
- Use in CI/CD pipeline
- Generate TypeScript types from schema
- Document API contracts

**Schema Validation Libraries:**
- JavaScript: `ajv`, `jsonschema`
- Python: `jsonschema`, `pydantic`
- Go: `gojsonschema`

**Next Steps:**
- Integrate schema validation in build process
- Generate types from schema (e.g., `json-schema-to-typescript`)
- Create config editor with schema-driven UI
- Set up pre-deployment validation
```

---

**Also generate the actual schema files:**

For each FINE_TUNING YAML file, output the complete JSON Schema as a separate code block ready to save to a `.schema.json` file.

## Validation Checklist

Before delivering the JSON Schema documentation, verify:

- [ ] All FINE_TUNING files have corresponding schemas
- [ ] All types inferred from YAML values (not invented)
- [ ] All constraints from `@constraints` only
- [ ] All descriptions from `@rationale`
- [ ] Required fields identified correctly
- [ ] Traceability via `x-spec-source` extensions
- [ ] JSON Schema Draft 7 format
- [ ] Valid JSON (no syntax errors)
- [ ] Validation examples provided
- [ ] Schema organization explained
- [ ] Traceability matrix complete
- [ ] No invented constraints or fields

---

**Note:** This is schema derivation from FINE_TUNING YAML. Every schema element must trace to annotations or values in the YAML files. Validation rules come ONLY from `@constraints` annotations—don't add constraints that aren't documented. If the YAML lacks `@constraints`, the schema should only enforce type, not range or format.
