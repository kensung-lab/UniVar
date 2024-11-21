import { config } from 'dotenv';
import { resolve } from 'path';

if (process.env.NODE_ENV == 'development') {
  const envPath = resolve(
    process.cwd(),
    `.env.${process.env.NODE_ENV || 'development'}`,
  );
  const { error } = config({ path: envPath });

  if (error) {
    throw error;
  }
}

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  roots: ['./src', './test'],
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageDirectory: './coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.module.ts',
  ],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};
