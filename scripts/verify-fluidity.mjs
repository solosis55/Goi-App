#!/usr/bin/env node
/**
 * Comprobaciones automatizadas de la Fase 8 (fluidez).
 * Ejecutar: npm run verify:fluidity
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(label, cmd, args) {
  process.stdout.write(`${label}… `);
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error(`\n✗ ${label} falló (código ${r.status ?? 1})`);
    process.exit(r.status ?? 1);
  }
  console.log("✓");
}

console.log("Verificación de fluidez (automática)\n");
run("TypeScript", "npx", ["tsc", "--noEmit"]);
console.log("\nListo. Completa el checklist manual en docs/performance-fluidity-verification.md");
