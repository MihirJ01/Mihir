import { readFileSync } from "node:fs";

const filePath = "src/components/LoginPanel.tsx";
const content = readFileSync(filePath, "utf8");
const lines = content.split(/\r?\n/);

const fail = (message) => {
  console.error(message);
  process.exit(1);
};


const lines = content.split(/\r?\n/);
let importsClosed = false;

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i].trim();

  if (!importsClosed) {
    if (!line || line.startsWith("import ")) {
      continue;
    }

    importsClosed = true;
  }

  if (line.startsWith("import ")) {
    const contextStart = Math.max(0, i - 2);
    const contextEnd = Math.min(lines.length, i + 3);
    const context = lines
      .slice(contextStart, contextEnd)
      .map((l, index) => `${contextStart + index + 1}: ${l}`)
      .join("\n");

    fail(
      [
        `Integrity check failed: found an import statement outside top import block in ${filePath}:${i + 1}.`,
        "This usually means the file was corrupted by merge/copy-paste.",
        "Context:",
        context,
      ].join("\n"),
    );
  }
}

const conflictMarkerRegex = /^(<<<<<<<|=======|>>>>>>>)$/m;
if (conflictMarkerRegex.test(content)) {
  fail(`Integrity check failed: merge conflict markers found in ${filePath}.`);
}

const exportCount = (content.match(/export function LoginPanel\s*\(/g) ?? []).length;
if (exportCount !== 1) {
  fail(
    `Integrity check failed: expected exactly 1 LoginPanel export, found ${exportCount}. File may contain duplicated content.`,
  );
    console.error(
      `Integrity check failed: found an import statement outside the import block in ${filePath}:${i + 1}.`,
    );
    console.error("This usually means the file is corrupted by a bad merge or copy/paste.");
    process.exit(1);
  }
}

if (content.includes("<<<<<<<") || content.includes(">>>>>>>") || content.includes("=======")) {
  console.error(`Integrity check failed: merge conflict markers found in ${filePath}.`);
  process.exit(1);
}

console.log("LoginPanel integrity check passed.");
