import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Đọc version từ package.json rồi kiểm tra lock và heading CHANGELOG khớp version đó. */
export function checkRelease(root) {
  const errors = []
  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const packageLock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))
  const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8')
  const version = packageJson.version

  const versions = {
    packageJson: version,
    packageLock: packageLock.version,
    packageLockRoot: packageLock.packages?.['']?.version
  }
  if (Object.values(versions).some((value) => value !== version)) {
    errors.push(`Version mismatch: ${JSON.stringify(versions)}`)
  }

  const heading = changelog
    .split(/\r?\n/u)
    .find((line) => new RegExp(`^## \\[${escapeRegExp(version)}\\] - \\d{4}-\\d{2}-\\d{2}$`).test(line))
  if (!heading) errors.push(`Missing changelog heading for ${version}`)

  return { errors, version, heading }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { errors, version, heading } = checkRelease(resolve(fileURLToPath(new URL('..', import.meta.url))))
  if (errors.length > 0) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log(JSON.stringify({ status: 'pass', version, heading }))
}
