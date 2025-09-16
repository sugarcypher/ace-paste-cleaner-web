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

