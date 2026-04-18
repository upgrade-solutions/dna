---
name: publish-npm
description: Publish one or more workspace packages to npm in dependency order
---

1. Run `npm whoami`. If it returns 401/unauthorized, stop and ask the user to run `! npm login` in this session.
2. Run `git status`. If the working tree is dirty with unrelated changes, stop and ask before continuing.
3. For each target package, in dependency order (a package's dependencies must publish first — within this repo that means `schemas` → `core` → adapters):
   a. Confirm `package.json` has `"publishConfig": { "access": "public" }`. Scoped `@dna-codes/*` packages default to restricted and will fail to publish without this.
   b. Determine the version bump: ask the user whether this is a `patch` (bug fixes), `minor` (new backwards-compatible features), or `major` (breaking changes) release if they haven't specified. Then edit `version` in `package.json` directly using semver (e.g. `1.2.3` → `1.2.4` for patch, `1.3.0` for minor, `2.0.0` for major).
   c. Build if the package has a build script: `npm run build -w <name> --if-present`.
   d. Test if the package has a test script: `npm run test -w <name> --if-present`.
   e. Dry run: `npm publish -w <name> --dry-run`. Show the tarball contents (file list + size) to the user.
   f. Publish: `npm publish -w <name>`. If the user has 2FA, npm will prompt for an OTP — surface that to the user via `! npm publish ...`.
4. After all publishes succeed:
   a. Commit any `publishConfig` / `version` edits via the `commit` skill.
   b. Create a git tag per package: `git tag <pkg-name>@<version>` (e.g. `@dna-codes/core@0.1.0`).
   c. Ask the user before running `git push` and `git push --tags`.

Do not publish with `--force` or `--tag latest` overrides. Do not unpublish.
