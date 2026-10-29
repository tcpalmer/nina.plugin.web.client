// Runs scripts/release.sh with arguments passed through (npm run release -- --dry-run).
// On Windows, 'bash' on PATH is often WSL's, which can't see the Windows gh/jq/zip/npm,
// so use the bash that ships with Git for Windows instead.

const { execFileSync, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function findBash() {
  if (process.platform !== 'win32') return 'bash'
  // git --exec-path is <git>/mingw64/libexec/git-core; bash is <git>/bin/bash.exe
  const execPath = execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim()
  const bash = path.resolve(execPath, '../../../bin/bash.exe')
  if (!fs.existsSync(bash)) {
    console.error(`Git for Windows bash not found at ${bash}`)
    process.exit(1)
  }
  return bash
}

const script = path.join(__dirname, 'release.sh')
const result = spawnSync(findBash(), [script, ...process.argv.slice(2)], { stdio: 'inherit' })
if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}
process.exit(result.status === null ? 1 : result.status)
