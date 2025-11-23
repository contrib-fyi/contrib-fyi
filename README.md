<div align="center">
  <img src="web/app/logo.png" alt="Contrib.FYI Logo" width="150" height="150">
  <h1>Contrib.FYI</h1>
    Find your next open source contribution on GitHub with ease.
  <br><br>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/Built%20with-Next.js-black" alt="Built with Next.js">
  <a href="https://deepwiki.com/contrib-fyi/contrib-fyi"><img src="https://img.shields.io/badge/DeepWiki-contrib--fyi%2Fcontrib--fyi-blue.svg?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAyCAYAAAAnWDnqAAAAAXNSR0IArs4c6QAAA05JREFUaEPtmUtyEzEQhtWTQyQLHNak2AB7ZnyXZMEjXMGeK/AIi+QuHrMnbChYY7MIh8g01fJoopFb0uhhEqqcbWTp06/uv1saEDv4O3n3dV60RfP947Mm9/SQc0ICFQgzfc4CYZoTPAswgSJCCUJUnAAoRHOAUOcATwbmVLWdGoH//PB8mnKqScAhsD0kYP3j/Yt5LPQe2KvcXmGvRHcDnpxfL2zOYJ1mFwrryWTz0advv1Ut4CJgf5uhDuDj5eUcAUoahrdY/56ebRWeraTjMt/00Sh3UDtjgHtQNHwcRGOC98BJEAEymycmYcWwOprTgcB6VZ5JK5TAJ+fXGLBm3FDAmn6oPPjR4rKCAoJCal2eAiQp2x0vxTPB3ALO2CRkwmDy5WohzBDwSEFKRwPbknEggCPB/imwrycgxX2NzoMCHhPkDwqYMr9tRcP5qNrMZHkVnOjRMWwLCcr8ohBVb1OMjxLwGCvjTikrsBOiA6fNyCrm8V1rP93iVPpwaE+gO0SsWmPiXB+jikdf6SizrT5qKasx5j8ABbHpFTx+vFXp9EnYQmLx02h1QTTrl6eDqxLnGjporxl3NL3agEvXdT0WmEost648sQOYAeJS9Q7bfUVoMGnjo4AZdUMQku50McDcMWcBPvr0SzbTAFDfvJqwLzgxwATnCgnp4wDl6Aa+Ax283gghmj+vj7feE2KBBRMW3FzOpLOADl0Isb5587h/U4gGvkt5v60Z1VLG8BhYjbzRwyQZemwAd6cCR5/XFWLYZRIMpX39AR0tjaGGiGzLVyhse5C9RKC6ai42ppWPKiBagOvaYk8lO7DajerabOZP46Lby5wKjw1HCRx7p9sVMOWGzb/vA1hwiWc6jm3MvQDTogQkiqIhJV0nBQBTU+3okKCFDy9WwferkHjtxib7t3xIUQtHxnIwtx4mpg26/HfwVNVDb4oI9RHmx5WGelRVlrtiw43zboCLaxv46AZeB3IlTkwouebTr1y2NjSpHz68WNFjHvupy3q8TFn3Hos2IAk4Ju5dCo8B3wP7VPr/FGaKiG+T+v+TQqIrOqMTL1VdWV1DdmcbO8KXBz6esmYWYKPwDL5b5FA1a0hwapHiom0r/cKaoqr+27/XcrS5UwSMbQAAAABJRU5ErkJggg==" alt="DeepWiki"></a>
</div>

<div align="center">
  <h3>
    <a href="https://contrib-fyi.github.io/contrib-fyi/"> 👉 Visit the Web App</a>
  </h3>
</div>

## Why Contrib.FYI?

There are many "Good First Issue" finders available today, but most rely on static lists of curated, popular repositories.

I previously relied on [github-help-wanted](https://github.com/mac-s-g/github-help-wanted/). What I loved most about it was the **thrill of discovery**—because it displayed issues in chronological order, I often stumbled upon unexpectedly wonderful projects that I would have otherwise missed.

Contrib.FYI was built to preserve this experience of **serendipitous discovery**. It carries forward the "Dynamic Search" philosophy by combining real-time GitHub API access with a modern interface. With local issue tracking and personal token integration, it creates a robust environment where you can find fresh, exciting opportunities in the open source world.

### Comparison

| Feature             | Contrib.FYI                       | Other Curated Sites           |
| :------------------ | :-------------------------------- | :---------------------------- |
| **Search Strategy** | Dynamic Search (Live GitHub Data) | Static Curation (Manual/Cron) |
| **Niche Languages** | Any Language                      | Major ones only               |
| **Repo Discovery**  | Find hidden gems                  | Famous repos only             |
| **Rate Limit**      | High (Bring your own Token)       | Often limited                 |
| **My Picks (Save)** | Local Storage                     | Rarely supported              |

## Key Features

### 🔍 Advanced Dynamic Search

Directly leverages the GitHub API to provide real-time information. Unlike curated lists, you find what is actually happening right now.

### 🏷 Flexible Filtering

Freely combine filters for programming languages, labels (e.g., "help wanted", "good first issue"), and exclude keywords to refine your search.

### 🔐 Privacy First & High Rate Limits

You can configure your own GitHub Personal Access Token (PAT) to increase API rate limits from 60 to 5,000 requests per hour.
**Privacy First:** Your token is stored strictly in your browser's `localStorage` and is never sent to any external server.

#### Additional Features with Token

- Repository Star Count
  - See how popular each repository is at a glance
- Star Filtering
  - Filter issues by minimum repository stars to focus on well-established projects

### 🔖 My Picks

Save interesting issues to your local "My Picks" list to review and tackle later.

---

## Development

If you want to run this project locally or contribute to its development, follow the steps below.

### Prerequisites

- Node.js 18+ or compatible package manager
- (Optional) GitHub Personal Access Token for higher rate limits

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/contrib-fyi.git
cd contrib-fyi/web
```

2. Install dependencies:

```bash
npm install
```

3. (Optional) Configure environment variables:

```bash
cp .env.local.example .env.local
# NEXT_PUBLIC_BASE_PATH=/your/base/path
# NEXT_OUTPUT_MODE=export
# NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxx
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` – start the development server
- `npm run build` – create a production build
- `npm run start` – serve the production build
- `npm run lint` – run ESLint
- `npm run format` – format with Prettier
- `npm run typecheck` – run TypeScript without emitting files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
