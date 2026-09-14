---
trigger: always_on
---

# Code Style

## Formatting — oxfmt (both api and web)

Configured in `api/.oxfmtrc.json` and `web/.oxfmtrc.json`:

- `printWidth`: 120
- `singleQuote`: true
- `semi`: true
- `trailingComma`: none
- `arrowParens`: always

- **After editing any backend file, always run `yarn format` inside `api/`** — this runs `oxfmt --write ./src ./__tests__` and must be done before considering the task complete.
- The web equivalent is `yarn format` inside `web/`, which runs `oxfmt --write ./src`.
- oxfmt does **not** sort imports in this repo — `sortImports` is off in both configs, and its schema has no line-length ordering mode. The import order below is enforced separately.

## TypeScript
- **API**: strict mode OFF (`noImplicitAny: false`), path alias `@src/*`
- **ZERO `any` types** — no exceptions
- **ZERO `@ts-ignore`** — no exceptions
- Always add explicit types to function parameters and return types
- **Every new file inside `src/` or `__tests__/` is `.ts`** — `.tsx` when it carries JSX. `.js` exists here only as legacy: a `.js` file that is merely being updated stays `.js`, and migrating it to TypeScript is a separate change, through the `tdd-refactor` skill. Migrations and seeders are the one exception, below
- **Migrations and seeders are `.cjs`** — `sequelize-cli` `require`s them while `api/package.json` is `"type": "module"`, so any other extension resolves as an ES module and never hands over its `module.exports`. They stay out of the `.ts` rule above

## Import paths
- **API — always use the absolute alias.** A relative path (`../`, `./`) to an internal module is a violation. Use `@src/` (e.g. `@src/app/mappers/PsychosocialReport/HSEResultDashboardMapper`)
- **Web — prefer the absolute alias `@/`** (e.g. `@/infra/services/psychosocial-report`). A relative import is a warning, not a violation: it stays acceptable between files of the same component or feature folder (`./Header`, `./styles`), where the folder is the unit that moves together
- Omit the file extension when using path aliases

## Naming conventions

| Context | Convention |
|---|---|
| Backend variables/functions | `snake_case` |
| Backend classes | `PascalCase` |
| Backend constants | `UPPER_SNAKE_CASE` |
| Backend files | `kebab-case.ts` — controllers, services, repositories, middlewares, schemas, routes, factories, queues |
| Backend files in `mappers/`, `models/`, `entities/`, `errors/` | `PascalCase.ts` — file name must match the exported class name (e.g. `WorstSecondsExtractor.ts` for `class WorstSecondsExtractor`). Acronyms keep their casing: `ISO11228Report.ts`, `GetEWAScoreScaleSQL.ts` |
| Backend files in `enums/` | `PascalCase.ts` — an enum exports no class, so here only the casing is checked. Acronyms keep their casing: `AI.ts`, `ISO11228Report.ts` |
| Backend booleans | `is_`, `has_`, `should_`, `can_` prefix. **Does not apply to a name the backend does not own**: a persisted column, a query parameter, or a field of the request or response contract the frontend already sends. There the name mirrors the contract, and renaming it in the internal types only desyncs the two ends (`all_selected`, `processed`, `image_use_accepted`) |

## Naming for tuple destructure

When destructuring a `[result, error]` tuple from a repository or service call,
name the second variable by this rule:

- **Single tuple in the method → name it `error`.** Keep it simple.
- **2+ tuples in the same scope → name each `err_<first_var_name>`** to disambiguate. Update the destructure, the `if` condition, and the `logger.error` payload consistently.

```js
// single error in scope → `error`
const [survey, error] = await this.repository.findOneSurvey({ survey_id });

// 2+ tuples coexist → `err_<first_var_name>`
const [survey, err_survey] = await this.repository.findOneSurvey({ survey_id });
const [rows, err_rows] = await this.repository.findAllSurveys({ survey_id });
```

Never `survey_error`, `e`, or a vague custom name.

---

### Test helper shape

In a test helper or seed file under `api/__tests__/integration/helpers/`, every `type` and `interface` declaration comes first, before any constant or function: the reader learns the shapes once at the top and then reads the data that uses them.

---

## Import Order

**Import order is not a rule here, and no review should raise it.** Grouping imports by kind, sorting them by line length, or sorting the identifiers inside a block are all changes a reader never benefits from, and flagging them buries the findings that matter. Put an import wherever it reads naturally.

What *is* a rule is where a module is imported **from** — see "Import paths" above and the barrel rules below.

### Barrel exports and import grouping
- Every folder that contains more than one exported file **must** have an `index.ts` (or `index.js`) that re-exports all public symbols from that folder
- When importing multiple symbols from the same folder, **always** use a single grouped import from the folder's `index` — never one import per file
- ✅ `import { FooMapper, BarMapper } from '@src/app/mappers/PsychosocialReport'`
- ❌ `import { FooMapper } from '@src/app/mappers/PsychosocialReport/FooMapper'` + separate `import { BarMapper } from '@src/app/mappers/PsychosocialReport/BarMapper'`
- **New entries in barrel/index files must always be appended at the end of the file** — never inserted in the middle or at the top
