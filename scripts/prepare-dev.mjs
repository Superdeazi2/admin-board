import { existsSync, readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(scriptDir, '..')

dotenv.config({ path: resolve(rootDir, '.env') })

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
    env: process.env,
    ...options,
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms))
}

async function main() {
  if (!existsSync(resolve(rootDir, '.env'))) {
    console.error('ERROR: .env is missing. Run the v13 repair once.')
    process.exit(2)
  }

  const dockerVersion = spawnSync('docker', ['compose', 'version'], {
    cwd: rootDir,
    stdio: 'ignore',
    shell: false,
  })

  if (dockerVersion.status !== 0) {
    console.error('ERROR: Docker Compose is not available inside WSL.')
    process.exit(3)
  }

  console.log('Starting PostgreSQL...')
  run('docker', ['compose', 'up', '-d', 'postgres'])

  console.log('Waiting for PostgreSQL...')
  let ready = false

  for (let attempt = 1; attempt <= 40; attempt += 1) {
    const check = spawnSync(
      'docker',
      ['compose', 'exec', '-T', 'postgres', 'pg_isready', '-U', 'adminboard', '-d', 'adminboard'],
      { cwd: rootDir, stdio: 'ignore', shell: false },
    )

    if (check.status === 0) {
      ready = true
      break
    }

    await sleep(1000)
  }

  if (!ready) {
    console.error('ERROR: PostgreSQL did not become ready.')
    process.exit(4)
  }

  console.log('PostgreSQL is ready.')
  console.log('Applying Prisma migrations...')
  run('npm', ['run', 'db:migrate'])

  console.log('Seeding demo data...')
  run('npm', ['run', 'db:seed'])

  console.log('Development services are prepared.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
