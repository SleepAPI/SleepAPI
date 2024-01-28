/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const jestConfig: JestConfigWithTsJest = {
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  moduleDirectories: ['node_modules'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.[tj]s?(x)$': ['ts-jest', { isolatedModules: true }],
  },
};

export default jestConfig;
