# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow

After every significant change (new feature, bug fix, refactor, config update, etc.):

1. Stage the relevant files (be specific, avoid `git add -A` or `git add .`)
2. Write a descriptive commit message:
   - Subject line: short imperative summary (e.g. "Add user auth middleware")
   - Body: explain *what* changed and *why* (not just how)
   - Include `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`
3. Push to `origin master` immediately after committing

Do this automatically without waiting to be asked, unless a change is clearly incomplete or part of a larger in-progress task.

<!-- Add build, lint, and test commands here as the project grows. -->
<!-- Add architecture notes here once the codebase takes shape. -->
