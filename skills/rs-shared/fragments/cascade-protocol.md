# Cascade Protocol

After completing changes to any spec level, inform the developer of downstream impact.

## Cascade Prompt

Present this after writing changes to Level N:

```
Changes to Level {N} may affect downstream levels {N+1} through 5.

1. Review next level now → /rs-level {N+1}
2. Skip — handle downstream later
3. Show what might need changing (read-only)
```

## Rules

- Cascade is ALWAYS developer-initiated. Never automatically rewrite downstream levels.
- If the developer chooses option 3 (read-only), read each downstream file and list sections that may need revision, but do NOT edit them.
- If the developer chooses option 1, suggest they invoke `/rs-level {N+1}` to start the next level.
- L5 is the terminal level — no cascade prompt after L5 changes.

## Impact Heuristics

- **L1 changes** → likely affect ALL downstream levels (L2-L5)
- **L2 changes** → likely affect L3-L5
- **L3 changes** → likely affect L4-L5
- **L4 changes** → likely affect L5 only
- **L5 changes** → no downstream impact
