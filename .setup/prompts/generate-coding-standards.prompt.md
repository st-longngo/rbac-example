---
description: "Analyze codebase code style and generate a coding standards document. Detects conventions, finds inconsistencies, and establishes enforceable standards."
agent: "agent"
---

# Coding Standards Generator

Analyze the codebase to establish coding standards. If multiple files or a folder is passed, aggregate and analyze as a single dataset.

**Output**: `docs/coding-standards.md`

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `findInconsistencies` | `true` | Detect and report style inconsistencies |
| `fixInconsistencies` | `true` | Auto-fix inconsistencies (disabled for multi-file/folder input) |
| `fetchStyleGuides` | `true` | Reference official language style guides |

## Instructions

### 1. Detection

- Auto-detect languages and frameworks from the codebase
- Analyze indentation, quotes, semicolons, trailing commas, line length, brace style
- Identify naming conventions for files, functions, variables, types, constants
- Detect import organization, module patterns, export styles

### 2. Find Inconsistencies

Count occurrences of competing patterns (e.g., single vs double quotes, tabs vs spaces). Flag minority patterns with file locations.

### 3. Reference Style Guides

Fetch the relevant official style guide for detected languages:

| Language | Guide |
|----------|-------|
| TypeScript | https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html |
| JavaScript | https://www.w3schools.com/js/js_conventions.asp |
| Python | https://peps.python.org/pep-0008/ |
| Go | https://github.com/golang-standards/project-layout |
| Rust | https://github.com/rust-lang/rust/tree/HEAD/src/doc/style-guide/src |
| C# | https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions |
| Java | https://coderanch.com/wiki/718799/Style |
| Ruby | https://rubystyle.guide/ |
| CSS | https://cssguidelin.es/ |
| SQL | https://www.sqlstyle.guide/ |
| Shell | https://google.github.io/styleguide/shellguide.html |

### 4. Output Standards Document

```markdown
# Coding Standards

## 1. General Principles
- Clarity over brevity
- Small, focused functions with single responsibility
- No dead code — remove unused imports, variables, functions

## 2. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | [detected] | [example] |
| Functions | [detected] | [example] |
| Variables | [detected] | [example] |
| Constants | [detected] | [example] |
| Types/Interfaces | [detected] | [example] |
| Components | [detected] | [example] |

## 3. Formatting
- Indentation, line length, encoding, brace style, trailing commas, semicolons, quote style

## 4. Comments & Documentation
- Explain *why*, not *what*
- Public APIs: describe purpose and parameters
- Tags: TODO, FIXME, NOTE with owner

## 5. Error Handling
- Handle explicitly — no silent failures
- Typed errors where possible
- Clean up resources on failure

## 6. Testing Standards
- Test new functionality
- Deterministic tests (seed randomness)
- Readable assertions over abstractions

## 7. Git & Code Review
- One logical change per commit
- Clear messages: 50 char summary + context body
- Small, focused PRs
```
