const {defineConfig} = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {timeout: 20000},
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    // Use installed Edge on Windows; use Playwright Chromium elsewhere.
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined),
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node ./node_modules/@docusaurus/core/bin/docusaurus.mjs serve --host 127.0.0.1 --port 4173 --no-open',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 60000,
  },
});