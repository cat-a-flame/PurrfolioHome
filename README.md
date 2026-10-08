# Purrfolio — Landing site

Marketing site and store-required pages for the Purrfolio expense tracker.
Plain HTML/CSS/JS — no build step.

| Page | Path | Used for |
| --- | --- | --- |
| Landing | `/` | Marketing URL |
| Privacy Policy | `/privacy.html` | Google Play privacy policy URL |
| Terms of Use | `/terms.html` | EULA / terms link |
| Support | `/support.html` | Support URL |
| Delete account | `/delete-account.html` | Google Play "account deletion" URL |
| Not found | `/404.html` | Netlify / GitHub Pages 404 |

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

Works on any static host. `netlify.toml` publishes the repo root and adds
extension-less aliases (`/privacy`, `/terms`, `/support`, `/delete-account`).

## Before launch

- Replace `purrfolioapp@proton.me` / `purrfolioapp@proton.me` with real inboxes.
- Point the Google Play buttons (`href="#download"`) at the real store listings.
