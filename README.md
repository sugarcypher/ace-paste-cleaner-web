# Ace Paste Cleaner

**Clean, Normalize & De-Junk Your Text in One Click**

Ace Paste Cleaner instantly strips junk from text—removing weird formatting, hidden characters, tracking junk, and copy-paste gremlins—so you can paste clean, consistent text anywhere.

Ace Paste Cleaner is a fast, browser-based text sanitizer. Paste in messy text; get back clean, plain, standardized output. It fixes smart quotes, spacing, line breaks, and invisible characters, and can optionally normalize casing and punctuation. Runs locally in your browser for speed and privacy. Perfect for writers, editors, marketers, devs, students—anyone who pastes a lot.

## Key Features

* **One-click clean** - Strip formatting & invisible characters
* **Smart punctuation & dash normalization** - " " ' ' → " ' — – → -
* **Whitespace & line-break repair** - Collapse excess spaces, fix double line breaks
* **Optional case conversion** - Title/Sentence/UPPER/lower
* **URL de-tracking** - Remove UTM parameters and tracking junk
* **Markdown-safe mode** - Preserve # \* \_ \` and code blocks
* **Presets + custom profiles** - Save and reuse your favorite cleaning rules
* **Batch cleaning** - Handle large documents and long articles
* **100% local processing** - Privacy-first, runs in your browser

## Features

### Core Cleaning Options
- **Remove invisible characters** - ZWSP, ZWJ, ZWNJ, WJ, BOM, bidi characters
- **Keep emoji presentation selector (VS16)** - Preserve emoji styling
- **Preserve emoji sequences** - Keep ZWJ in emoji like 👩‍💻, 🏳️‍🌈
- **Strip Markdown headers** - Remove #, ##, ### etc.
- **Strip bold/italic markers** - Remove **, __, *, _ formatting
- **Strip backticks** - Remove inline and fenced code blocks
- **Remove em-dash separators** - Clean up paragraph separators
- **Remove list markers** - Strip -, *, •, 1. at line start
- **Remove blockquote marks** - Strip > at line start
- **Normalize whitespace** - Convert NBSP to space, collapse multiple spaces
- **Collapse blank lines** - Reduce multiple blank lines to double

### Additional Cleaning Options
- **Remove URLs** - Strip http://, https://, www. links
- **Remove email addresses** - Clean out email addresses
- **Remove phone numbers** - Strip phone number patterns
- **Remove timestamps** - Clean HH:MM:SS, MM/DD/YYYY formats
- **Remove special characters** - Strip !@#$%^&* etc.
- **Remove extra punctuation** - Clean multiple periods, commas
- **Remove repeated words** - Deduplicate consecutive identical words
- **Remove empty lines** - Strip completely empty lines
- **Remove trailing spaces** - Clean end-of-line whitespace
- **Remove leading spaces** - Strip beginning-of-line whitespace

## Pricing Tiers

### 🆓 Free Tier
- 3 cleanings per day
- Up to 2,000 characters per cleaning
- Basic cleaning features
- Community support

### 💰 Subscription Plans

| Plan | Price | Characters | Processing | Value | Savings |
|------|-------|------------|------------|-------|---------|
| 🟦 Monthly | **$6.99** | 50,000 | 20+ hours | $500+ | – |
| 🟩 Quarterly | **$19.99** | 200,000 | 80+ hours | $2,000+ | 5% off |
| 🟨 6 Months | **$34.99** | 500,000 | 200+ hours | $5,000+ | ⭐ **17% off** |
| 🟧 Yearly | **$49.99** | 1,000,000 | 400+ hours | $10,000+ | 🔥 **40% off** |
| 🟥 2 Years | **$79.99** | 2,000,000 | 800+ hours | $20,000+ | 💎 **52% off** |

### 🚀 Add-on Features

#### 👥 Team License - $9.99/month
- Shared preset pack + priority support
- Team collaboration tools
- Team usage analytics
- Custom team branding

#### ⚙️ Pro Preset Pack - $4.99/month
- CMS-focused: WordPress, Notion, Substack, HubSpot
- One-click CMS cleaning
- Platform-specific optimizations

#### ✍️ Writers' Toolkit - $7.99/month
- Sentence-case rules + style-safe clean
- Writing style preservation
- Author-specific presets
- Publishing optimization

#### 💻 Dev Mode - $5.99/month
- Preserve code fences, tabs/spaces, escape sequences
- Syntax highlighting safe
- Developer presets
- Code structure preservation

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ace-paste-cleaner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How It Works

1. **Paste messy text** into Ace Paste Cleaner
2. **Toggle cleaning rules** (or choose a preset)
3. **Copy clean output**, or export to .txt/.md

### Perfect For
Writers • Editors • Marketers • Students • Developers • Researchers • VA teams • CMS managers • Support teams

### What's Included
- Web app access at **acepaste.xyz**
- 6 starter presets (Blog, Docs→CMS, Academic, Email, Markdown, Dev Snippets)
- Quick-start guide (PDF)
- Keyboard shortcuts cheat-sheet (PNG)
- Lifetime updates for v1.x

### Tech Requirements
Any modern browser (Chrome, Edge, Firefox, Safari). Works on desktop and mobile. No installation required.

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Modern JavaScript** - ES2020+ features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## FAQ

**Does my text leave my device?**
No—processing happens in your browser.

**Can I keep certain formatting?**
Yes. Toggle rules individually or build a preset.

**Will it change my content?**
Only the rules you enable. Defaults aim for safe cleaning.

**Does it handle big chunks?**
Yes. Batch mode is built for long articles/emails.

**Markdown?**
Enable "Markdown-safe" to preserve # \* \_ \` and code blocks.

**Teams?**
Use the Team license for shared presets with your team.

## Support

Questions or feature requests? Email [support@acepaste.xyz](mailto:support@acepaste.xyz) or use the in-app link.

**Refunds:**
If Ace doesn't save you time, request a refund within 14 days—no drama.

## License

MIT License - see LICENSE file for details

