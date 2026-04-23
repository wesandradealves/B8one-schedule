import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  clearMocks: true,
  collectCoverageFrom: ['src/modules/**/*use-case.ts'],
  coverageDirectory: 'coverage',
};

export default config;
