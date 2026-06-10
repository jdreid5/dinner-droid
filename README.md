# Dinner Droid

A personal recipe-management app inspired by Gousto.  
This project includes:

- A **browser bookmarklet scraper** that extracts full Gousto recipe data directly from recipe pages.
- A **Node/Express API** for storing recipes in a **Prisma + SQLite** database.
- A PWA front‑end (in progress) for browsing recipes, cooking mode, and shopping lists.

## Features

### Gousto Recipe Scraper
The bookmarklet parses structured content from Gousto recipe pages — including title, ingredients, pantry items, steps, nutrition, cook time, and hero images — then POSTs the structured payload to your backend API.

### API and Database
Powered by:
- Node.js / Express (`backend/server.ts`)
- Prisma ORM
- SQLite for local development

The scraper sends data to:

```
POST http://localhost:3001/api/import
```

### Project Goals
- Build a personal recipe database  
- Provide step‑by‑step cooking mode  
- Auto‑generate shopping lists  
- Enable weekly plans and nutritional summaries  

## Getting Started

### 1. Install backend dependencies
```
cd backend
npm install
cp .env.example .env
```

### 2. Run migrations
```
npx prisma migrate dev
```

### 3. Start Typesense (search index)
From the repo root:
```
docker compose up -d typesense
```

### 4. Index recipes into Typesense
After Typesense is running (first time, or after wiping the Typesense volume):
```
cd backend
npm run search:reindex
```

### 5. Start the server
```
npx ts-node server.ts
```

### 6. Install frontend dependencies (separate terminal)
```
cd frontend
npm install
npm run dev
```

## Search (Typesense)

Recipe search uses [Typesense](https://typesense.org/) for typo-tolerant matching on titles and ingredients.

| Environment | Typesense host |
|-------------|----------------|
| Local | `localhost:8108` via Docker Compose |
| Production | Separate Fly.io app (`dinner-droid-typesense`) — see `backend/fly.typesense.toml` |

New recipes imported via `POST /api/import` are indexed automatically. To rebuild the full index:

```
cd backend && npm run search:reindex
```

## Using the Scraper Bookmarklet
1. Convert `bookmarklet-scraper.js` into a bookmarklet.
2. Visit any Gousto recipe page.
3. Click the bookmark.
4. The scraper will extract the recipe and send it to your API.

## Notes on Copyright
This project is for **personal use**. Do not redistribute scraped Gousto content.

## Folder Structure
```
root/
├── backend/
│   ├── server.ts
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   ├── seed.ts
│   │   └── makePlan.ts
│   └── generated/
├── frontend/
│   ├── package.json
│   ├── src/
│   │   └── app/
│   └── public/
├── bookmarklet-scraper.js
├── sample-recipe-html.html
└── recipes-list.html
```
