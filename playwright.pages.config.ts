import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests-pages",
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    browserName: "chromium",
    launchOptions: { executablePath: process.env.CI ? undefined : "/usr/bin/google-chrome", args: ["--no-sandbox"] },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run preview:pages",
    url: "http://127.0.0.1:3100/geca/fr/",
    reuseExistingServer: false,
  },
});
