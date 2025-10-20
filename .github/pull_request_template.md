# Pull Request

## 📝 Description

<!-- Provide a clear and concise description of what this PR does -->



## 🔗 Related Issues

<!-- Link to related issues using keywords: Closes #123, Fixes #456, Related to #789 -->

- Closes #
- Related to #

## 🎯 Type of Change

<!-- Mark the relevant option with an [x] -->

- [ ] `feat`: New feature
- [ ] `fix`: Bug fix
- [ ] `docs`: Documentation changes
- [ ] `style`: Code style changes (formatting, semicolons, etc.)
- [ ] `refactor`: Code refactoring (no functionality change)
- [ ] `perf`: Performance improvements
- [ ] `test`: Adding or updating tests
- [ ] `build`: Build system or external dependencies
- [ ] `ci`: CI/CD configuration changes
- [ ] `chore`: Other changes (tooling, etc.)

## 🎨 Screenshots / Recordings

<!-- For UI changes, add before/after screenshots or screen recordings -->

<details>
<summary>Before & After (if applicable)</summary>

**Before:**
<!-- Add screenshot or describe previous behavior -->

**After:**
<!-- Add screenshot or describe new behavior -->

</details>

## ✅ Checklist

<!-- Mark completed items with [x] -->

### Code Quality
- [ ] Code follows the project's [style guidelines](CONTRIBUTING.md#code-standards)
- [ ] TypeScript compiles without errors (`pnpm type-check`)
- [ ] ESLint passes without errors (`pnpm lint`)
- [ ] Code is properly formatted (`pnpm format:check`)
- [ ] No console.log or debugger statements left in code
- [ ] Code is self-documenting or has appropriate comments

### Testing
- [ ] Unit tests added/updated (`pnpm test`)
- [ ] Integration tests added/updated (if applicable)
- [ ] E2E tests added/updated (if applicable)
- [ ] All tests pass locally (`pnpm test:all`)
- [ ] Test coverage meets requirements (90%+ for new code)

### Documentation
- [ ] README updated (if needed)
- [ ] DEVELOPMENT_GUIDE updated (if adding new patterns)
- [ ] JSDoc comments added for new functions/components
- [ ] Migration guide added (if breaking changes)

### Database & Backend
- [ ] Database migrations created (if schema changes)
- [ ] RLS policies updated (if new tables/columns)
- [ ] Database types regenerated (`pnpm types:generate`)
- [ ] Edge Functions tested (if modified)

### Git
- [ ] Commits follow [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] Branch is up-to-date with `develop`
- [ ] No merge conflicts
- [ ] Commit messages are clear and descriptive

### Performance & Security
- [ ] No performance regressions introduced
- [ ] No security vulnerabilities added
- [ ] Sensitive data not exposed in logs/responses
- [ ] Environment variables properly configured

### CI/CD
- [ ] Build succeeds (`pnpm build`)
- [ ] CI pipeline passes (will be checked automatically)

## 🧪 How to Test

<!-- Provide step-by-step instructions for reviewers to test this PR -->

1. Checkout this branch: `git checkout [branch-name]`
2. Install dependencies: `pnpm install`
3. Run migrations (if applicable): `supabase db reset`
4. Start dev server: `pnpm dev`
5. Navigate to: [URL or feature location]
6. Test: [Specific actions to perform]
7. Expected result: [What should happen]

## 🚨 Breaking Changes

<!-- List any breaking changes and migration steps required -->

- [ ] This PR introduces breaking changes

<details>
<summary>Breaking Changes Details</summary>

**What breaks:**
<!-- Describe what existing functionality will break -->

**Migration steps:**
<!-- Provide step-by-step migration instructions -->

1.
2.

</details>

## 📊 Performance Impact

<!-- Describe any performance implications (positive or negative) -->

- [ ] Performance tested
- [ ] Lighthouse scores checked (if UI changes)
- [ ] Database query performance verified (if DB changes)

**Performance notes:**
<!-- Add benchmarks, metrics, or observations -->



## 🔍 Additional Context

<!-- Add any other context, implementation notes, or design decisions -->



## 📸 Preview Deployment

<!-- Vercel will automatically comment with preview URL -->
<!-- Add any specific pages/features to test in the preview -->

**Pages to review:**
- [ ] [Page/feature 1]
- [ ] [Page/feature 2]

---

## 👀 Reviewer Notes

<!-- Optional: Add specific areas you want reviewers to focus on -->

**Areas needing special attention:**
-
-

**Questions for reviewers:**
-
-

---

<div align="center">

**Thank you for contributing to primariaTa❤️\_!** 🚀

By submitting this PR, you agree to follow our [Code of Conduct](CONTRIBUTING.md#code-of-conduct)

## 🙊

</div>
