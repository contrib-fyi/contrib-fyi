<div align="center">
  <img src="web/app/logo.png" alt="Contrib.FYI Logo" width="120" height="120">
  <h1>Contrib.FYI</h1>
    Find your next open source contribution on GitHub with ease.
</div>




## Overview

Contrib.FYI is a modern web application that helps developers discover good first issues and help wanted tasks across GitHub repositories. Built with Next.js and featuring a clean, intuitive interface, it makes finding meaningful open source contributions simple and efficient.

## Features

### Advanced Filtering

- **45+ Programming Languages**: Filter issues by language including JavaScript, TypeScript, Python, Rust, Go, Kotlin, Swift, and many more
- **Label-based Search**: Find issues tagged with "help wanted", "good first issue", "bug", "enhancement", and more
- **Custom Search**: Add your own search queries to refine results
- **Sort Options**: Sort by newest, recently updated, or most commented issues

### Rich Issue Information

- **Repository Details**: View stars, language, and repository information at a glance
- **User Avatars**: See who created each issue with GitHub profile pictures
- **Direct Links**: Quick access to repositories, user profiles, and issues
- **Label Visualization**: Color-coded labels matching GitHub's design

### Personal Organization

- **My Picks**: Save interesting issues for later review
- **Recently Viewed**: Track your browsing history
- **Issue Details**: View full issue descriptions in a modal dialog

### GitHub Integration

- **Optional Personal Access Token**: Add your GitHub PAT for higher rate limits and full repository information
- **Privacy First**: Tokens are stored locally in your browser only, never sent to servers
- **Secure Storage**: Client-side localStorage implementation

## Getting Started

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

3. (Optional) Create a `.env.local` file for your GitHub token:

```bash
cp .env.local.example .env.local
# Edit .env.local and add your token
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### GitHub Personal Access Token

To avoid rate limiting and access full repository information:

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens/new)
2. Create a token with `public_repo` scope
3. Click the key icon in the header and paste your token
4. Your token is stored locally and never sent to any server

## Usage

### Searching for Issues

1. Select programming languages from the Language filter
2. Choose labels like "help wanted" or "good first issue"
3. (Optional) Add custom search terms
4. Click the "Search" button to execute the query

### Managing Issues

- Click on an issue title to view full details
- Click the "Pick" button to save issues for later
- Access saved issues from the "My Picks" page
- View your browsing history in "Recently Viewed"

### Customizing Filters

- Multiple selections within a filter use OR logic
- Different filter types use AND logic
- Remove filters by clicking the X on selected items
- Use "Reset" to clear all filters

## API Rate Limits

Without authentication:

- 60 requests per hour per IP address

With GitHub Personal Access Token:

- 5,000 requests per hour per user

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
