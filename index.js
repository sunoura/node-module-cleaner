#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const yargs = require("yargs");

const argv = yargs
    .option("path", {
        alias: "p",
        description: "Base path to scan",
        type: "string",
        default: process.cwd(),
    })
    .option("name", {
        alias: "n",
        description: "Folder name to match",
        type: "string",
        default: "node_modules",
    })
    .option("force", {
        alias: "f",
        description: "Skip confirmation prompt",
        type: "boolean",
        default: false,
    })
    .help().argv;

const basePath = path.resolve(argv.path);
const folderName = argv.name;

function formatBytes(bytes) {
    const units = ["bytes", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        ++i;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}

function getSize(dirPath) {
    let size = 0;
    try {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                size += getSize(fullPath);
            } else {
                try {
                    size += fs.statSync(fullPath).size;
                } catch {}
            }
        }
    } catch {}
    return size;
}

function getAllMatches(dir) {
    let results = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            if (item.name === folderName) {
                results.push(fullPath);
                continue;
            }
            try {
                results = results.concat(getAllMatches(fullPath));
            } catch {}
        }
    }
    return results;
}

function isNested(path, others) {
    return others.some(
        (other) => path !== other && path.startsWith(other + path.sep)
    );
}

function prompt(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(question, (ans) => {
            rl.close();
            resolve(ans);
        })
    );
}

(async function main() {
    console.log(`\nScanning for '${folderName}' folders in '${basePath}'...`);

    let all;
    try {
        all = getAllMatches(basePath);
    } catch (e) {
        console.error(`Failed to scan directories: ${e.message}`);
        process.exit(1);
    }

    const matches = all.filter((folder) => !isNested(folder, all));

    if (matches.length === 0) {
        console.log(`No '${folderName}' folders found.`);
        return;
    }

    let totalSize = 0;
    const sizedMatches = matches.map((p) => {
        const size = getSize(p);
        totalSize += size;
        return { path: p, size };
    });

    console.log(`\nFound ${sizedMatches.length} '${folderName}' folder(s):\n`);
    sizedMatches.forEach(({ path: p, size }) => {
        console.log(
            `${formatBytes(size).padEnd(12)} ${path.relative(basePath, p)}`
        );
    });

    console.log(`\nTotal space to be freed: ${formatBytes(totalSize)}\n`);

    if (!argv.force) {
        const confirmation = await prompt(
            "Do you want to delete these folders? (Y/N): "
        );
        if (confirmation.toLowerCase() !== "y") {
            console.log("Aborted. No folders were deleted.");
            return;
        }
    }

    console.log("\nDeleting folders...");
    let deleted = 0,
        failed = 0,
        freed = 0;

    for (const { path: p, size } of sizedMatches) {
        try {
            fs.rmSync(p, { recursive: true, force: true });
            deleted++;
            freed += size;
        } catch (err) {
            console.error(`Failed to delete ${p}: ${err.message}`);
            failed++;
        }
    }

    console.log(`\n=== Summary ===`);
    console.log(`Folders deleted: ${deleted}`);
    if (failed) console.log(`Failed deletions: ${failed}`);
    console.log(`Space freed: ${formatBytes(freed)}`);
    console.log("Cleanup completed!");
})();
