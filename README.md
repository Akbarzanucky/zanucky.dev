# zanucky.dev

Personal site of Muhammad Akbar Zanucky. Static HTML, CSS and JavaScript, no build step, served by GitHub Pages at [zanucky.dev](https://zanucky.dev).

## Layout

```
index.html          the page
assets/css/         stylesheets
assets/js/          scripts
CNAME               custom domain for GitHub Pages
.nojekyll           tells GitHub Pages to serve files as they are
```

## Preview locally

```
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Push to `main`. GitHub Pages serves the repository root. Earlier versions of the site and working documents live outside the repository and are listed in `.gitignore`.
