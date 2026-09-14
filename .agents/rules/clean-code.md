---
trigger: always_on
---

# Clean Code Rules (both frontend and backend)

> Backend-only rules — logger moments and payloads, `AppError`, `DomainError`, tuples, method and return shape — live in the `backend-common-style-guide` skill, not here. This file holds only what applies to **both** `api/` and `web/`.

- **"If it needs a comment, it needs a refactor."** — zero comments except JSDoc on public APIs
- No `console.log` or debug code in committed code
- No commented-out code
- No TODOs or FIXMEs
- No magic numbers or strings — extract to named constants/enums
- Early returns and guard clauses; no `else` after a `return`
- **Never use inline `if` statements** — always use a block with `{ }`, even for single-line bodies. This applies to all layers (services, strategies, repositories, controllers, etc.)
- **Avoid ternary expressions for logic** — when a branch involves a function call, side effect, or could need logging later, use `let` + `if` block instead. Ternaries reduce readability and make it harder to add logging or extra logic later. **Exceptions**: short, self-evident value selection is fine — use `??` or `||` for fallback values (`value ?? default`, `a || b`), and a ternary is acceptable when both branches are simple scalar values and the condition is a single boolean check (e.g. `isActive ? 'enabled' : 'disabled'`).

```typescript
// ❌ avoid — ternary with logic / function calls
const result = isValid ? this.service.process(data) : this.service.fallback(data);

// ✅ correct — use if block when branches have logic
let result;
if (isValid) {
  result = this.service.process(data);
} else {
  result = this.service.fallback(data);
}

// ✅ ok — simple scalar selection
const label = isActive ? 'enabled' : 'disabled';

// ✅ ok — nullish/fallback shorthand
const name = user.name ?? 'Anonymous';
const timeout = config.timeout || DEFAULT_TIMEOUT;
```
- **Blank lines are the author's call — never a review finding.** Group related statements when that reads better (a run of variable declarations is fine packed together) and separate them when it does not. There are too many legitimate shapes for a rule to be worth enforcing, and oxfmt already collapses runs of blank lines. Do not raise spacing in a review, and do not let a style guide check it.
- Max 2 nesting levels
- Extract complex logic to separate functions
- No logic duplication (DRY) — any code pattern that appears more than once must be extracted into a named function; applies to expressions, conditionals, object constructions, and loops alike
- No anonymous inline data — arrays and objects with semantic meaning must be assigned to a named `const` before use (e.g. `const band_values = [row.band_1, ...]`, never pass inline)
- No one-liners with chained calls — when a single expression chains 2+ function calls (`Object.fromEntries(Array.from(...))`), break it into named steps: one `const` per intermediate result
- **Three or more array iterations inside one method are one loop written in passes**: when a method needs `.map`, `.filter`, `.includes` and friends three or more times to build a single value, replace them with one `for...of` and plain conditionals; each pass re-reads the array and hides the one decision being made
- Cyclomatic complexity per function stays at or under 20, enforced by oxlint as `complexity`. A function above it is doing more than one job, so split it by extracting the branch that has its own name
- Never return a computed expression directly — assign it to a named `const` first, then return that name. The name is the author's choice: `result` is the default when nothing better fits, but `sorted_keys` or `total` says more. What the rule asks for is one named thing returned, not a particular word
- Repeated complex types must be aliased — if a type like `Record<string, number>` appears more than once, define a named alias (e.g. `type BandDistribution = Record<string, number>`) and use the alias everywhere
- Repeated expressions within a single method must be extracted to a `private static` method with a descriptive name — this applies even to simple expressions (e.g. `Math.max(a ?? 0, b ?? 0)` appearing twice); inline repetition is never acceptable regardless of expression size
- Helper functions that are only used by one class must be `private static` methods of that class — do not pollute the module scope with functions that are implementation details of a single class
> `typescript/no-extraneous-class` suggests the opposite ("Try using standalone functions instead of static methods"). The guide wins: the lint is **off** for `src/app/{factories,entities,mappers}/**` and `src/types/mappers/**` in `api/.oxlintrc.json` (`FAC-02`, `MAP-06`, `ENT-12`), except for `*SQL.ts`. Outside those folders the exemption is per file, not per folder — `src/app/helpers/azure/base.js` is the only entry today, and a helper or event class that needs it gets its own. A `private static` **inside a class that has state never triggers the lint** — the two rules only collide when the whole class has no instance member.
- Simplest solution (KISS)
- No speculative code for future requirements (YAGNI)
- **Accumulation uses `reduce`, not `forEach` with an external accumulator** — never mutate an array declared outside the loop; build and return a new array (immutable return)
- No `any` types, no `@ts-ignore`
- **Named params for calls with more than 3 arguments** — when a function call passes more than 3 values, extract them into a named `const` before the call. Name it by **role**: `params` for a caller's **input** object (services, controllers, mappers); `payload` for an object **serialized outward** — the `toPersistence` result, the repository write object, a queue message (and `req.payload`, the request accessor). **Never name a caller's input `payload`.** Never pass more than 3 inline arguments directly.
> Backend method **signatures** — how many parameters a method declares, and whether it destructures them — are `BE-13` and `BE-14` in the `backend-common-style-guide` skill. The rule above is about **call sites**, and applies to both `api/` and `web/`.

```typescript
// ✅ correct — service / controller / mapper
const params = { organization_id, company_id, sector_id, workstation_id };
const result = await this.service.findAll(params);

// ✅ correct — repository write
const payload = { title, company_id, sector_id, status, due_date };
await this.model.create(payload, { transaction });

// ❌ wrong — more than 3 inline arguments
const result = await this.service.findAll(organization_id, company_id, sector_id, workstation_id);
```

---

# Security

- No secrets, tokens, API keys, or credentials in code
- No hardcoded passwords or connection strings — use env vars
- `.gitignore` is configured for sensitive files
- No overly permissive file permissions
