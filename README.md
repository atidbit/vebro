# vebro.net — static site for GitHub Pages

Plain HTML + CSS. No build step, no JavaScript, no dependencies.

## Files
- `index.html` — home page (logo, tagline, contact)
- `forsale.html` — "Domains For Sale" list (not in the nav; `noindex` + disallowed in robots.txt, like the old `forsale.asp`)
- `404.html` — "page not found" page (GitHub Pages uses it automatically)
- `styles.css` — shared stylesheet (colors are at the top in `:root`)
- `images/` — logo (PNG + WebP), social-share image, app icon
- `favicon.ico`, `favicon.png`, `robots.txt`, `sitemap.xml`
- `CNAME` — contains `vebro.net`. Leave it in only if you're pointing the domain at GitHub Pages. If you're not ready yet, delete it.
- `.nojekyll` — tells GitHub to serve the files exactly as they are

## Upload to GitHub (web browser, no git needed)
1. On github.com, click **+ → New repository**. Name it (e.g. `vebro.net`), set it to **Public**, and click **Create repository**.
2. Click **uploading an existing file**. Unzip `vebro-site.zip` on your computer and drag **everything inside it** into the page. Folders like `images/` come along when you drag them. Click **Commit changes**.
   - Hidden file: `.nojekyll` may not show up on Mac/Windows. That's fine, the site works without it. Or create it in GitHub with **Add file → Create new file**, name it `.nojekyll`, and leave it empty.
3. Go to **Settings → Pages**. Under **Build and deployment** pick **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
4. After about a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.
   - Note: the 404 page uses root links (`/styles.css`), so it only looks right on the custom domain or a `<username>.github.io` repo.
5. Custom domain: once DNS is set (below), go to **Settings → Pages → Custom domain**, enter `vebro.net`, save, wait for the DNS check, then tick **Enforce HTTPS**.

## DNS for vebro.net (at GoDaddy). Change only these records.
| Type  | Name | Value |
|-------|------|-------|
| A     | @    | 185.199.108.153 |
| A     | @    | 185.199.109.153 |
| A     | @    | 185.199.110.153 |
| A     | @    | 185.199.111.153 |
| AAAA  | @    | 2606:50c0:8000::153 |
| AAAA  | @    | 2606:50c0:8001::153 |
| AAAA  | @    | 2606:50c0:8002::153 |
| AAAA  | @    | 2606:50c0:8003::153 |
| CNAME | www  | `<your-username>.github.io` |

Remove the current `A @ 50.63.8.126` record. **Do not touch** the MX, TXT (SPF / Proton verification), `_dmarc` TXT, or the `protonmail*._domainkey` CNAME records. Those keep your Proton Mail email working.

## Editing later
Edit any `.html` file right on GitHub (pencil icon) and commit. The site updates within about a minute.
