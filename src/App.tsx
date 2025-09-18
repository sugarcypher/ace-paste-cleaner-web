import React, { useMemo, useState } from "react";

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
  const cleaned = useMemo(() => cleanText(input, eff), [input, eff]);

  const stats = useMemo(() => ({ inLen: input.length, outLen: cleaned.length }), [input, cleaned]);
  const markersIn = useMemo(() => countMarkers(input), [input]);
  const markersOut = useMemo(() => countMarkers(cleaned), [cleaned]);

  function toggle<K extends keyof Options>(key: K) {
    setOpts(o => ({ ...o, [key]: !o[key] }));
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
              <Check label="Preserve Indic joiners (ZWJ/ZWNJ in Devanagari–Malayalam)" checked={opts.preserveIndicJoiners} onChange={() => toggle("preserveIndicJoiners")} />
              <Check label="Preserve ZWNJ in Arabic/Persian" checked={opts.preserveArabicZWNJ} onChange={() => toggle("preserveArabicZWNJ")} />
              <Check label="Strip Markdown headers (#, ##, ###)" checked={opts.stripMarkdownHeaders} onChange={() => toggle("stripMarkdownHeaders")} />
              <Check label="Strip bold/italic markers (** __ * _)" checked={opts.stripBoldItalic} onChange={() => toggle("stripBoldItalic")} />
              <Check label="Strip backticks (inline & fenced)" checked={opts.stripBackticks} onChange={() => toggle("stripBackticks")} />
              <Check label="Remove em-dash separator lines" checked={opts.stripEmDashSeparators} onChange={() => toggle("stripEmDashSeparators")} />
              <Check label="Remove list markers (-, *, •, 1.)" checked={opts.stripListMarkers} onChange={() => toggle("stripListMarkers")} />
              <Check label="Remove blockquote marks (>)" checked={opts.stripBlockquotes} onChange={() => toggle("stripBlockquotes")} />
              <Check label="Normalize spaces (NBSP/EM/EN/Hair/Ideographic → space; trim)" checked={opts.normalizeWhitespace} onChange={() => toggle("normalizeWhitespace")} />
              <Check label="Collapse multiple blank lines" checked={opts.collapseBlankLines} onChange={() => toggle("collapseBlankLines")} />
              <Check label="Remove ALL invisibles (ignore preserves & remove VS16)" checked={opts.nukeAll} onChange={() => toggle("nukeAll")} />
            </fieldset>
          </div>

          <div className="grid gap-3">
            <label className="text-sm uppercase tracking-wider text-neutral-400">Output</label>
            <textarea
              value={cleaned}
              readOnly
              className="h-[40vh] w-full rounded-2xl bg-neutral-900 border border-neutral-800 p-4 font-mono text-sm"
            />

            {/* Input counts */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mt-1">
              <Metric k="In → Out" v={`${stats.inLen} → ${stats.outLen}`} />
              <Metric k="Removed" v={`${Math.max(0, stats.inLen - stats.outLen)}`} />
              <Metric k="ZWSP (in)" v={`${markersIn.zwsp}`} />
              <Metric k="WJ (in)" v={`${markersIn.wj}`} />
              <Metric k="ZWNJ (in)" v={`${markersIn.zwnj}`} />
              <Metric k="ZWJ (in)" v={`${markersIn.zwj}`} />
              <Metric k="SHY (in)" v={`${markersIn.shy}`} />
              <Metric k="VS16 (in)" v={`${markersIn.vs16}`} />
              <Metric k="LRM/RLM/ALM (in)" v={`${markersIn.dirMarks}`} />
              <Metric k="BOM (in)" v={`${markersIn.bom}`} />
              <Metric k="# headers (in)" v={`${markersIn.headers}`} />
              <Metric k="**/*** (in)" v={`${markersIn.boldItalics}`} />
              <Metric k="` backticks (in)" v={`${markersIn.backticks}`} />
              <Metric k="— separators (in)" v={`${markersIn.dashSeparators}`} />
              <Metric k="> quotes (in)" v={`${markersIn.blockquotes}`} />
              <Metric k="List markers (in)" v={`${markersIn.listMarkers}`} />
            </div>

            {/* Output counts */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mt-3">
              <Metric k="ZWSP (out)" v={`${markersOut.zwsp}`} />
              <Metric k="WJ (out)" v={`${markersOut.wj}`} />
              <Metric k="ZWNJ (out)" v={`${markersOut.zwnj}`} />
              <Metric k="ZWJ (out)" v={`${markersOut.zwj}`} />
              <Metric k="SHY (out)" v={`${markersOut.shy}`} />
              <Metric k="VS16 (out)" v={`${markersOut.vs16}`} />
              <Metric k="LRM/RLM/ALM (out)" v={`${markersOut.dirMarks}`} />
              <Metric k="BOM (out)" v={`${markersOut.bom}`} />
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
