import React, { useMemo, useState } from "react";

interface CleanOptions {
  removeInvisible: boolean;
  keepVS16Emoji: boolean;
  preserveEmoji: boolean;
  stripMarkdownHeaders: boolean;
  stripBoldItalic: boolean;
  stripBackticks: boolean;
  stripEmDashSeparators: boolean;
  stripListMarkers: boolean;
  stripBlockquotes: boolean;
  normalizeWhitespace: boolean;
  collapseBlankLines: boolean;
}

export default function App() {
  const [input, setInput] = useState("");
  const [opts, setOpts] = useState<CleanOptions>({
    removeInvisible: true,
    keepVS16Emoji: true,
    preserveEmoji: true,
    stripMarkdownHeaders: true,
    stripBoldItalic: true,
    stripBackticks: true,
    stripEmDashSeparators: true,
    stripListMarkers: true,
    stripBlockquotes: true,
    normalizeWhitespace: true,
    collapseBlankLines: true,
  });

  const cleaned = useMemo(() => cleanText(input, opts), [input, opts]);
  const stats = useMemo(() => getStats(input, cleaned), [input, cleaned]);
  const markers = useMemo(() => countMarkers(input), [input]);

  function toggle(key: keyof CleanOptions) {
    setOpts((o) => ({ ...o, [key]: !o[key] }));
  }

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6">
      <div className="mx-auto max-w-6xl grid gap-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Ace Paste — Cleaner</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(cleaned)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-neutral-950 font-medium hover:bg-emerald-400 active:translate-y-[1px]"
            >Copy cleaned</button>
            <button
              onClick={() => navigator.clipboard.writeText(input)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700"
            >Copy input</button>
            <button
              onClick={() => setInput("")}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700"
            >Clear</button>
          </div>
        </header>

        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
          <div className="grid gap-3">
            <label className="text-sm uppercase tracking-wider text-neutral-400">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste here"
              className="h-[40vh] w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />

            <fieldset className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 mt-1">
              <Check label="Remove invisible characters" checked={opts.removeInvisible} onChange={() => toggle("removeInvisible")} />
              <Check label="Keep emoji presentation selector (VS16)" checked={opts.keepVS16Emoji} onChange={() => toggle("keepVS16Emoji")} />
              <Check label="Preserve emoji sequences (ZWJ in 👩‍💻, 🏳️‍🌈, etc.)" checked={opts.preserveEmoji} onChange={() => toggle("preserveEmoji")} />
              <Check label="Strip Markdown headers (#, ##, ###)" checked={opts.stripMarkdownHeaders} onChange={() => toggle("stripMarkdownHeaders")} />
              <Check label="Strip bold/italic markers (** __ * _)" checked={opts.stripBoldItalic} onChange={() => toggle("stripBoldItalic")} />
              <Check label="Strip backticks (inline & fenced)" checked={opts.stripBackticks} onChange={() => toggle("stripBackticks")} />
              <Check label="Remove em-dash separator lines" checked={opts.stripEmDashSeparators} onChange={() => toggle("stripEmDashSeparators")} />
              <Check label="Remove list markers (-, *, •, 1.)" checked={opts.stripListMarkers} onChange={() => toggle("stripListMarkers")} />
              <Check label="Remove blockquote marks (>)" checked={opts.stripBlockquotes} onChange={() => toggle("stripBlockquotes")} />
              <Check label="Normalize spaces (NBSP→space; trim)" checked={opts.normalizeWhitespace} onChange={() => toggle("normalizeWhitespace")} />
              <Check label="Collapse multiple blank lines" checked={opts.collapseBlankLines} onChange={() => toggle("collapseBlankLines")} />
            </fieldset>
          </div>

          <div className="grid gap-3">
            <label className="text-sm uppercase tracking-wider text-neutral-400">Output</label>
            <textarea
              value={cleaned}
              readOnly
              className="h-[40vh] w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 font-mono text-sm"
            />

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mt-1">
              <Metric k="In → Out" v={`${stats.inLen} → ${stats.outLen}`} />
              <Metric k="Removed" v={`${Math.max(0, stats.inLen - stats.outLen)}`} />
              <Metric k="ZWSP" v={`${markers.zwsp}`} />
              <Metric k="WJ" v={`${markers.wj}`} />
              <Metric k="ZWNJ" v={`${markers.zwnj}`} />
              <Metric k="ZWJ" v={`${markers.zwj}`} />
              <Metric k="SHY" v={`${markers.shy}`} />
              <Metric k="VS16" v={`${markers.vs16}`} />
              <Metric k="LRM/RLM/ALM" v={`${markers.dirMarks}`} />
              <Metric k="BOM" v={`${markers.bom}`} />
              <Metric k="# headers" v={`${markers.headers}`} />
              <Metric k="**/***" v={`${markers.boldItalics}`} />
              <Metric k="` backticks" v={`${markers.backticks}`} />
              <Metric k="— separators" v={`${markers.dashSeparators}`} />
              <Metric k="> quotes" v={`${markers.blockquotes}`} />
              <Metric k="List markers" v={`${markers.listMarkers}`} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 cursor-pointer select-none">
      <input type="checkbox" className="size-4 accent-emerald-500" checked={checked} onChange={onChange} />
      <span className="text-sm text-neutral-200">{label}</span>
    </label>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-3">
      <div className="text-[11px] uppercase tracking-wider text-neutral-400">{k}</div>
      <div className="text-base">{v}</div>
    </div>
  );
}

// ————— Cleaning core —————

const SENTINEL_ZWJ = "\uE000"; // private-use for protected ZWJ

function cleanText(text: string, opts: CleanOptions): string {
  let t = text;

  // Protect emoji ZWJ between Extended_Pictographic
  if (opts.preserveEmoji) {
    try {
      const EP = "\\p{Extended_Pictographic}";
      const reEmojiZWJ = new RegExp(`(${EP}(?:\\uFE0F)?)\\u200D(${EP})`, "gu");
      t = t.replace(reEmojiZWJ, ($, a, b) => `${a}${SENTINEL_ZWJ}${b}`);
      // Repeat to catch longer chains (family emojis)
      t = t.replace(reEmojiZWJ, ($, a, b) => `${a}${SENTINEL_ZWJ}${b}`);
    } catch {
      // Fallback without \p{Extended_Pictographic}
      const reFallback = /([\uD800-\uDBFF][\uDC00-\uDFFF])\u200D([\uD800-\uDBFF][\uDC00-\uDFFF])/gu;
      t = t.replace(reFallback, ($, a, b) => `${a}${SENTINEL_ZWJ}${b}`);
      t = t.replace(reFallback, ($, a, b) => `${a}${SENTINEL_ZWJ}${b}`);
    }
  }

  if (opts.removeInvisible) {
    const invParts = [
      "\\u00AD",          // SOFT HYPHEN
      "\\u034F",          // CGJ
      "\\u061C",          // ALM
      "\\u180B-\\u180E", // Mongolian selectors + MVS
      "\\u200B-\\u200F", // ZWSP..RLM
      "\\u202A-\\u202E", // embeddings/overrides + PDF
      "\\u2060-\\u2064", // WJ + invisible ops
      "\\u2066-\\u2069", // bidi isolates
      "\\uFEFF",          // BOM/ZWNBSP
      "\\uFFF9-\\uFFFB", // interlinear
    ];
    if (!opts.keepVS16Emoji) invParts.push("\\uFE00-\\uFE0F"); else invParts.push("\\uFE00-\\uFE0E");

    const bmp = new RegExp("[" + invParts.join("") + "]", "gu");
    t = t.replace(bmp, "");
    // Supplementary variation selectors
    t = t.replace(/[\u{E0100}-\u{E01EF}]/gu, "");
    // Plane-14 TAG characters
    t = t.replace(/[\u{E0000}-\u{E007F}]/gu, "");
  }

  // Restore protected joiners
  if (opts.preserveEmoji) {
    t = t.replace(/\uE000/gu, "\u200D");
  }

  if (opts.stripMarkdownHeaders) {
    t = t.replace(/^\s{0,3}#{1,6}\s+/gmu, "");
  }

  if (opts.stripBoldItalic) {
    t = t.replace(/\*\*(.*?)\*\*/gmsu, "$1");
    t = t.replace(/__(.*?)__/gmsu, "$1");
    t = t.replace(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/gmsu, "$1");
    t = t.replace(/(?<!_)_(?!_)([^_\n]+)_(?<!_)/gmsu, "$1");
    t = t.replace(/~~(.*?)~~/gmsu, "$1");
  }

  if (opts.stripBackticks) {
    t = t.replace(/^```[^\n]*\n([\s\S]*?)\n```\s*$/gmu, "$1\n");
    t = t.replace(/`([^`]+)`/gmu, "$1");
  }

  if (opts.stripEmDashSeparators) {
    t = t.replace(/^\s*[—–-]{2,}\s*$/gmu, "");
    t = t.replace(/\n\s*[—–]\s*\n/gmu, "\n\n");
  }

  if (opts.stripListMarkers) {
    t = t.replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/gmu, "");
  }

  if (opts.stripBlockquotes) {
    t = t.replace(/^\s{0,3}>\s?/gmu, "");
  }

  if (opts.normalizeWhitespace) {
    // All Zs spaces → ASCII space
    t = t.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ");
    // Collapse 2+ spaces to 1 (but not across newlines)
    t = t.replace(/(\S) {2,}(?=\S)/g, "$1 ");
    // Trim trailing spaces
    t = t.replace(/[ \t]+$/gmu, "");
  }

  if (opts.collapseBlankLines) {
    t = t.replace(/\n{3,}/g, "\n\n");
  }

  return t;
}

function getStats(input: string, output: string) {
  return { inLen: input.length, outLen: output.length };
}

function countMarkers(text: string) {
  const m = {
    zwsp: 0, wj: 0, zwnj: 0, zwj: 0, shy: 0, vs16: 0, dirMarks: 0, bom: 0,
    headers: 0, boldItalics: 0, backticks: 0, dashSeparators: 0, blockquotes: 0, listMarkers: 0,
  };
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp === 0x200B) m.zwsp++; else if (cp === 0x2060) m.wj++; else if (cp === 0x200C) m.zwnj++; else if (cp === 0x200D) m.zwj++; else if (cp === 0x00AD) m.shy++; else if (cp === 0xFE0F) m.vs16++; else if (cp === 0x200E || cp === 0x200F || cp === 0x061C) m.dirMarks++; else if (cp === 0xFEFF) m.bom++;
  }
  m.headers = (text.match(/^\s{0,3}#{1,6}\s+/gmu) || []).length;
  m.boldItalics = (text.match(/\*\*|__|(?<!\*)\*(?!\*)|(?<!_)_(?!_)/gmu) || []).length;
  m.backticks = (text.match(/```|`/gmu) || []).length;
  m.dashSeparators = (text.match(/^\s*[—–-]{2,}\s*$/gmu) || []).length;
  m.blockquotes = (text.match(/^\s{0,3}>\s?/gmu) || []).length;
  m.listMarkers = (text.match(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/gmu) || []).length;
  return m;
}
