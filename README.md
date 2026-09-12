# Typing Tutor '92

A retro, DOS-styled typing tutor for the web — an original homage to the
early-90s typing programs, built as a single static page with no
dependencies and no build step. Works great in any modern browser on a Mac
(or anything else with a keyboard).

## Features

- **Boot screen** — a little fake DOS boot for atmosphere. Press any key.
- **12 progressive lessons** — home row first (F/J, D/K, S/L, A/;), then
  reaches, the full alphabet, capitals, and numbers/symbols. Each lesson
  shows a live on-screen keyboard that highlights the next key, with home
  keys marked.
- **One-minute speed test** — type as much of the passage as you can in 60
  seconds; get WPM, accuracy, and a letter grade.
- **Letter Storm** — an arcade mode where letters and words fall from the
  sky; type them before they land. Speeds up every level, three lives.
- **Progress report** — best WPM/accuracy per lesson, test best, and game
  high score, saved in the browser (localStorage). Press `X` on the
  progress screen to reset.

Navigation is all keyboard: number keys on the menu, letter keys to pick a
lesson, `ESC` to back out of anything, `Enter` to leave a results screen.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

## Deploy to the web (GitHub Pages)

This repo includes a workflow (`.github/workflows/pages.yml`) that deploys
the site with GitHub Pages on every push to `main`. The workflow enables
Pages automatically on its first run (`enablement: true`), so no manual
setup is needed — after a push to `main`, the site is live at
`https://<your-username>.github.io/typing-tutor/`.

## Notes

- Scores and progress are stored per browser via localStorage — each kid
  can use their own browser profile to keep separate progress.
- All lesson text, game content, and artwork here are original; this is a
  from-scratch tribute to the style of 1992 typing software, not a copy of
  any original program.
