import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { extname, join } from "node:path"

const ROOTS = ["app", "components", "src"].filter(existsSync)
const TOKENS = {
  "16231F": "ink",
  F6F4EE: "paper",
  D8D3C4: "line",
  "2F6F52": "brand",
  "6FAE8E": "brand-light",
  A8452E: "danger",
  B8862F: "warn",
  "3D5A73": "info",
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if ([".ts", ".tsx"].includes(extname(p))) yield p
  }
}

let changed = 0
const leftovers = []
const review = []

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const src = readFileSync(file, "utf8")
    const out = src
      .replace(/-\[#([0-9a-f]{6})\]/gi, (m, hex) =>
        TOKENS[hex.toUpperCase()] ? `-${TOKENS[hex.toUpperCase()]}` : m
      )
      .replace(/\bbg-white\b/g, "bg-wash")

    if (out !== src) {
      writeFileSync(file, out)
      changed++
    }
    out.split("\n").forEach((line, i) => {
      if (/#[0-9a-f]{6}\b/i.test(line)) leftovers.push(`${file}:${i + 1}: ${line.trim()}`)
      if (/\bbg-ink(?![\w/-])/.test(line)) review.push(`${file}:${i + 1}: ${line.trim()}`)
    })
  }
}

console.log(`Updated ${changed} file(s).`)
if (leftovers.length) console.log("\nRemaining hex literals (convert by hand):\n" + leftovers.join("\n"))
if (review.length)
  console.log(
    "\nbg-ink usages. Buttons are fine (they invert). Add `chrome` to dark panels/headers:\n" +
      review.join("\n")
  )