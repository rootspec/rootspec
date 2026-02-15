I have a complete specification following RootSpec v4.5.0.

Please read 00.SPEC_FRAMEWORK.md to understand the framework structure.

## My Specification

**Location:** {{SPEC_DIR}}/

**Level 3 Interaction Architecture:**
{{#IF L3_EXISTS}}
✅ Found at: {{SPEC_DIR}}/03.INTERACTION_ARCHITECTURE.md
{{/IF}}
{{#IF_NOT L3_EXISTS}}
⚠️  No Level 3 Interaction Architecture found
Please ensure you have Level 3 specification before deriving analytics
{{/IF_NOT}}

**Interaction Patterns found:**
{{#EACH INTERACTION_PATTERNS}}
- {{ITEM}}
{{/EACH}}
{{#IF_NOT INTERACTION_PATTERNS}}
(No interaction patterns found - ensure L3 has interaction loops documented)
{{/IF_NOT}}

## What I Need

Extend an **Analytics Event Taxonomy** from my Level 3 Interaction Architecture.

The output should include:
1. **Event catalog** - All trackable events organized by interaction scale
2. **Event naming conventions** - Consistent naming based on L3 pattern terminology
3. **Event properties** - Parameters extended from loop states and conditions
4. **Journey milestones** - Key transition points across interaction scales
5. **Edge case events** - Tracking for failure modes and error conditions

## Instructions

### PHASE 1: ANALYZE INTERACTION ARCHITECTURE

Read `{{SPEC_DIR}}/03.INTERACTION_ARCHITECTURE.md`:

1. **Extract interaction loops:**
   - List all loops and patterns documented
   - Note loop entry points, actions, exit conditions
   - Identify state transitions within loops

2. **Map multi-scale architecture:**
   - Immediate scale (seconds): Single actions, feedback
   - Session scale (minutes): Connected actions, flows
   - Extended scale (days/weeks): Cross-session behavior
   - Lifetime scale (ongoing): Product relationship evolution

3. **Identify edge cases:**
   - Failure modes documented
   - Error conditions
   - Recovery patterns
   - Boundary conditions

4. **Note loop parameters:**
   - What data drives loops? (inputs, conditions, thresholds)
   - What states exist within loops?
   - What decisions/branches occur?

5. **Present your analysis:**
   - List all interaction loops by scale
   - Map key state transitions
   - Identify trackable decision points
   - Note failure modes

Wait for confirmation before proceeding to Phase 2.

### PHASE 2: MAP LOOPS TO EVENT SEQUENCES

For each interaction loop, define event sequence:

**Loop-to-Event Mapping Format:**

```markdown
### Pattern: [Pattern Name from L3]

**Source:** @spec_source 03.INTERACTION_ARCHITECTURE.md#[section-name]

**Scale:** [Immediate | Session | Extended | Lifetime]

**Loop Structure:**
- Entry: [Entry trigger/condition]
- Actions: [Steps in loop]
- Exit: [Exit condition/outcome]

**Event Sequence:**

1. **Entry Event:** `[pattern]_started`
   - Trigger: [When this event fires]
   - Properties:
     - `pattern_name`: "[pattern]"
     - `entry_trigger`: "[trigger type]"
     - [Other context properties]

2. **Action Events:** `[pattern]_[action]`
   - For each action in loop:
     - Event name: `[pattern]_[action]`
     - Properties: [State data during action]

3. **Exit Event:** `[pattern]_completed` | `[pattern]_failed`
   - Success: `[pattern]_completed`
     - Properties: [Outcome data]
   - Failure: `[pattern]_failed`
     - Properties: [Failure reason, state at failure]

**Example Event Payload:**
```json
{
  "event": "[pattern]_started",
  "timestamp": "ISO 8601",
  "user_id": "string",
  "session_id": "string",
  "properties": {
    "pattern_name": "[pattern]",
    "entry_trigger": "[trigger]",
    "[custom_property]": "[value]"
  }
}
```
```

**Requirements:**
- Event names use L3 pattern terminology (don't invent names)
- Event properties extend from loop states and parameters
- Entry/action/exit events for complete loop tracking
- Success and failure paths both tracked

### PHASE 3: ORGANIZE BY INTERACTION SCALE

Group events by time scale from L3:

**Event Catalog by Scale:**

```markdown
## Event Catalog

**Source:** @spec_source Extended from 03.INTERACTION_ARCHITECTURE.md multi-scale architecture

### Immediate Events (Seconds)
**Patterns:** Single actions, instant feedback

| Event Name | Pattern Source | Trigger | Properties | Scale |
|------------|----------------|---------|------------|-------|
| input_focused | Input Pattern | User clicks field | field_id, field_type | Immediate |
| feedback_shown | Feedback Pattern | Action completed | feedback_type, duration | Immediate |
| ... | ... | ... | ... | ... |

### Session Events (Minutes)
**Patterns:** Connected actions, flows

| Event Name | Pattern Source | Trigger | Properties | Scale |
|------------|----------------|---------|------------|-------|
| flow_started | [L3 Flow Pattern] | User enters flow | flow_name, entry_point | Session |
| flow_completed | [L3 Flow Pattern] | Flow finished | flow_name, duration, steps_count | Session |
| ... | ... | ... | ... | ... |

### Extended Events (Days/Weeks)
**Patterns:** Cross-session behavior

| Event Name | Pattern Source | Trigger | Properties | Scale |
|------------|----------------|---------|------------|-------|
| user_returned | Return Pattern | User login | days_since_last, session_count | Extended |
| milestone_reached | Progress Pattern | Threshold crossed | milestone_name, total_progress | Extended |
| ... | ... | ... | ... | ... |

### Lifetime Events (Ongoing)
**Patterns:** Product relationship evolution

| Event Name | Pattern Source | Trigger | Properties | Scale |
|------------|----------------|---------|------------|-------|
| relationship_deepened | Engagement Pattern | Behavior change | relationship_level, indicators | Lifetime |
| pattern_established | Habit Pattern | Regular behavior detected | pattern_type, frequency | Lifetime |
| ... | ... | ... | ... | ... |
```

**Requirements:**
- Events grouped by scale match L3 architecture
- Each event traces to specific L3 pattern
- Properties reflect state data from L3 loops
- Scale assignment matches L3 duration definitions

### PHASE 4: DEFINE EVENT NAMING CONVENTIONS

Establish naming rules based on L3 patterns:

**Event Naming Conventions:**

```markdown
## Event Naming Conventions

**Source:** @spec_source Based on terminology from 03.INTERACTION_ARCHITECTURE.md

### Naming Structure

**Format:** `[pattern]_[action]` or `[object]_[action]`

**Rules:**
1. Use L3 pattern names as prefixes (e.g., if L3 has "Reward Loop", use `reward_`)
2. Use past tense for completed actions (e.g., `submitted`, `completed`, `failed`)
3. Use present tense for state events (e.g., `loading`, `processing`)
4. Be consistent across similar patterns

**Examples from L3 Patterns:**
- Pattern: [L3 Pattern Name] → Events: `[pattern]_started`, `[pattern]_action`, `[pattern]_completed`
- Pattern: [L3 Pattern Name] → Events: `[pattern]_started`, `[pattern]_action`, `[pattern]_completed`

### Event Categories

**User Actions:**
- Format: `[object]_[verb]ed`
- Example: `button_clicked`, `form_submitted`, `page_viewed`

**System States:**
- Format: `[system]_[state]`
- Example: `auth_loading`, `reward_calculating`, `data_syncing`

**Journey Milestones:**
- Format: `[journey]_[milestone]`
- Example: `onboarding_started`, `onboarding_completed`, `feature_discovered`

**Edge Cases:**
- Format: `[pattern]_failed` or `[object]_error`
- Example: `login_failed`, `payment_error`, `timeout_occurred`

### Property Naming

**Standard Properties (all events):**
- `timestamp`: ISO 8601 timestamp
- `user_id`: User identifier
- `session_id`: Session identifier
- `platform`: web | mobile | desktop

**Context Properties:**
- `screen`: Current screen/page
- `journey`: Active journey name (from L3)
- `priority`: mvp | post_mvp (from user stories)

**Pattern-Specific Properties:**
- Extended from L3 loop states
- Use snake_case
- Match L3 terminology
```

**Requirements:**
- Naming convention uses L3 terminology
- Rules are consistent and predictable
- Standard properties defined
- Pattern-specific properties extended from L3

### PHASE 5: DEFINE EVENT PROPERTIES

For each event, specify properties from L3:

**Event Property Specification:**

```markdown
## Event Properties

**Source:** @spec_source Extended from loop states and parameters in 03.INTERACTION_ARCHITECTURE.md

### Event: [event_name]

**Pattern Source:** [L3 Pattern Name]

**Standard Properties:**
| Property | Type | Description | Required |
|----------|------|-------------|----------|
| timestamp | ISO 8601 | Event occurrence time | Yes |
| user_id | string | User identifier | Yes |
| session_id | string | Session identifier | Yes |
| platform | enum | web, mobile, desktop | Yes |

**Context Properties:**
| Property | Type | Description | Required | Source |
|----------|------|-------------|----------|--------|
| screen | string | Current screen/page | Yes | User journey |
| journey | string | Active journey name | No | L3 journey |
| priority | enum | mvp, post_mvp | No | User stories |

**Pattern-Specific Properties:**
| Property | Type | Description | Required | L3 Source |
|----------|------|-------------|----------|-----------|
| [property_name] | [type] | [Description from L3 loop state] | [Yes/No] | [L3 section] |
| [property_name] | [type] | [Description from L3 parameter] | [Yes/No] | [L3 section] |

**Example Payload:**
```json
{
  "event": "[event_name]",
  "timestamp": "2024-01-15T14:30:00Z",
  "user_id": "user_123",
  "session_id": "session_456",
  "platform": "web",
  "properties": {
    "screen": "/dashboard",
    "journey": "onboarding",
    "[custom_property]": "[value from L3]"
  }
}
```
```

**Requirements:**
- Properties extend from L3 loop states
- No invented properties (must trace to L3)
- Types and requirements explicit
- Example payload shows actual usage

### PHASE 6: IDENTIFY JOURNEY MILESTONES

Map key transition points across scales:

**Journey Milestones Format:**

```markdown
## Journey Milestones

**Source:** @spec_source Extended from multi-scale transitions in 03.INTERACTION_ARCHITECTURE.md

### Milestone: [Milestone Name]

**Transition:** [From Scale] → [To Scale]
**Pattern:** [L3 Pattern that defines this transition]

**Milestone Event:** `[journey]_[milestone]_reached`

**Significance:**
- Marks transition from [scale] to [scale]
- Indicates [user behavior change]
- Aligned with [L3 pattern description]

**Properties:**
- `milestone_name`: "[milestone]"
- `previous_state`: "[state before milestone]"
- `new_state`: "[state after milestone]"
- `time_to_milestone`: [duration since journey start]
- [Other properties from L3]

**Examples:**
1. **Onboarding → Active User**
   - Event: `onboarding_completed`
   - Transition: Session scale → Extended scale
   - Indicates: User has completed initial setup

2. **Active User → Power User**
   - Event: `power_user_milestone_reached`
   - Transition: Extended scale → Lifetime scale
   - Indicates: Sustained engagement pattern established
```

**Requirements:**
- Milestones extend from L3 scale transitions
- Clearly mark scale boundaries
- Properties capture transition context
- Aligned with L3 journey definitions

### PHASE 7: EDGE CASE AND ERROR EVENTS

Track failure modes from L3:

**Edge Case Events Format:**

```markdown
## Edge Case Events

**Source:** @spec_source Extended from failure modes in 03.INTERACTION_ARCHITECTURE.md

### Pattern: [L3 Pattern Name]

**Failure Modes from L3:**

1. **Failure Mode:** [Failure described in L3]
   - Event: `[pattern]_failed`
   - Trigger: [Condition from L3]
   - Properties:
     - `failure_reason`: "[reason from L3]"
     - `state_at_failure`: "[loop state when failed]"
     - `recovery_available`: boolean
   - L3 Source: [L3 section/line]

2. **Error Condition:** [Error described in L3]
   - Event: `[object]_error`
   - Trigger: [Condition]
   - Properties:
     - `error_type`: "[type]"
     - `error_message`: "[user-facing message]"
     - `error_code`: "[internal code]"
   - L3 Source: [L3 section/line]

### Recovery Pattern Events

If L3 documents recovery patterns:

- Event: `[pattern]_recovery_started`
- Event: `[pattern]_recovery_completed`
- Properties: [From L3 recovery pattern]
```

**Requirements:**
- Error events extend from L3 failure modes
- Don't invent errors not in L3
- Include recovery tracking if L3 documents it
- Properties capture diagnostic context

### PHASE 8: TRACEABILITY MATRIX

Link events back to L3 patterns:

**Traceability Matrix:**

| Event Name | Category | L3 Pattern | L3 Section | Scale | Priority |
|------------|----------|------------|------------|-------|----------|
| flow_started | User Action | [Pattern] | [Section] | Session | MVP |
| milestone_reached | Journey | [Pattern] | [Section] | Extended | MVP |
| [event] | [Category] | [Pattern] | [Section] | [Scale] | [Priority] |

**Requirements:**
- Every event traces to L3 pattern
- L3 section reference explicit
- Scale matches L3 multi-scale architecture
- Priority if applicable (MVP/POST_MVP)

## Output Format

Generate a single Analytics Event Taxonomy document:

```markdown
# Analytics Event Taxonomy

**Generated from:** RootSpec v4.5.0 specification
**Generated on:** [Date]
**Source:** {{SPEC_DIR}}/03.INTERACTION_ARCHITECTURE.md

## 1. Event Catalog

### Immediate Events (Seconds)
[Events for immediate-scale patterns]

### Session Events (Minutes)
[Events for session-scale patterns]

### Extended Events (Days/Weeks)
[Events for extended-scale patterns]

### Lifetime Events (Ongoing)
[Events for lifetime-scale patterns]

## 2. Event Naming Conventions

[Naming rules and categories]

## 3. Event Property Specifications

### Standard Properties (All Events)
[Common properties across all events]

### Pattern-Specific Properties
[Properties by pattern/event type]

## 4. Journey Milestones

[Key transition points across scales]

## 5. Edge Case Events

[Failure modes and error tracking]

## 6. Traceability Matrix

[Table linking events to L3 patterns]

## 7. Implementation Notes

**Event Count by Scale:**
- Immediate: [count] events
- Session: [count] events
- Extended: [count] events
- Lifetime: [count] events

**Implementation Guidance:**
- Use consistent event tracking library
- Ensure all standard properties captured
- Respect user privacy (no PII in properties)
- Buffer events for offline scenarios

**Next Steps:**
- Choose analytics platform (e.g., PostHog, Mixpanel, Amplitude)
- Implement event tracking wrapper
- Set up event validation schema
- Create analytics dashboards
- Define metrics from events (separate from taxonomy)
```

## Validation Checklist

Before delivering the Analytics Event Taxonomy, verify:

- [ ] All L3 patterns have corresponding events
- [ ] Event names use L3 terminology (not invented)
- [ ] Properties extend from L3 loop states
- [ ] Events organized by L3 multi-scale architecture
- [ ] Journey milestones mark scale transitions
- [ ] Edge case events trace to L3 failure modes
- [ ] Every event has `@spec_source` annotation
- [ ] Traceability matrix complete
- [ ] Naming conventions consistent
- [ ] No metrics definitions (this is taxonomy only, not measurement)
- [ ] Standard properties defined
- [ ] Privacy considerations noted

---

**Note:** This is an event TAXONOMY (what to track), not a metrics definition (how to measure). Every event must extend from Level 3 Interaction Architecture. Don't invent events that aren't grounded in documented patterns. If tracking seems needed but L3 doesn't support it, note as a gap in the spec.
