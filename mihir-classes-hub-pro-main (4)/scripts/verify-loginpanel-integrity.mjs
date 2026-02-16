import { readFileSync } from "node:fs";

const filePath = "src/components/LoginPanel.tsx";
const content = readFileSync(filePath, "utf8");

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
