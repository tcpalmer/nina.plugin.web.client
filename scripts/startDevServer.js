// Starts the development servers (cross-platform replacement for startDevServer.sh):
//   - superstatic on port 9001 to serve session history json from test/webroot
//   - test/mockapi/server.js on port 9002 to serve the mock API
//   - webpack devServer on port 9000
// superstatic must be installed globally.
// Ctrl+C (or webpack exiting) stops all three.

const { spawn } = require('child_process')
const path = require('path')

const root = path.resolve(__dirname, '..')

const servers = [
  { name: 'superstatic', port: 9001, command: 'superstatic test/webroot --port 9001' },
  { name: 'mock api', port: 9002, command: 'node test/mockapi/server.js' },
  { name: 'webpack devServer', port: 9000, command: 'npx webpack serve --config config/webpack.dev.js' },
]

const children = []
let stopping = false

function stopAll(code) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode !== null) continue
    if (process.platform === 'win32') {
      // shell: true wraps the server in cmd.exe; kill the whole process tree
      spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { stdio: 'ignore' })
    } else {
      child.kill('SIGTERM')
    }
  }
  process.exitCode = code
}

for (const server of servers) {
  console.log(`starting ${server.name} on port ${server.port} ...`)
  const child = spawn(server.command, { cwd: root, stdio: 'inherit', shell: true })
  child.on('error', (err) => {
    console.error(`${server.name} failed to start: ${err.message}`)
    stopAll(1)
  })
  child.on('exit', (code) => {
    if (stopping) return
    console.error(`${server.name} exited with code ${code}; stopping all servers`)
    stopAll(code || 1)
  })
  children.push(child)
}

process.on('SIGINT', () => stopAll(0))
process.on('SIGTERM', () => stopAll(0))
