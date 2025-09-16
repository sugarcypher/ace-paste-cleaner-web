# Ace Paste Cleaner

A powerful text cleaner for removing invisible characters, markdown formatting, and other unwanted elements from pasted text.

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
- 5 cleanings per day
- Up to 10,000 characters per cleaning
- Basic cleaning features
- Community support

### 💰 Flexible Pricing Options

#### Daily - $1.23/day
- Unlimited cleanings
- Up to 50,000 characters
- All cleaning features
- Priority support
- Advanced detection

#### Weekly - $2.34/week
- Unlimited cleanings
- Up to 100,000 characters
- All cleaning features
- Priority support
- Advanced detection
- Bulk processing

#### Monthly - $3.45/month
- Unlimited cleanings
- Unlimited text length
- All cleaning features
- Priority support
- Advanced detection
- Bulk processing
- API access

#### Yearly - $45.67/year
- Everything in Monthly
- 2 months free
- Priority support
- Custom integrations
- Team management

#### 2 Years - $56.78/year
- Everything in Yearly
- 4 months free
- White-label options

#### 3 Years - $67.89/year
- Everything in 2 Years
- 6 months free
- Dedicated support

#### 4 Years - $78.90/year
- Everything in 3 Years
- 8 months free
- Custom branding

#### 🏆 Lifetime - $99.99 (One-time)
- Everything forever
- Unlimited everything
- Priority support
- Custom integrations
- Team management
- White-label options
- Dedicated support
- Custom branding
- Future updates included

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

## Usage

1. Paste your text into the input area
2. Toggle the cleaning options you want to apply
3. View the cleaned output in real-time
4. Copy the cleaned text to your clipboard
5. Use the stats panel to see what was removed

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

## License

MIT License - see LICENSE file for details

