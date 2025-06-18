# node-module-cleaner

A simple and efficient CLI tool to **recursively find and delete `node_modules` folders** from a directory tree — with size estimates and confirmation prompts.

## Features

-   Scans for all folders matching a given name (default: `node_modules`)
-   Calculates and displays disk space usage per folder
-   Confirms before deletion (optional `--force` flag to skip)
-   Skips nested matches to avoid double-counting
-   Fast and dependency-free (uses native Node.js)

---

## Installation

```bash
npm install -g node-module-cleaner
```

Or use directly via `npx`:

```bash
npx node-module-cleaner
```

---

## Usage

```bash
node-module-cleaner [options]
```

### Options

| Flag      | Alias | Description                              | Default             |
| --------- | ----- | ---------------------------------------- | ------------------- |
| `--path`  | `-p`  | Base directory to start scanning from    | Current working dir |
| `--name`  | `-n`  | Folder name to search for and delete     | `node_modules`      |
| `--force` | `-f`  | Skip confirmation prompt before deletion | `false`             |
| `--help`  |       | Show usage instructions                  |                     |

---

## Examples

### Delete all `node_modules` folders under current directory

```bash
npx node-module-cleaner
```

### Delete all `dist` folders under a specific project directory

```bash
npx node-module-cleaner -p ./projects/my-app -n dist
```

### Force deletion without confirmation

```bash
npx node-module-cleaner -f
```

---

## Output Example

```
Scanning for 'node_modules' folders in '/home/user/projects'...

Found 3 'node_modules' folder(s):

58.4 MB      frontend/node_modules
102.1 MB     backend/node_modules
36.2 MB      shared/node_modules

Total space to be freed: 196.7 MB

Do you want to delete these folders? (Y/N): y

Deleting folders...

=== Summary ===
Folders deleted: 3
Space freed: 196.7 MB
Cleanup completed!
```

---

## Why?

`node_modules` folders can eat up **gigabytes** of space. This tool helps you:

-   Quickly reclaim disk space
-   Clean up old or abandoned project directories
-   Gain visibility into how much space dependencies are taking

---

## License

MIT

---

## Author

Crafted by [Sunny](https://github.com/sunoura)
