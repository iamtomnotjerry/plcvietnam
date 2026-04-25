# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## 5. Documentation Files (MD) Management

**Only create documentation when it adds lasting value. Avoid documentation bloat.**

### When to Create MD Files

**DO create:**

- `README.md` - Project overview, setup instructions (required)
- `CONTRIBUTING.md` - Contribution guidelines (if open source)
- `BACKEND-INTEGRATION.md` - Backend integration guide (if applicable)
- `docs/` folder - Technical documentation, architecture decisions

**DON'T create:**

- Audit reports after fixes are done (delete after incorporating feedback)
- Multiple versions of the same doc (AUDIT-REPORT.md, AUDIT-COMPARISON.md, etc.)
- "FIXES-COMPLETED.md", "FIXES-SUMMARY.md" - use git commits instead
- "QUICK-REFERENCE.md", "QUICK-START.md" - consolidate into README or main guide
- Temporary analysis files - share findings, then delete

### MD File Lifecycle

1. **Create** - Only when information needs to persist
2. **Update** - Keep existing docs current instead of creating new ones
3. **Consolidate** - Merge duplicate/overlapping docs
4. **Delete** - Remove after information is no longer needed

### Rules for MD Files

- **Maximum 5 MD files in root** (README, CONTRIBUTING, SETUP, BACKEND-INTEGRATION, CLAUDE)
- **Use `docs/` folder** for additional documentation
- **Delete audit/review files** after fixes are implemented
- **Consolidate guides** - one guide per topic, not multiple versions
- **Update existing docs** instead of creating new ones
- **Use git history** for tracking changes, not separate MD files

### Before Creating a New MD File, Ask:

1. Can this information go in an existing file?
2. Will this information be needed in 1 month?
3. Is this a temporary analysis that should be deleted after use?
4. Can this be a code comment instead?

### Cleanup Checklist

When you notice too many MD files:

- [ ] Delete all audit/review files after fixes are done
- [ ] Merge duplicate guides (QUICK-START + README, etc.)
- [ ] Move technical docs to `docs/` folder
- [ ] Keep only essential root-level MD files
- [ ] Update CLAUDE.md if new patterns emerge

**Example of good MD structure:**

```
/
├── README.md                    # Project overview
├── CONTRIBUTING.md              # How to contribute
├── BACKEND-INTEGRATION.md       # Backend setup
├── CLAUDE.md                    # AI guidelines
└── docs/
    ├── ARCHITECTURE.md          # System design
    ├── API.md                   # API documentation
    └── DEPLOYMENT.md            # Deployment guide
```

**Bad example (avoid):**

```
/
├── README.md
├── AUDIT-REPORT.md              # ❌ Delete after fixes
├── AUDIT-COMPARISON.md          # ❌ Delete after fixes
├── PRODUCTION-REVIEW.md         # ❌ Delete after fixes
├── FIXES-COMPLETED.md           # ❌ Use git commits
├── FIXES-SUMMARY.md             # ❌ Use git commits
├── QUICK-START.md               # ❌ Merge into README
├── QUICK-REFERENCE.md           # ❌ Merge into main guide
├── BACKEND-READY-GUIDE.md       # ❌ Consolidate
└── BACKEND-INTEGRATION.md       # ❌ Pick one name
```

---

**Remember:** Documentation is for humans. Too much documentation is worse than too little. Keep it minimal, current, and useful.
