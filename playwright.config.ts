import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    browserName: "chromium",
    launchOptions: {
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox"],
    },
    trace: "retain-on-failure",
  },
  // Tests sur le build final. Le serveur reste limité à la machine locale.
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000/fr",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
