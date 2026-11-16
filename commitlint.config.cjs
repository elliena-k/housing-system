/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [2, 'always', 72],
    'subject-case': [2, 'always', 'lower-case'],
    'scope-enum': [
      2,
      'always',
      [
        'web',
        'api',
        'db',
        'auth',
        'students',
        'applications',
        'hostels',
        'rooms',
        'allocations',
        'stats',
        'deps',
        'repo',
      ],
    ],
  },
};
