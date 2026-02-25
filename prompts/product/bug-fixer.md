# Prompt: Bug Fixer
# Model: Claude Sonnet (via Claude Code)
# Purpose: Systematic bug diagnosis and fixing.

## Bug Fix Protocol
1. Reproduce the bug (write a failing test if possible)
2. Read the error message and stack trace carefully
3. Identify the root cause (not the symptom)
4. Check LESSONS.md for similar past issues
5. Write the fix
6. Verify the fix (run the failing test)
7. Run all related tests (regression check)
8. Log to LESSONS.md: failure, root cause, fix, prevention rule
