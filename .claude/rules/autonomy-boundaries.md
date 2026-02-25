# Autonomy Boundaries — LaunchPad Build

## What Claude Code CAN do autonomously during build:
- Create files and directories
- Write and refactor code
- Run tests and fix failures (up to 3 attempts)
- Install npm packages
- Run Lighthouse audits
- Update PROGRESS.md and LESSONS.md
- Create database migrations

## What Claude Code must ASK before doing:
- Changing the tech stack or adding new dependencies not in the spec
- Modifying the database schema beyond what's specified
- Changing the three-screen architecture
- Adding features not in the build brief
- Skipping a test spec requirement
- Any action that would incur cost (API calls to Anthropic, Apify, etc.)

## What Claude Code must NEVER do:
- Deploy to production without user confirmation
- Make real API calls during development (use mocks)
- Store real API keys in code
- Delete files without logging the reason
- Skip the Build-Verify-Learn loop
