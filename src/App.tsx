import React, { useMemo, useState } from "react";
import { useAuth } from "./hooks/useAuth0";
import { AuthModal } from "./components/AuthModal";
import { PaywallModal } from "./components/PaywallModal";
import { UsageIndicator } from "./components/UsageIndicator";

type Options = {
  removeInvisible: boolean;
  keepVS16Emoji: boolean;
  preserveEmoji: boolean;
  preserveIndicJoiners: boolean;
  preserveArabicZWNJ: boolean;
  stripMarkdownHeaders: boolean;
  stripBoldItalic: boolean;
  stripBackticks: boolean;
  stripEmDashSeparators: boolean;
  stripListMarkers: boolean;
  stripBlockquotes: boolean;
  normalizeWhitespace: boolean;
  collapseBlankLines: boolean;
  // new:
  nukeAll: boolean; // ignore all preserves + remove VS16
};

const SENTINEL_ZWJ = "\uE000"; // Private Use; restore → U+200D
const SENTINEL_ZWNJ = "\uE001"; // Private Use; restore → U+200C

export default function AcePasteFinalCleaner() {
  const [input, setInput] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'daily_limit' | 'text_length' | 'feature_required'>('daily_limit');
  const { user, usage, recordCleaning, canClean, getRemainingCleanings, isAuthenticated, isLoading, signOut } = useAuth();
  
  const [opts, setOpts] = useState<Options>({
    removeInvisible: true,
    keepVS16Emoji: true,
    preserveEmoji: true,
    preserveIndicJoiners: true,
    preserveArabicZWNJ: true,
    stripMarkdownHeaders: true,
    stripBoldItalic: true,
    stripBackticks: true,
    stripEmDashSeparators: true,
    stripListMarkers: true,
    stripBlockquotes: true,
    normalizeWhitespace: true,
    collapseBlankLines: true,
    nukeAll: false,
  });

  const eff = useMemo(() => effectiveOptions(opts), [opts]);
  const cleaned = useMemo(() => {
    if (!isAuthenticated || !canClean(input.length)) {
      return input; // Return original text if can't clean
    }
    return cleanText(input, eff);
  }, [input, eff, isAuthenticated, canClean]);

  const stats = useMemo(() => ({ inLen: input.length, outLen: cleaned.length }), [input, cleaned]);
  const markersIn = useMemo(() => countMarkers(input), [input]);
  const markersOut = useMemo(() => countMarkers(cleaned), [cleaned]);

  function toggle<K extends keyof Options>(key: K) {
    setOpts(o => ({ ...o, [key]: !o[key] }));
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cleaned);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error('Failed to paste text: ', err);
    }
  };

  const handleClean = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    if (!canClean(input.length)) {
      if (input.length > 2000) {
        setPaywallReason('text_length');
      } else {
        setPaywallReason('daily_limit');
      }
      setShowPaywall(true);
      return;
    }
    
    // Record the cleaning usage
    await recordCleaning();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6">
      <div className="mx-auto max-w-6xl grid gap-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <img 
              src="/logo.svg" 
              alt="Ace Paste Cleaner Logo" 
              className="h-12 w-auto"
            />
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Ace Paste — Cleaner</h1>
          </div>
          <div className="flex gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-400">
                  {user?.email}
                </span>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm hover:bg-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 active:translate-y-[1px]"
              >
                Sign In
              </button>
            )}
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-medium hover:bg-emerald-400 active:translate-y-[1px]"
            >Copy cleaned</button>
            <button
              onClick={pasteFromClipboard}
              className="px-4 py-2 rounded-xl bg-yellow-500 text-yellow-950 font-medium hover:bg-yellow-400 active:translate-y-[1px]"
            >Paste</button>
            <button
              onClick={() => setInput("")}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700"
            >Clear</button>
          </div>
        </header>

        {/* Usage Indicator */}
        {isAuthenticated ? (
          <UsageIndicator 
            user={user} 
            usage={usage} 
            onUpgrade={() => setShowPaywall(true)} 
          />
        ) : (
          <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="text-blue-400 text-lg">🔐</div>
              <div>
                <p className="text-blue-300 font-medium">Sign in required</p>
                <p className="text-blue-300/80 text-sm">Create a free account to start cleaning text. No credit card required!</p>
              </div>
              <button
                onClick={() => setShowAuth(true)}
                className="ml-auto px-4 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-400 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Options Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <OptionGroup 
            title="Text Formatting" 
            options={[
              { key: 'stripMarkdownHeaders', label: 'Markdown Headers' },
              { key: 'stripBoldItalic', label: 'Bold/Italic Markers' },
              { key: 'stripBackticks', label: 'Code Blocks' },
              { key: 'stripListMarkers', label: 'List Markers' },
              { key: 'stripBlockquotes', label: 'Blockquotes' },
              { key: 'stripEmDashSeparators', label: 'Em-dash Separators' }
            ]}
            opts={opts}
            toggle={toggle}
          />
          
          <OptionGroup 
            title="Whitespace & Invisible" 
            options={[
              { key: 'removeInvisible', label: 'Invisible Characters' },
              { key: 'keepVS16Emoji', label: 'Keep Emoji VS16' },
              { key: 'preserveEmoji', label: 'Preserve Emoji Sequences' },
              { key: 'preserveIndicJoiners', label: 'Preserve Indic Joiners' },
              { key: 'preserveArabicZWNJ', label: 'Preserve Arabic ZWNJ' },
              { key: 'normalizeWhitespace', label: 'Normalize Whitespace' },
              { key: 'collapseBlankLines', label: 'Collapse Blank Lines' },
              { key: 'nukeAll', label: 'Remove ALL Invisibles' }
            ]}
            opts={opts}
            toggle={toggle}
          />
        </div>

        {/* Input and Output - Stacked Vertically */}
        <div className="grid gap-6">
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm uppercase tracking-wider text-neutral-400">Input</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setInput(""); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors text-sm font-medium animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
                <button
                  onClick={pasteFromClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500 text-yellow-950 hover:bg-yellow-400 transition-colors text-sm font-medium animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Paste
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your text here..."
              className="h-[30vh] w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* What was removed section - between input and output */}
          <Stats input={input} output={cleaned} opts={eff} markersIn={markersIn} markersOut={markersOut} />

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm uppercase tracking-wider text-neutral-400">Output</label>
              <div className="flex gap-2">
                <button
                  onClick={() => { setInput(""); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition-colors text-sm font-medium animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors text-sm font-medium animate-pulse"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Clean
                </button>
              </div>
            </div>
            <textarea
              value={cleaned}
              readOnly
              className="h-[30vh] w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 font-mono text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-neutral-400">
              © 2025 Ace Paste Cleaner. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => {/* TODO: Add privacy modal */}}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => {/* TODO: Add security modal */}}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Security Policy
              </button>
              <a
                href="https://github.com/sugarcypher/Ace-Paste-Cleaner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          // Refresh usage data after successful auth
          window.location.reload();
        }}
      />
      
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={(tierId) => {
          // upgradeUser(tierId); // TODO: Implement upgrade
          setShowPaywall(false);
        }}
        currentTier={user?.tier || 'free'}
        reason={paywallReason}
        currentTextLength={input.length}
      />
    </div>
  );
}

interface OptionGroupProps {
  title: string;
  options: Array<{ key: keyof Options; label: string }>;
  opts: Options;
  toggle: (key: keyof Options) => void;
}

function OptionGroup({ title, options, opts, toggle }: OptionGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const enabledCount = options.filter(opt => opts[opt.key]).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-200">{title}</span>
          {enabledCount > 0 && (
            <span className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded-full">
              {enabledCount}
            </span>
          )}
        </div>
        <svg 
          className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-neutral-800 border border-neutral-700 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <label key={option.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-700 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="size-4 accent-emerald-500" 
                checked={opts[option.key]} 
                onChange={() => toggle(option.key)} 
              />
              <span className="text-sm text-neutral-200">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface StatsProps {
  input: string;
  output: string;
  opts: Options;
  markersIn: any;
  markersOut: any;
}

function Stats({ input, output, opts, markersIn, markersOut }: StatsProps) {
  const removedChars = Math.max(0, input.length - output.length);
  
  // Calculate what was actually removed based on options
  const removedItems = useMemo(() => {
    const items = [];
    
    if (opts.removeInvisible) {
      const totalInvisible = markersIn.zwsp + markersIn.wj + markersIn.zwnj + markersIn.zwj + markersIn.shy + markersIn.dirMarks + markersIn.bom;
      if (totalInvisible > 0) {
        const details = [];
        if (markersIn.zwsp > 0) details.push(`${markersIn.zwsp} Zero Width Spaces`);
        if (markersIn.wj > 0) details.push(`${markersIn.wj} Word Joiners`);
        if (markersIn.zwnj > 0) details.push(`${markersIn.zwnj} Zero Width Non-Joiners`);
        if (markersIn.zwj > 0) details.push(`${markersIn.zwj} Zero Width Joiners`);
        if (markersIn.shy > 0) details.push(`${markersIn.shy} Soft Hyphens`);
        if (markersIn.dirMarks > 0) details.push(`${markersIn.dirMarks} Direction Marks`);
        if (markersIn.bom > 0) details.push(`${markersIn.bom} Byte Order Marks`);
        items.push({ type: 'invisible', count: totalInvisible, label: 'Invisible Characters', details });
      }
    }
    
    if (opts.stripMarkdownHeaders) {
      const headerMatches = input.match(/^\s{0,3}#{1,6}\s+/gmu) || [];
      if (headerMatches.length > 0) {
        const details = headerMatches.map(h => h.trim());
        items.push({ type: 'markdown', count: headerMatches.length, label: 'Markdown Headers', details });
      }
    }
    
    if (opts.stripBoldItalic) {
      const boldMatches = input.match(/\*\*.*?\*\*/gmsu) || [];
      const italicMatches = input.match(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/gmsu) || [];
      const underlineMatches = input.match(/__.*?__/gmsu) || [];
      const strikeMatches = input.match(/~~.*?~~/gmsu) || [];
      const totalFormatting = boldMatches.length + italicMatches.length + underlineMatches.length + strikeMatches.length;
      
      if (totalFormatting > 0) {
        const details = [];
        if (boldMatches.length > 0) details.push(`${boldMatches.length} Bold markers (**)`);
        if (italicMatches.length > 0) details.push(`${italicMatches.length} Italic markers (*)`);
        if (underlineMatches.length > 0) details.push(`${underlineMatches.length} Underline markers (__)`);
        if (strikeMatches.length > 0) details.push(`${strikeMatches.length} Strikethrough markers (~~)`);
        items.push({ type: 'formatting', count: totalFormatting, label: 'Text Formatting', details });
      }
    }
    
    return items;
  }, [input, opts, markersIn]);

  return (
    <div className="space-y-3 mt-2">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <Metric 
          k="Length (in → out)" 
          v={`${input.length} → ${output.length}`} 
          isActive={input.length > 0}
        />
        <Metric 
          k="Removed (chars)" 
          v={`${removedChars}`} 
          isActive={removedChars > 0}
        />
        <Metric 
          k="Removed Types" 
          v={`${removedItems.length}`} 
          isActive={removedItems.length > 0}
        />
      </div>
      
      {/* Detailed Removal Breakdown */}
      {removedItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-300 mb-2">What was removed:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {removedItems.map((item, index) => (
              <RemovedItem key={index} item={item} />
            ))}
          </div>
        </div>
      )}
      
      {/* No changes message */}
      {removedItems.length === 0 && removedChars === 0 && input.length > 0 && (
        <div className="text-center py-4 text-neutral-400">
          <div className="text-2xl mb-2">✨</div>
          <div className="text-sm">No changes needed - your text is already clean!</div>
        </div>
      )}
    </div>
  );
}

interface RemovedItemProps {
  item: {
    type: string;
    count: number;
    label: string;
    details?: string[];
  };
}

function RemovedItem({ item }: RemovedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getColorClasses = (type: string) => {
    switch (type) {
      case 'invisible':
        return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
      case 'markdown':
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'formatting':
        return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
      default:
        return 'bg-neutral-500/20 border-neutral-500/30 text-neutral-300';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'invisible':
        return '👻';
      case 'markdown':
        return '📝';
      case 'formatting':
        return '🎨';
      default:
        return '🗑️';
    }
  };

  return (
    <div className={`rounded-xl border p-3 ${getColorClasses(item.type)} cursor-pointer hover:opacity-80 transition-opacity`}
         onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getIcon(item.type)}</span>
        <div className="flex-1">
          <div className="text-sm font-medium">{item.label}</div>
          <div className="text-xs opacity-75">{item.count} {item.count === 1 ? 'item' : 'items'} removed</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold">{item.count}</div>
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && item.details && item.details.length > 0 && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="text-xs font-medium mb-2 opacity-90">Details:</div>
          <div className="space-y-1">
            {item.details.map((detail, index) => (
              <div key={index} className="text-xs opacity-75 bg-black/10 rounded px-2 py-1 font-mono">
                {detail}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ k, v, isActive = false }: { k: string; v: string; isActive?: boolean }) {
  const getActiveClasses = () => {
    if (!isActive) return 'bg-neutral-900 border-neutral-800';
    
    // Determine color based on metric type
    if (k.includes('Length')) {
      return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
    } else if (k.includes('Removed (chars)')) {
      return 'bg-red-500/20 border-red-500/30 text-red-300';
    } else if (k.includes('Removed Types')) {
      return 'bg-green-500/20 border-green-500/30 text-green-300';
    }
    return 'bg-neutral-900 border-neutral-800';
  };

  return (
    <div className={`rounded-xl border p-3 transition-all duration-300 ${getActiveClasses()}`}>
      <div className={`text-[11px] uppercase tracking-wider ${isActive ? 'text-current/80' : 'text-neutral-400'}`}>{k}</div>
      <div className={`text-base font-medium ${isActive ? 'text-current' : ''}`}>{v}</div>
    </div>
  );
}

/* ——— Cleaning core ——— */

function effectiveOptions(opts: Options): Options {
  if (!opts.nukeAll) return opts;
  return {
    ...opts,
    keepVS16Emoji: false,
    preserveEmoji: false,
    preserveIndicJoiners: false,
    preserveArabicZWNJ: false,
  };
}

function cleanText(text: string, opts: Options): string {
  let t = text;

  // Protect emoji ZWJ sequences so we can strip stray ZWJ safely
  if (opts.preserveEmoji) {
    try {
      const EP = "\\p{Extended_Pictographic}";
      const reEmojiZWJ = new RegExp(`(${EP}(?:\\uFE0F)?)\\u200D(${EP})`, "gu");
      t = t.replace(reEmojiZWJ, (_, a, b) => `${a}${SENTINEL_ZWJ}${b}`);
      t = t.replace(reEmojiZWJ, (_, a, b) => `${a}${SENTINEL_ZWJ}${b}`); // catch longer chains
    } catch {
      const reFallback = /([\uD800-\uDBFF][\uDC00-\uDFFF])\u200D([\uD800-\uDBFF][\uDC00-\uDFFF])/gu;
      t = t.replace(reFallback, (_, a, b) => `${a}${SENTINEL_ZWJ}${b}`);
      t = t.replace(reFallback, (_, a, b) => `${a}${SENTINEL_ZWJ}${b}`);
    }
  }

  // Protect Indic joiners
  if (opts.preserveIndicJoiners) {
    const INDIC = "\u0900-\u0DFF"; // broad range
    t = t.replace(new RegExp(`([${INDIC}])\\u200D([${INDIC}])`, "gu"), (_, a, b) => `${a}${SENTINEL_ZWJ}${b}`);
    t = t.replace(new RegExp(`([${INDIC}])\\u200C([${INDIC}])`, "gu"), (_, a, b) => `${a}${SENTINEL_ZWNJ}${b}`);
  }

  // Protect Arabic/Persian ZWNJ
  if (opts.preserveArabicZWNJ) {
    const AR = "\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF";
    t = t.replace(new RegExp(`([${AR}])\\u200C([${AR}])`, "gu"), (_, a, b) => `${a}${SENTINEL_ZWNJ}${b}`);
  }

  if (opts.removeInvisible) {
    // Explicit ranges (BMP formats + BOM + interlinear + isolates/overrides)
    const invParts = [
      "\\u00AD",          // SOFT HYPHEN
      "\\u034F",          // CGJ
      "\\u061C",          // ALM
      "\\u180B-\\u180E",  // Mongolian selectors + MVS
      "\\u200B-\\u200F",  // ZWSP..RLM
      "\\u202A-\\u202E",  // embeddings/overrides + PDF
      "\\u2060-\\u2064",  // WJ + invis ops
      "\\u2066-\\u2069",  // bidi isolates
      "\\uFEFF",          // BOM/ZWNBSP
      "\\uFFF9-\\uFFFB",  // interlinear annotation controls
    ];
    if (!opts.keepVS16Emoji) invParts.push("\\uFE00-\\uFE0F"); else invParts.push("\\uFE00-\\uFE0E");

    const bmp = new RegExp("[" + invParts.join("") + "]", "gu");
    t = t.replace(bmp, "");

    // Supplementary variation selectors (IVS)
    try { t = t.replace(/[\u{E0100}-\u{E01EF}]/gu, ""); } catch {}
    // Plane-14 TAG characters (invisible tags sometimes used for watermarking)
    try { t = t.replace(/[\u{E0000}-\u{E007F}]/gu, ""); } catch {}
  }

  // Restore protected joiners
  if (opts.preserveEmoji || opts.preserveIndicJoiners || opts.preserveArabicZWNJ) {
    t = t.replace(/\uE000/gu, "\u200D");
    t = t.replace(/\uE001/gu, "\u200C");
  }

  // Markdown / formatting cleanup
  if (opts.stripMarkdownHeaders) t = t.replace(/^\s{0,3}(#{1,6})\s+/gmu, "");
  if (opts.stripBoldItalic) {
    t = t.replace(/\*\*([^*\n]+)\*\*/gmu, "$1").replace(/__([^_\n]+)__/gmu, "$1");
    t = t.replace(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/gmu, "$1");
    t = t.replace(/(?<!_)_(?!_)([^_\n]+)_(?!_)/gmu, "$1");
    t = t.replace(/~~([^~\n]+)~~/gmu, "$1");
  }
  if (opts.stripBackticks) {
    t = t.replace(/^```[^\n]*\n([\s\S]*?)\n```\s*$/gmu, "$1\n");
    t = t.replace(/`([^`]+)`/gmu, "$1");
  }
  if (opts.stripEmDashSeparators) {
    t = t.replace(/^\s*[—–-]{2,}\s*$/gmu, "");
    t = t.replace(/\n\s*[—–]\s*\n/gmu, "\n\n");
  }
  if (opts.stripListMarkers) t = t.replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/gmu, "");
  if (opts.stripBlockquotes) t = t.replace(/^\s{0,3}>\s?/gmu, "");

  if (opts.normalizeWhitespace) {
    // Normalize all Unicode space separators → ASCII space
    t = t.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ");
    // Collapse 2+ spaces inside tokens
    t = t.replace(/(\S) {2,}(?=\S)/g, "$1 ");
    // Trim trailing spaces per line
    t = t.replace(/[ \t]+$/gmu, "");
  }
  if (opts.collapseBlankLines) t = t.replace(/\n{3,}/g, "\n\n");

  return t;
}

// Count key markers (used for both input and output)
function countMarkers(text: string) {
  const m = { zwsp:0, wj:0, zwnj:0, zwj:0, shy:0, vs16:0, dirMarks:0, bom:0,
              headers:0, boldItalics:0, backticks:0, dashSeparators:0, blockquotes:0, listMarkers:0 } as any;
  for (let i=0; i<text.length;) {
    const cp = text.codePointAt(i)!;
    i += cp > 0xFFFF ? 2 : 1;
    if (cp === 0x200B) m.zwsp++;
    else if (cp === 0x2060) m.wj++;
    else if (cp === 0x200C) m.zwnj++;
    else if (cp === 0x200D) m.zwj++;
    else if (cp === 0x00AD) m.shy++;
    else if (cp === 0xFE0F) m.vs16++;
    else if (cp === 0x200E || cp === 0x200F || cp === 0x061C) m.dirMarks++;
    else if (cp === 0xFEFF) m.bom++;
  }
  m.headers = (text.match(/^\s{0,3}#{1,6}\s+/gmu) || []).length;
  m.boldItalics = (text.match(/\*\*|__|(?<!\*)\*(?!\*)|(?<!_)_(?!_)/gmu) || []).length;
  m.backticks = (text.match(/```|`/gmu) || []).length;
  m.dashSeparators = (text.match(/^\s*[—–-]{2,}\s*$/gmu) || []).length;
  m.blockquotes = (text.match(/^\s{0,3}>\s?/gmu) || []).length;
  m.listMarkers = (text.match(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/gmu) || []).length;
  return m;
}
