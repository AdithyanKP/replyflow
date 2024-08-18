const config = {
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,ts,tsx}'],
    coverageDirectory: 'coverage',
    testEnvironment: 'node',
   // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transform: {
      '^.+.(js)$': 'babel-jest',
    },

    transformIgnorePatterns: [
        '/node_modules/(?!(your-esm-package|another-esm-package)/)'
      ],
      moduleFileExtensions: ['js', 'json', 'node'],
  }
  
  export default config