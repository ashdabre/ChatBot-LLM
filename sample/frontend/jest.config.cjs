// jest.config.cjs
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  // Transform react-markdown and all its ESM dependencies
  transformIgnorePatterns: [
    "/node_modules/(?!(react-markdown|remark-gfm|remark-breaks|devlop)/)"
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']
};
