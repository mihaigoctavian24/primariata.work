module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        // Phase scopes (aligned with IMPLEMENTATION_ROADMAP.md)
        "phase-0",
        "phase-1",
        "phase-2",
        "phase-3",
        "phase-4",
        "phase-5",
        "phase-6",
        // Milestone/Feature scopes
        "landing", // M1: Landing page
        "auth", // M1: Authentication
        "survey", // M7: Survey Platform
        "cereri", // M2: Cereri Module
        "integrations", // M3: Integrations (certSIGN, Ghișeul.ro)
        "dashboard", // M8/M9: Dashboards
        "admin", // M9: Admin features
        // Technical scopes
        "api",
        "ui",
        "db",
        "config",
        "deps",
        "docs", // Documentation updates
      ],
    ],
    "subject-case": [2, "never", ["upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "type-case": [2, "always", "lower-case"],
    "type-empty": [2, "never"],
  },
};
