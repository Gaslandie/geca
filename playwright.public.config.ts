import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests-public", outputDir: "./test-results-public", workers: 1, reporter: "list",
  use: { baseURL: "http://127.0.0.1:3110", browserName: "chromium", launchOptions: { executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] }, trace: "retain-on-failure" },
  webServer: { command: "GECA_PUBLIC_PREVIEW=true node scripts/preview-pages.mjs", url: "http://127.0.0.1:3110/fr/", reuseExistingServer: false },
});
