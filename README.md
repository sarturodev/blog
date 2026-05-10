# Zola Blog Setup (Terminimal + Series)

This blog is configured with the [`zola-theme-terminimal`](https://github.com/pawroman/zola-theme-terminimal) theme and includes a custom series feature.

## What is configured

- Theme: `themes/terminimal`
- Tags taxonomy: `/tags`
- Series taxonomy: `/series`
- Archive page: `/archive`
- About page: `/about`
- Post pagination: enabled on home

## Series feature

Series support is based on a taxonomy called `series` and custom templates in:

- `templates/page.html`
- `templates/macros/series.html`
- `templates/series/list.html`
- `templates/series/single.html`

On each post page, if a post belongs to a series, readers will see:

- a link to the series term page
- an ordered list of all posts in that series

## How to create a series post

Use front matter like this:

```toml
+++
title = "My Series Part 1"
date = 2026-03-31

[taxonomies]
tags = ["zola", "tutorial"]
series = ["my-series-name"]
+++
```

Use the same `series` value in each part.

## Next step

Install Zola locally and run:

```bash
scripts/build_site.sh build
zola serve
```

Then open the local URL shown in your terminal.

## Newsletter subscribers with Cloudflare D1

The subscribe widget now posts to `/api/subscribe`, which is implemented as a Cloudflare Pages Function in [functions/api/subscribe.js](/Users/introvertedbot/mrsheerluck/blog/functions/api/subscribe.js). Subscriber emails are stored in a D1 table created by [migrations/0001_create_subscribers.sql](/Users/introvertedbot/mrsheerluck/blog/migrations/0001_create_subscribers.sql).

Before deploying:

1. Create a D1 database: `wrangler d1 create mrsheerluck-blog`
2. Copy the returned database ID into [wrangler.toml](/Users/introvertedbot/mrsheerluck/blog/wrangler.toml)
3. Apply the migration: `wrangler d1 execute mrsheerluck-blog --remote --file migrations/0001_create_subscribers.sql`

To review new subscribers before adding them to Substack manually:

```bash
wrangler d1 execute mrsheerluck-blog --remote --command "SELECT email, created_at FROM subscribers ORDER BY created_at DESC;"
```

## Auto OG images for posts

Text-only OpenGraph/Twitter card images are auto-generated for posts in `content/posts/`:

- generator: `scripts/generate_og_images.py`
- output path: `static/images/og/posts/<post-slug>.png`
- metadata template: `templates/macros/head.html`

Run this before publishing if you are not using `scripts/build_site.sh`:

```bash
python3 scripts/generate_og_images.py
```
