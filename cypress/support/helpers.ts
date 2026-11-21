export const product = Cypress.env('PRODUCT')
export const env = Cypress.env('ENV')
export const type = Cypress.env('TYPE')
export const baseUrl = Cypress.config('e2e').baseUrl

const getProductPath = () => {
  return `${product}`
}

export const getFixture = (fileName) => {
  try {
    return require(`../fixtures/${getProductPath()}/${fileName}.json`)
  } catch (error) {
    // Optional fixture (e.g. users.local.json) — safe to ignore when missing
    console.warn(`Fixture "${fileName}.json" not found for product "${product}"`)
  }
}

export const routes = getFixture('routes').envs[env]

const tmpUsers = getFixture('users')[env]
const localUsersFile = getFixture('users.local')
const localUsers = localUsersFile && localUsersFile[env]

// Credential resolution order (first non-empty value wins):
//   1. CYPRESS_<ROLE>_USER / CYPRESS_<ROLE>_USER_PW env vars (also settable via --env or cypress.env.json)
//   2. cypress/fixtures/<product>/users.local.json (git-ignored, for local runs)
//   3. cypress/fixtures/<product>/users.json (committed DUMMY placeholders only — never real credentials)
// Example: CYPRESS_PRIMARY_USER=myuser CYPRESS_PRIMARY_USER_PW=secret npm run tmdb-staging
const userRoles = ['primary', 'secondary', 'tertiary', 'quaternary'] as const

userRoles.forEach((role) => {
  const roleKey = role.toUpperCase()
  if (!tmpUsers[role]) return

  tmpUsers[role].username = (
    Cypress.env(`${roleKey}_USER`) ||
    (localUsers && localUsers[role] && localUsers[role].username) ||
    tmpUsers[role].username
  ).toLowerCase()

  tmpUsers[role].password =
    Cypress.env(`${roleKey}_USER_PW`) ||
    (localUsers && localUsers[role] && localUsers[role].password) ||
    tmpUsers[role].password
})

export const users = tmpUsers

export const getUrl = (name) => {
  if (name === 'baseUrl' || !name) {
    return baseUrl
  }

  let path = ''
  const commonPaths = getFixture('routes').commonPaths
  if (name in commonPaths) {
    path = commonPaths[name]
  }

  if (name in routes) {
    path = routes[name]
  }

  return `${baseUrl}${path}`
}
