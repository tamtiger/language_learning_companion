import { readFileSync } from 'node:fs'

const expectedVersion = '1.1.3'
const expectedHeading = `## [${expectedVersion}] - 2026-08-27`
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
const packageLock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
const changelog = readFileSync('CHANGELOG.md', 'utf8')

const versions = {
  packageJson: packageJson.version,
  packageLock: packageLock.version,
  packageLockRoot: packageLock.packages?.['']?.version
}

if (Object.values(versions).some((version) => version !== expectedVersion)) {
  console.error(`Version mismatch: ${JSON.stringify(versions)}`)
  process.exit(1)
}

if (!changelog.split(/\r?\n/u).includes(expectedHeading)) {
  console.error(`Missing changelog heading: ${expectedHeading}`)
  process.exit(1)
}

console.log(JSON.stringify({ status: 'pass', version: expectedVersion, heading: expectedHeading }))
