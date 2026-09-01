import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(scriptDir, '..')
const apiDir = resolve(rootDir, 'apps/api')

dotenv.config({ path: resolve(rootDir, '.env') })

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is missing from root .env')
  process.exit(2)
}

const prismaCli = resolve(rootDir, 'node_modules/prisma/build/index.js')
const args = process.argv.slice(2)

const result = spawnSync(process.execPath, [prismaCli, ...args], {
  cwd: apiDir,
  env: process.env,
  stdio: 'inherit',
})

if (result.error) {
  throw result.error
}

process.exit(result.status ?? 1)
