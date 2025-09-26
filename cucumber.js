module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: [
      'src/hooks/**/*.ts',
      'src/steps/**/*.ts',
      'src/world/**/*.ts'
    ],
    format: [
      'json:reports/cucumber-report.json',
      'html:reports/cucumber-report.html',
      '@cucumber/pretty-formatter'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    paths: ['src/features/**/*.feature'],
    parallel: 1,
    retry: 1,
    timeout: 60000,
    worldParameters: {
      browser: process.env.BROWSER || 'chromium',
      headless: process.env.HEADLESS !== 'false',
      baseUrl: process.env.BASE_URL || 'https://opencart.abstracta.us' // 'https://demo.opencart.com' // because the official demo site (https://demo.opencart.com) is intermittently
      // blocked by CloudFront with access/403 errors during automated testing.
      // Functionality remains the same as both are official OpenCart demo instances.
    }
  }
};