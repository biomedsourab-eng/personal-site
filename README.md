# Personal site + admin panel (Netlify, no database)

Static site. Content lives in `data/*.json`. The admin panel at `/admin/` edits those
JSON files and commits them back to your GitHub repo. Netlify rebuilds on every commit.
No Supabase, no database, no server code.

```
index.html          page shell
styles.css          styling
app.js              reads data/*.json and renders the page
data/profile.json   your name, tagline, about, links
data/achievements.json   the list you keep adding to
admin/index.html    loads Decap CMS + Netlify Identity
admin/config.yml    defines the admin form fields
netlify.toml        build + security headers
```

---

## Step 1 — Put files in a GitHub repo

Drag-and-drop deploy will NOT work here: the admin panel commits to Git, so Netlify
must be connected to a repo.

1. Create a new GitHub repo, e.g. `personal-site`. Make it **public** or private — both work.
2. Put the contents of this folder at the **repo root** (`index.html` at top level, not inside `site/`).
3. Commit and push to the `main` branch.

```bash
git init
git add .
git commit -m "initial site"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/personal-site.git
git push -u origin main
```

If your default branch is `master`, change `branch: main` in `admin/config.yml` to match.

## Step 2 — Deploy on Netlify

1. netlify.com → **Add new site** → **Import an existing project** → GitHub → pick the repo.
2. Build command: leave **empty**. Publish directory: `.`
3. Deploy. You get a URL like `your-site.netlify.app`.

Visit it. You should see the dummy content. `/admin/` will show a login box that does
nothing yet — that's expected until step 3.

## Step 3 — Turn on Netlify Identity

In your site dashboard:

1. Find **Identity** (under site configuration / extensions depending on UI version) → **Enable Identity**.
2. Open **Registration preferences** → set to **Invite only**.

   Read this one carefully. If registration stays **Open**, anyone on the internet can
   create an account on your site and, once Git Gateway is on, edit your content and push
   commits to your repo. Invite only is the setting that makes this secure. Set it before
   you enable Git Gateway, not after.

3. Under Identity → **Services** → **Git Gateway** → **Enable Git Gateway**.
   This lets logged-in users commit without having GitHub access themselves.

## Step 4 — Invite yourself

1. Identity → **Invite users** → enter your email → send.
2. Check your inbox, click the invite link, set a password.
3. If the link lands on your homepage and nothing happens, paste the full invite URL
   (the part with `#invite_token=...`) onto `https://your-site.netlify.app/admin/` instead.

Do not invite anyone you don't want committing to your repo. Every Identity user with
Git Gateway can write to `main`.

## Step 5 — Use the admin panel

1. Go to `https://your-site.netlify.app/admin/`
2. Log in with the email + password from step 4.
3. Two entries in the sidebar:
   - **Profile** — name, role, tagline, about, footer, links.
   - **Achievements** — click **Achievements** → the list → **Add Achievements** for a new row.
4. Fill Title, Year, Category, Details, optional Link.
5. Click **Publish** → **Publish now**.

What happens: Decap commits the updated JSON to `main` → Netlify detects the commit →
rebuilds → live in roughly 30–60 seconds. Refresh the homepage to see it.

Items sort newest-first by Year automatically. Category creates the filter buttons.

## Running it locally

`app.js` fetches with absolute paths, so opening `index.html` by double-clicking fails.
Serve it instead:

```bash
cd site
python3 -m http.server 8000
```

Open `http://localhost:8000`. The homepage works. `/admin/` will not work locally
without extra setup — edit through the deployed site.

---

## Notes

- **Cost:** free tier covers all of this. Identity is included on credit-based plans.
- **Custom domain:** Netlify → Domain management → add your domain. HTTPS is automatic.
- **Adding a new section** (e.g. Publications): add `data/publications.json`, add a matching
  block under `files:` in `admin/config.yml`, render it in `app.js`.
- **Backups:** every edit is a Git commit. Full history on GitHub, revert anything.
- **Lost admin access:** you can always edit `data/*.json` directly on GitHub. The admin
  panel is a convenience layer, not the source of truth.
