# Contributing

Thanks for considering a contribution! This project is intentionally small and easy to read — please keep that in mind when proposing changes.

## Setup

```bash
git clone https://github.com/<your-fork>/rifas-toolkit
cd rifas-toolkit/app
npm install
npm run dev    # http://localhost:5173
npm test       # run unit tests
npm run build  # production bundle in app/dist
```

## Reporting issues

A useful issue contains:

- A short description of the expected vs. actual behavior.
- The template PDF (or a redacted copy) and the slot config — easiest way: open the browser DevTools and copy `localStorage.getItem('rifas:config:v1')`.
- Browser + OS.

## Pull requests

1. Open an issue first for anything bigger than a typo or a small bug fix — saves both of us time.
2. Keep the PR focused on a single concern.
3. Add or update unit tests for changes in `src/pdf/numbering.ts`, `src/pdf/suggestLayout.ts`, or `src/pdf/coords.ts` — these modules are pure and easy to test.
4. UI changes: include a screenshot or short clip in the PR.
5. Run `npm test` and `npm run build` locally before pushing.
6. Both English and Portuguese strings (`src/i18n/strings.ts`) need to be updated together.

## Code style

- TypeScript strict mode is on.
- No comments unless the *why* is genuinely non-obvious.
- Prefer small, pure functions over abstractions.
- Don't introduce a new dependency for something that fits in <50 lines of code.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
