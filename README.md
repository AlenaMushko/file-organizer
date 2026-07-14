# file-organizer

A Node.js CLI tool to analyze, organize, and clean up directories. It scans file statistics, finds duplicates by content, sorts files into categories, and removes old files safely.

## Requirements

- Node.js 18+ (ES Modules support)

No external npm dependencies are required.

## Installation

```bash
git clone <repository-url>
cd file-organizer
```

Verify the CLI runs:

```bash
node file-organizer.js --help
```

## Quick Start

```bash
# Scan a directory
node file-organizer.js scan ./Downloads

# Find duplicate files
node file-organizer.js duplicates ./Downloads

# Copy and sort files into category folders
node file-organizer.js organize ./Downloads --output ./Organized

# Preview old files (dry run — nothing is deleted)
node file-organizer.js cleanup ./Downloads --older-than 90
```

You can also use npm scripts. Pass arguments after `--`:

```bash
npm run scan -- ./Downloads
npm run duplicates -- ./Downloads
npm run organize -- ./Downloads --output ./Organized
npm run cleanup -- ./Downloads --older-than 90 --confirm
```

## Commands

### `scan`

Recursively scans a directory and prints file statistics: total count and size, breakdown by extension, file age, top 3 largest files, and the oldest file.

```bash
node file-organizer.js scan <directory>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `directory` | Yes | Path to the directory to scan |

**Example:**

```bash
node file-organizer.js scan ~/Downloads
```

---

### `duplicates`

Finds files with identical content using SHA-256 hashes. Groups duplicates and calculates wasted disk space.

```bash
node file-organizer.js duplicates <directory>
```

| Argument | Required | Description |
|----------|----------|-------------|
| `directory` | Yes | Path to the directory to search |

Large files are hashed with streams (`fs.createReadStream`) to avoid loading entire files into memory.

**Example:**

```bash
node file-organizer.js duplicates ~/Downloads
```

---

### `organize`

Copies files from a source directory into a target directory, sorted by category. Original files are **not** deleted or moved.

```bash
node file-organizer.js organize <source> --output <target>
```

| Argument / Flag | Required | Description |
|-----------------|----------|-------------|
| `source` | Yes | Directory containing files to organize |
| `--output <target>` | Yes | Destination directory for sorted copies |

**Categories:** `Documents`, `Images`, `Archives`, `Code`, `Videos`, `Other`

**Behavior:**
- Files under 10 MB are copied with `fs.copyFile`
- Files 10 MB and larger are copied with streams (`pipeline`)
- If a filename already exists, a numeric suffix is added: `file.pdf` → `file(1).pdf`

**Example:**

```bash
node file-organizer.js organize ~/Downloads --output ~/Organized
```

---

### `cleanup`

Finds files older than a given number of days (based on last modification time). By default runs in **dry-run mode** and does not delete anything.

```bash
node file-organizer.js cleanup <directory> --older-than <days> [--confirm]
```

| Argument / Flag | Required | Description |
|-----------------|----------|-------------|
| `directory` | Yes | Directory to search for old files |
| `--older-than <days>` | Yes | Age threshold in days (`mtime`) |
| `--confirm` | No | Actually delete matched files |

**Dry run** (preview only):

```bash
node file-organizer.js cleanup ~/Downloads --older-than 90
```

**Delete files:**

```bash
node file-organizer.js cleanup ~/Downloads --older-than 90 --confirm
```

A file is included when its age in days is **greater than** the threshold.

## Global Options

| Flag | Description |
|------|-------------|
| `-h`, `--help` | Show help message |

## Project Structure

```
file-organizer/
├── file-organizer.js          # CLI entry point
├── package.json
├── README.md
└── src/
    ├── commands/              # Command runners (progress, output wiring)
    │   ├── scan.js
    │   ├── duplicates.js
    │   ├── organize.js
    │   └── cleanup.js
    ├── lib/                   # Business logic (EventEmitter classes)
    │   ├── scanner.js
    │   ├── duplicates.js
    │   ├── organizer.js
    │   └── cleanup.js
    ├── formatters/            # Console report formatting
    │   ├── scan.js
    │   ├── duplicates.js
    │   ├── organize.js
    │   └── cleanup.js
    ├── constants/             # Shared configuration values
    │   ├── commands.js
    │   ├── format.js
    │   ├── organize.js
    │   ├── duplicates.js
    │   └── cleanup.js
    └── utils/                 # Reusable helpers
        ├── cli.js
        ├── copy.js
        ├── category.js
        ├── errors.js
        ├── format.js
        ├── fs.js
        ├── hash.js
        ├── pluralize.js
        └── progress.js
```

### Architecture

Each command follows the same pattern:

1. **`lib/`** — core logic as an `EventEmitter` class (emits progress events)
2. **`commands/`** — subscribes to events, shows progress bar and headers
3. **`formatters/`** — builds the final text report

File system errors (`ENOENT`, `EACCES`, `ENOTDIR`) are handled centrally via `runCommand()` in `src/utils/errors.js`.

## Error Codes

| Code | Meaning |
|------|---------|
| `ENOENT` | Directory not found |
| `EACCES` | Permission denied |
| `ENOTDIR` | Path is not a directory |

On error the CLI prints a message and exits with code `1`.
