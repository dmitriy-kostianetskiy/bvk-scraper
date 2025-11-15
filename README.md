# BVK Scraper

Typed Apify Actor that scrapes [Beogradski Voodovod i Kanalizacija](https://www.bvk.rs/kvarovi-na-mrezi/) outage announcements, normalizes the data, and optionally forwards the results to a Telegram chat.

## Key capabilities

- Parse [Beogradski Voodovod i Kanalizacija](https://www.bvk.rs/kvarovi-na-mrezi/) HTML and emit structured outage records.
- Extract street-level addresses from bullet lists, generate Google Maps `https://www.google.com/maps/place/...` links, and avoid duplicating plain text when links are shown.
- Format HTML-safe Telegram messages with Serbian localization, trimming empty sections automatically.
- Persist results to the Apify default dataset for further processing or download.

## Requirements

- Node.js 18 or newer (see `package.json` engines field).
- npm (ships with Node) for dependency management.
- [direnv](https://direnv.net/) (optional, recommended for auto-loading `.env`).

## Installation

```bash
npm install
```

## Local usage

1. **Prepare environment variables**

```bash
cp .env.example .env
```

Update the placeholders:

- `BVK_URL` – source page for outages (defaults to the official BVK outage page).
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` – required only if you want Telegram notifications.

2. **Enable automatic env loading with direnv (optional but handy)**

```bash
brew install direnv               # or use your package manager
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc
direnv allow
```

The committed `.envrc` uses `dotenv` so every time you `cd` into the repo, values from `.env` are exported automatically.

3. **Run the actor locally**

- Login into Apify (first time only):

  ```bash
  apify login
  ```

- Pull Actor:

  ```bash
  apify pull %ACTOR_ID%
  ```

- Run Apify runtime

  ```bash
  npx apify run
  ```

The actor fetches the configured URL, parses outages, sends the Telegram summary when enabled, and pushes structured items to `storage/datasets/default`.

## Testing

Unit tests use the Node.js test runner via `tsx`:

```bash
npx tsx --test src/parse-page.test.ts src/telegram-message.test.ts src/telegram.test.ts
```

## Output structure

Each dataset item (`ParsePageResultItem`) contains:

- `date`: Outage date (`Date | null`).
- `title`: Announcement heading (string, may be empty).
- `text`: Remaining descriptive text with address-only lines removed.
- `html`: Raw HTML snippet for reference.
- `addresses`: Array of `{ label, url }`, where `url` is a Google Maps link derived from the label.

Telegram messages follow this shape:

```
Datum: DD.MM.YYYY
Naslov: …
Detalji: …            (only when non-address text is available)
Adrese:
• Label → Google Maps link

Više detalja ovde: ovde  (BVK source link)
```

## Repository layout

```
src/
	main.ts             # Actor entry point
	parse-page.ts       # HTML parsing and address extraction logic
	telegram.ts         # Telegram configuration and delivery helpers
	telegram-message.ts # HTML message formatter with address de-duplication
examples/             # Sample HTML fixtures

.actor/               # Actor metadata (input/output schema, dataset views)
storage/              # Local Apify storage (created at runtime)
```
