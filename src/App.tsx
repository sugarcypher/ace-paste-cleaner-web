import { useMemo, useState } from "react";
import { useSimpleAuth } from "./hooks/useSimpleAuth";
import { PaywallModal } from "./components/PaywallModal";
import { UsageIndicator } from "./components/UsageIndicator";
import { SecurityOptions } from "./components/SecurityOptions";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { SecurityPolicy } from "./components/SecurityPolicy";
import { PrivacyAgreement } from "./components/PrivacyAgreement";
import { SecurityProvider, useSecurity } from "./contexts/SecurityContext";
import { stripInvisibleCharacters } from "./utils/advancedInvisibleCharacters";
import { GumroadWebhookHandler } from "./components/GumroadWebhookHandler";
import { Header } from "./components/Header";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SimpleAuthModal } from "./components/SimpleAuthModal";

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
  // Additional options for removing other things
  removeUrls: boolean;
  removeEmailAddresses: boolean;
  removePhoneNumbers: boolean;
  removeTimestamps: boolean;
  removeSpecialCharacters: boolean;
  removeExtraPunctuation: boolean;
  removeRepeatedWords: boolean;
  removeEmptyLines: boolean;
  removeTrailingSpaces: boolean;
  removeLeadingSpaces: boolean;
  // New features from README
  caseConversion: 'none' | 'lowercase' | 'uppercase' | 'titlecase' | 'sentencecase';
  removeUTMParameters: boolean;
  markdownSafeMode: boolean;
  preserveCodeFences: boolean;
  preserveTabsSpaces: boolean;
  preserveEscapeSequences: boolean;
}


interface StatsProps {
  input: string;
  output: string;
  opts: CleanOptions;
}

interface MetricProps {
  k: string;
  v: string;
  isActive?: boolean;
}

function AppContent() {
  const [input, setInput] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showPrivacyAgreement, setShowPrivacyAgreement] = useState(false);
  const [paywallReason, setPaywallReason] = useState<'daily_limit' | 'text_length' | 'feature_required'>('daily_limit');
  const [isSavingFeatures, setIsSavingFeatures] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Get auth data from simple authentication
  const { user, usage, recordCleaning, canClean, signIn, signUp, signOut } = useSimpleAuth();
  const { hasAcceptedTerms, securitySettings } = useSecurity();
  
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
    removeUrls: false,
    removeEmailAddresses: false,
    removePhoneNumbers: false,
    removeTimestamps: false,
    removeSpecialCharacters: false,
    removeExtraPunctuation: false,
    removeRepeatedWords: false,
    removeEmptyLines: false,
    removeTrailingSpaces: false,
    removeLeadingSpaces: false,
    // New features
    caseConversion: 'none',
    removeUTMParameters: false,
    markdownSafeMode: false,
    preserveCodeFences: false,
    preserveTabsSpaces: false,
    preserveEscapeSequences: false,
  });

  function toggle(key: keyof CleanOptions) {
    setOpts((o) => {
      const currentValue = o[key];
      if (typeof currentValue === 'boolean') {
        return { ...o, [key]: !currentValue };
      }
      return o;
    });
  }

  const cleaned = useMemo(() => {
    // Only clean if user is authenticated
    if (!user) {
      return input; // Return input as-is if not authenticated
    }
    
    // Use advanced invisible character detection if enabled
    if (opts.removeInvisible && securitySettings.encryptionLevel === 'enhanced') {
      return stripInvisibleCharacters(cleanText(input, opts));
    }
    
    return cleanText(input, opts);
  }, [input, opts, securitySettings, user]);

  const handleClean = async () => {
    // Check if user is authenticated first
    if (!user) {
      setPaywallReason('daily_limit');
      setShowPaywall(true);
      return;
    }
    
    if (!canClean(input.length)) {
      // Check character limits based on tier
      const maxLength = user?.tier === 'free' ? 2000 :
                       user?.tier === 'monthly' ? 50000 :
                       user?.tier === 'quarterly' ? 200000 :
                       user?.tier === 'six_months' ? 500000 :
                       user?.tier === 'yearly' ? 1000000 :
                       user?.tier === 'two_years' ? 2000000 : 2000000;
      
      if (input.length > maxLength) {
        setPaywallReason('text_length');
      } else {
        setPaywallReason('daily_limit');
      }
      setShowPaywall(true);
      return;
    }
    
    // Record the cleaning usage
    const success = await recordCleaning();
    if (!success) {
      setPaywallReason('daily_limit');
      setShowPaywall(true);
      return;
    }
    
    // The cleaning is already done by the cleaned useMemo, so we don't need to do anything else
    // The cleaned text will automatically update in the UI
  };

  const saveFeaturesConfiguration = async () => {
    if (!user) return;
    
    setIsSavingFeatures(true);
    try {
      // Save features configuration
      const config = {
        features: opts,
        timestamp: new Date().toISOString(),
        userId: user.id
      };
      
      // Store in localStorage for now (can be extended to backend)
      localStorage.setItem(`acepaste_features_${user.id}`, JSON.stringify(config));
      
      // Show success message
      alert('Features configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save features configuration:', error);
      alert('Failed to save features configuration. Please try again.');
    } finally {
      setIsSavingFeatures(false);
    }
  };

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

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Revolutionary Hero Section */}
      <div className="relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 animate-morph-float" style={{animationDelay: '0s'}}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl"></div>
          </div>
          <div className="absolute top-40 right-20 w-96 h-96 animate-morph-float" style={{animationDelay: '2s'}}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400/20 to-red-600/20 blur-3xl"></div>
          </div>
          <div className="absolute bottom-40 left-1/4 w-80 h-80 animate-morph-float" style={{animationDelay: '4s'}}>
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 blur-3xl"></div>
          </div>
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
          {/* Revolutionary Hero */}
          <div className="text-center mb-20 animate-slide-scale">
            <div className="inline-flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 animate-liquid-glow rounded-3xl flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center animate-morph-float">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 animate-shimmer">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                ACE PASTE
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                CLEANER
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform messy text into pristine content with our revolutionary AI-powered cleaning engine. 
              <span className="font-semibold text-blue-600">Clean • Normalize • Perfect</span>
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-12">
          
              {!hasAcceptedTerms && (
                <button
                  onClick={() => setShowPrivacyAgreement(true)}
                  className="btn-neo flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Accept Privacy Terms
                </button>
              )}
              
              <button
                onClick={pasteFromClipboard}
                className="btn-glow flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Quick Paste
              </button>
              
              <button
                onClick={copyToClipboard}
                className="btn-ultra flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Clean Text
              </button>
            </div>
            
            {/* Revolutionary Feature Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
              <div className="card-glow text-center" style={{'--delay': '0s'}}>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Clean thousands of characters in milliseconds with our optimized engine</p>
              </div>
              
              <div className="card-glow text-center" style={{'--delay': '0.2s'}}>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Smart Detection</h3>
                <p className="text-gray-600">Automatically identifies and removes invisible characters, formatting, and junk</p>
              </div>
              
              <div className="card-glow text-center" style={{'--delay': '0.4s'}}>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Privacy First</h3>
                <p className="text-gray-600">Your text never leaves your browser. 100% client-side processing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Indicator */}
        <div className="mb-8">
          <UsageIndicator 
            user={user} 
            usage={usage} 
            onUpgrade={() => setShowPaywall(true)} 
          />
        </div>

        {/* Security Options */}
        <div className="mb-8">
          <SecurityOptions />
        </div>

        {/* Features Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Cleaning Features</h2>
            <p className="text-slate-300">Choose what to clean from your text</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            title="Content Removal" 
            options={[
              { key: 'removeUrls', label: 'URLs' },
              { key: 'removeEmailAddresses', label: 'Email Addresses' },
              { key: 'removePhoneNumbers', label: 'Phone Numbers' },
              { key: 'removeTimestamps', label: 'Timestamps' },
              { key: 'removeSpecialCharacters', label: 'Special Characters' },
              { key: 'removeRepeatedWords', label: 'Repeated Words' }
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
              { key: 'normalizeWhitespace', label: 'Normalize Whitespace' },
              { key: 'collapseBlankLines', label: 'Collapse Blank Lines' },
              { key: 'removeEmptyLines', label: 'Remove Empty Lines' },
              { key: 'removeTrailingSpaces', label: 'Remove Trailing Spaces' },
              { key: 'removeLeadingSpaces', label: 'Remove Leading Spaces' }
            ]}
            opts={opts}
            toggle={toggle}
          />

          <OptionGroup 
            title="Advanced Features" 
            options={[
              { key: 'removeUTMParameters', label: 'Remove UTM Parameters' },
              { key: 'markdownSafeMode', label: 'Markdown Safe Mode' },
              { key: 'preserveCodeFences', label: 'Preserve Code Fences' },
              { key: 'preserveTabsSpaces', label: 'Preserve Tabs/Spaces' },
              { key: 'preserveEscapeSequences', label: 'Preserve Escape Sequences' }
            ]}
            opts={opts}
            toggle={toggle}
          />
          </div>
          
          {/* Save Features Configuration Button */}
          {user && (
            <div className="flex justify-center">
              <button
                onClick={saveFeaturesConfiguration}
                disabled={isSavingFeatures}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {isSavingFeatures ? 'Saving...' : 'Save Features'}
              </button>
            </div>
          )}
        </div>

        {/* Case Conversion Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Text Formatting</h3>
            <p className="text-slate-300">Transform your text case</p>
          </div>
          <div className="max-w-md mx-auto">
            <select
              value={opts.caseConversion}
              onChange={(e) => setOpts(prev => ({ ...prev, caseConversion: e.target.value as any }))}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 backdrop-blur-sm"
            >
              <option value="none">No conversion</option>
              <option value="lowercase">lowercase</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="titlecase">Title Case</option>
              <option value="sentencecase">Sentence case</option>
            </select>
          </div>
        </div>

          {/* Revolutionary Text Processing Interface */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Input Section */}
            <div className="card-ultra animate-slide-scale" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Input Text</h3>
                {user && (
                  <div className="text-sm">
                    {user.tier === 'admin' ? (
                      <span className="text-emerald-400 font-medium">
                        {input.length.toLocaleString()} chars (Unlimited)
                      </span>
                    ) : user.tier === 'free' ? (
                      <span className={input.length > 2000 ? 'text-red-400' : 'text-slate-300'}>
                        {input.length.toLocaleString()} / 2,000 chars
                      </span>
                    ) : user.tier === 'monthly' ? (
                      <span className={input.length > 50000 ? 'text-red-400' : 'text-slate-300'}>
                        {input.length.toLocaleString()} / 50,000 chars
                      </span>
                    ) : user.tier === 'quarterly' ? (
                      <span className={input.length > 200000 ? 'text-red-400' : 'text-slate-300'}>
                        {input.length.toLocaleString()} / 200,000 chars
                      </span>
                    ) : user.tier === 'six_months' ? (
                      <span className={input.length > 500000 ? 'text-red-400' : 'text-slate-300'}>
                        {input.length.toLocaleString()} / 500,000 chars
                      </span>
                    ) : user.tier === 'yearly' ? (
                      <span className={input.length > 1000000 ? 'text-red-400' : 'text-slate-300'}>
                        {input.length.toLocaleString()} / 1,000,000 chars
                      </span>
                    ) : user.tier === 'two_years' ? (
                      <span className={input.length > 2000000 ? 'text-red-400' : 'text-slate-300'}>
                        {input.length.toLocaleString()} / 2,000,000 chars
                      </span>
                    ) : (
                      <span className={input.length > 2000000 ? 'text-red-400' : 'text-slate-300'}>
                        {input.length.toLocaleString()} / 2,000,000 chars
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {!user && (
              <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-amber-300 text-sm text-center">
                  🔒 Please sign in to use the text cleaning features
                </p>
              </div>
            )}
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your text here to clean it..."
              className="w-full h-32 rounded-xl bg-slate-900/50 border border-slate-700 p-4 font-mono text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 backdrop-blur-sm"
            />
            
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => { setInput(""); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
              <button
                onClick={pasteFromClipboard}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-medium text-sm shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Paste
              </button>
              <button
                onClick={handleClean}
                disabled={!input.trim() || !user || !canClean(input.length)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 disabled:hover:scale-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Clean Now
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 transition-all duration-200 font-medium text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Clean
              </button>
            </div>
          </div>

          {/* What was removed section - between input and output */}
          <Stats input={input} output={cleaned} opts={opts} />

          {/* Output Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Cleaned Output</h3>
            </div>
            <textarea
              value={cleaned}
              readOnly
              className="w-full h-32 rounded-xl bg-slate-900/50 border border-slate-700 p-4 font-mono text-sm text-white placeholder-slate-400 backdrop-blur-sm"
              placeholder="Your cleaned text will appear here..."
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-slate-700/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              © 2025 Ace Paste Cleaner. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => setShowPrivacy(true)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowSecurity(true)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Security Policy
              </button>
              <a
                href="https://github.com/sugarcypher/Ace-Paste-Cleaner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={(tierId) => {
          // Redirect to Gumroad sales page for the selected tier
          const gumroadUrls = {
            'monthly': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=monthly&wanted=true',
            'quarterly': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=quarterly&wanted=true', 
            'six_months': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=six-months&wanted=true',
            'yearly': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=yearly&wanted=true',
            'two_years': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=two-years&wanted=true'
          };
          
          const gumroadUrl = gumroadUrls[tierId as keyof typeof gumroadUrls];
          if (gumroadUrl) {
            window.open(gumroadUrl, '_blank');
          } else {
            console.error('No Gumroad URL found for tier:', tierId);
          }
          setShowPaywall(false);
        }}
        onAddUpsell={(upsellId) => {
          // Redirect to Gumroad sales page for upsell features
          const upsellUrls = {
            'team_license': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=team-license&wanted=true',
            'pro_preset_pack': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=pro-preset-pack&wanted=true',
            'writers_toolkit': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=writers-toolkit&wanted=true',
            'dev_mode': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=dev-mode&wanted=true'
          };
          
          const upsellUrl = upsellUrls[upsellId as keyof typeof upsellUrls];
          if (upsellUrl) {
            window.open(upsellUrl, '_blank');
          } else {
            console.error('No Gumroad URL found for upsell:', upsellId);
          }
        }}
        currentTier={user?.tier || 'free'}
        reason={paywallReason}
        currentTextLength={input.length}
      />

      <PrivacyPolicy
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      <SecurityPolicy
        isOpen={showSecurity}
        onClose={() => setShowSecurity(false)}
      />

      <PrivacyAgreement
        isOpen={showPrivacyAgreement}
        onClose={() => setShowPrivacyAgreement(false)}
      />
    </div>
  );
}



interface OptionGroupProps {
  title: string;
  options: Array<{ key: keyof CleanOptions; label: string }>;
  opts: CleanOptions;
  toggle: (key: keyof CleanOptions) => void;
}

function OptionGroup({ title, options, opts, toggle }: OptionGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const enabledCount = options.filter(opt => opts[opt.key]).length;

  return (
    <div className="relative animate-slide-in">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all duration-300 shadow-lg hover:shadow-xl group"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">{title}</span>
          {enabledCount > 0 && (
            <span className="px-2 py-1 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full animate-pulse-soft shadow-lg">
              {enabledCount}
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 p-3 glass-dark rounded-2xl shadow-2xl z-20 max-h-72 overflow-y-auto animate-slide-in border border-slate-600/30">
          <div className="space-y-2">
            {options.map((option) => {
              const value = opts[option.key];
              const isBoolean = typeof value === 'boolean';
              
              return (
                <label key={option.key} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer select-none transition-all duration-200 group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-2 border-slate-500 bg-transparent checked:bg-gradient-to-r checked:from-emerald-500 checked:to-teal-500 checked:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all duration-200" 
                      checked={isBoolean ? value : false}
                      onChange={() => isBoolean ? toggle(option.key) : undefined}
                      disabled={!isBoolean}
                    />
                    {isBoolean && value && (
                      <svg className="absolute inset-0 w-5 h-5 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-slate-200 group-hover:text-white transition-colors">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stats({ input, output, opts }: StatsProps) {
  const invCounts = useMemo(() => countInvisibles(input), [input]);
  const removedChars = Math.max(0, input.length - output.length);
  
  
  // Calculate what was actually removed based on options
  const removedItems = useMemo(() => {
    const items = [];
    
    if (opts.removeInvisible) {
      const totalInvisible = invCounts.zwsp + invCounts.wj + invCounts.zwnj + invCounts.zwj + invCounts.shy + invCounts.ltrRtl + invCounts.bom;
      if (totalInvisible > 0) {
        const details = [];
        if (invCounts.zwsp > 0) details.push(`${invCounts.zwsp} Zero Width Spaces`);
        if (invCounts.wj > 0) details.push(`${invCounts.wj} Word Joiners`);
        if (invCounts.zwnj > 0) details.push(`${invCounts.zwnj} Zero Width Non-Joiners`);
        if (invCounts.zwj > 0) details.push(`${invCounts.zwj} Zero Width Joiners`);
        if (invCounts.shy > 0) details.push(`${invCounts.shy} Soft Hyphens`);
        if (invCounts.ltrRtl > 0) details.push(`${invCounts.ltrRtl} Direction Marks`);
        if (invCounts.bom > 0) details.push(`${invCounts.bom} Byte Order Marks`);
        items.push({ type: 'invisible', count: totalInvisible, label: 'Invisible Characters', details });
      }
    }
    
    if (opts.stripMarkdownHeaders) {
      const headerMatches = input.match(/^\s{0,3}(#{1,6})\s+/gmu) || [];
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
    
    if (opts.stripBackticks) {
      const inlineMatches = input.match(/`[^`]+`/gmu) || [];
      const fencedMatches = input.match(/^```[\s\S]*?```/gmu) || [];
      const totalCode = inlineMatches.length + fencedMatches.length;
      
      if (totalCode > 0) {
        const details = [];
        if (inlineMatches.length > 0) details.push(`${inlineMatches.length} Inline code blocks`);
        if (fencedMatches.length > 0) details.push(`${fencedMatches.length} Fenced code blocks`);
        items.push({ type: 'code', count: totalCode, label: 'Code Blocks', details });
      }
    }
    
    if (opts.removeUrls) {
      const urlMatches = input.match(/https?:\/\/[^\s]+|www\.[^\s]+/g) || [];
      if (urlMatches.length > 0) {
        const details = urlMatches.slice(0, 5); // Show first 5 URLs
        if (urlMatches.length > 5) details.push(`... and ${urlMatches.length - 5} more`);
        items.push({ type: 'urls', count: urlMatches.length, label: 'URLs', details });
      }
    }
    
    if (opts.removeEmailAddresses) {
      const emailMatches = input.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
      if (emailMatches.length > 0) {
        const details = emailMatches.slice(0, 3); // Show first 3 emails
        if (emailMatches.length > 3) details.push(`... and ${emailMatches.length - 3} more`);
        items.push({ type: 'emails', count: emailMatches.length, label: 'Email Addresses', details });
      }
    }
    
    if (opts.removePhoneNumbers) {
      const phoneMatches = input.match(/\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g) || [];
      if (phoneMatches.length > 0) {
        const details = phoneMatches.slice(0, 3); // Show first 3 phones
        if (phoneMatches.length > 3) details.push(`... and ${phoneMatches.length - 3} more`);
        items.push({ type: 'phones', count: phoneMatches.length, label: 'Phone Numbers', details });
      }
    }
    
    if (opts.removeTimestamps) {
      const timeMatches = input.match(/\b\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?\b/g) || [];
      const dateMatches = input.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g) || [];
      const totalTimestamps = timeMatches.length + dateMatches.length;
      
      if (totalTimestamps > 0) {
        const details = [];
        if (timeMatches.length > 0) details.push(`${timeMatches.length} Time formats`);
        if (dateMatches.length > 0) details.push(`${dateMatches.length} Date formats`);
        items.push({ type: 'timestamps', count: totalTimestamps, label: 'Timestamps', details });
      }
    }
    
    if (opts.removeSpecialCharacters) {
      const specialMatches = input.match(/[!@#$%^&*_+=\[\]{}|\\:"'<>~`]/g) || [];
      if (specialMatches.length > 0) {
        const details = [...new Set(specialMatches)].slice(0, 10); // Show unique characters
        if (specialMatches.length > 10) details.push(`... and ${specialMatches.length - 10} more`);
        items.push({ type: 'special', count: specialMatches.length, label: 'Special Characters', details });
      }
    }
    
    if (opts.removeRepeatedWords) {
      const repeatedMatches = input.match(/\b(\w+)\s+\1\b/g) || [];
      if (repeatedMatches.length > 0) {
        const details = repeatedMatches.slice(0, 5); // Show first 5 repeated words
        if (repeatedMatches.length > 5) details.push(`... and ${repeatedMatches.length - 5} more`);
        items.push({ type: 'repeated', count: repeatedMatches.length, label: 'Repeated Words', details });
      }
    }
    
    return items;
  }, [input, opts, invCounts]);

  // Check if boxes should be active (have meaningful values)
  const lengthActive = input.length > 0;
  const removedActive = removedChars > 0;
  const typesActive = removedItems.length > 0;

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Processing Results</h3>
        <p className="text-slate-300 text-sm">See what was cleaned from your text</p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Metric 
          k="Length (in → out)" 
          v={`${input.length} → ${output.length}`} 
          isActive={lengthActive}
        />
        <Metric 
          k="Removed (chars)" 
          v={`${removedChars}`} 
          isActive={removedActive}
        />
        <Metric 
          k="Removed Types" 
          v={`${removedItems.length}`} 
          isActive={typesActive}
        />
      </div>
      
      {/* Detailed Removal Breakdown */}
      {removedItems.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-300 mb-3">What was removed:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {removedItems.map((item, index) => (
              <RemovedItem key={index} item={item} />
            ))}
          </div>
        </div>
      )}
      
      {/* Invisible Character Details */}
      {opts.removeInvisible && (invCounts.zwsp > 0 || invCounts.wj > 0 || invCounts.zwnj > 0 || invCounts.zwj > 0 || invCounts.shy > 0 || invCounts.ltrRtl > 0 || invCounts.bom > 0) && (
        <div className="space-y-3 mt-6">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Invisible characters:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {invCounts.zwsp > 0 && <Metric k="ZWSP" v={`${invCounts.zwsp}`} />}
            {invCounts.wj > 0 && <Metric k="WJ" v={`${invCounts.wj}`} />}
            {invCounts.zwnj > 0 && <Metric k="ZWNJ" v={`${invCounts.zwnj}`} />}
            {invCounts.zwj > 0 && <Metric k="ZWJ" v={`${invCounts.zwj}`} />}
            {invCounts.shy > 0 && <Metric k="SHY" v={`${invCounts.shy}`} />}
            {invCounts.vs16 > 0 && <Metric k="VS16" v={`${invCounts.vs16}`} />}
            {invCounts.ltrRtl > 0 && <Metric k="LRM/RLM/ALM" v={`${invCounts.ltrRtl}`} />}
            {invCounts.bom > 0 && <Metric k="BOM/FEFF" v={`${invCounts.bom}`} />}
          </div>
        </div>
      )}
      
      {/* No changes message */}
      {removedItems.length === 0 && removedChars === 0 && input.length > 0 && (
        <div className="text-center py-8 text-slate-400">
          <div className="text-4xl mb-3">✨</div>
          <div className="text-lg font-medium">No changes needed</div>
          <div className="text-sm">Your text is already clean!</div>
        </div>
      )}
    </div>
  );
}

function Metric({ k, v, isActive = false }: MetricProps) {
  const getActiveClasses = () => {
    if (!isActive) return 'bg-slate-800/50 border-slate-700/50 text-slate-400';
    
    // Determine color based on metric type
    if (k.includes('Length')) {
      return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
    } else if (k.includes('Removed (chars)')) {
      return 'bg-red-500/20 border-red-500/30 text-red-300';
    } else if (k.includes('Removed Types')) {
      return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300';
    }
    return 'bg-slate-800/50 border-slate-700/50 text-slate-400';
  };

  return (
    <div className={`rounded-xl border p-4 transition-all duration-300 backdrop-blur-sm ${getActiveClasses()}`}>
      <div className={`text-xs uppercase tracking-wider font-medium ${isActive ? 'text-current/80' : 'text-slate-400'}`}>{k}</div>
      <div className={`text-lg font-bold mt-1 ${isActive ? 'text-current' : 'text-slate-300'}`}>{v}</div>
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
      case 'code':
        return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
      case 'urls':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'emails':
        return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300';
      case 'phones':
        return 'bg-pink-500/20 border-pink-500/30 text-pink-300';
      case 'timestamps':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'special':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'repeated':
        return 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300';
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
      case 'code':
        return '💻';
      case 'urls':
        return '🔗';
      case 'emails':
        return '📧';
      case 'phones':
        return '📞';
      case 'timestamps':
        return '⏰';
      case 'special':
        return '⚠️';
      case 'repeated':
        return '🔄';
      default:
        return '🗑️';
    }
  };

  return (
    <div className={`rounded-2xl border p-4 ${getColorClasses(item.type)} cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm`}
         onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center">
            <span className="text-xl">{getIcon(item.type)}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">{item.label}</div>
          <div className="text-xs opacity-75">
            {item.count} {item.count === 1 ? 'item' : 'items'} removed
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-xl font-bold">{item.count}</div>
          <svg 
            className={`w-5 h-5 transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && item.details && item.details.length > 0 && (
        <div className="mt-4 pt-4 border-t border-current/20 animate-slide-in">
          <div className="text-xs font-semibold mb-3 opacity-90 uppercase tracking-wider">Details:</div>
          <div className="space-y-2">
            {item.details.map((detail, index) => (
              <div key={index} className="text-xs opacity-80 bg-black/20 rounded-lg px-3 py-2 font-mono border border-current/10">
                {detail}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Cleaning Logic ---
function cleanText(text: string, opts: CleanOptions): string {
  let t = text;

  // Protect ZWJ inside emoji sequences, so we can strip stray ZWJ elsewhere without breaking emoji
  const SENTINEL_ZWJ = ""; // private-use marker
  if (opts.preserveEmoji) {
    try {
      const EP = "\\p{Extended_Pictographic}";
      const reZWJ = new RegExp(`(${EP})\u200D(${EP})`, "gu");
      t = t.replace(reZWJ, `$1${SENTINEL_ZWJ}$2`);
    } catch {
      // Fallback: only match actual emoji sequences with ZWJ
      t = t.replace(/([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])\u200D([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/gu, `$1${SENTINEL_ZWJ}$2`);
    }
  }

  if (opts.removeInvisible) {
    // Remove Unicode Format characters (Cf): ZWSP/ZWJ/ZWNJ/WJ/bidi/etc.
    try {
      t = t.replace(/\p{Cf}/gu, "");
    } catch {
      // Fallback explicit ranges if \p{Cf} unsupported
      t = t.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF\uFFF9-\uFFFB]/gu, "");
    }
    // Remove CGJ explicitly (Mn)
    t = t.replace(/\u034F/gu, "");

    // Variation selectors
    if (!opts.keepVS16Emoji) {
      t = t.replace(/[\uFE00-\uFE0F]/gu, "");
    } else {
      t = t.replace(/[\uFE00-\uFE0E]/gu, "");
    }
    t = t.replace(/[\u{E0100}-\u{E01EF}]/gu, "");
    
    // After the supplementary variation selectors removal:
    t = t.replace(/[\u{E0000}-\u{E007F}]/gu, ""); // Plane-14 TAG characters
  }

  if (opts.stripMarkdownHeaders && !opts.markdownSafeMode) {
    t = t.replace(/^\s{0,3}(#{1,6})\s+/gmu, "");
  }

  if (opts.stripBoldItalic && !opts.markdownSafeMode) {
    // Bold/italic markers; keep inner text
    t = t.replace(/\*\*(.*?)\*\*/gmsu, "$1");
    t = t.replace(/__(.*?)__/gmsu, "$1");
    t = t.replace(/(?<!\*)\*(?!\*)(.*?)\*(?<!\*)/gmsu, "$1");
    t = t.replace(/(?<!_)_(?!_)(.*?)_(?<!_)/gmsu, "$1");
    t = t.replace(/~~(.*?)~~/gmsu, "$1");
  }

  if (opts.stripBackticks && !opts.markdownSafeMode && !opts.preserveCodeFences) {
    // Fenced blocks: remove the backticks but keep content
    t = t.replace(/^```[^\n]*\n([\s\S]*?)\n```\s*$/gmu, "$1\n");
    // Inline backticks
    t = t.replace(/`([^`]+)`/gmu, "$1");
  }

  if (opts.stripEmDashSeparators) {
    // Remove lines that are just separators of dashes/em-dashes
    t = t.replace(/^\s*[—–-]{2,}\s*$/gmu, "");
    // Remove standalone em-dash separator lines between paragraphs
    t = t.replace(/\n\s*[—–]\s*\n/gmu, "\n\n");
  }

  if (opts.stripListMarkers) {
    t = t.replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/gmu, "");
  }

  if (opts.stripBlockquotes) {
    t = t.replace(/^\s{0,3}>\s?/gmu, "");
  }

  if (opts.normalizeWhitespace && !opts.preserveTabsSpaces) {
    // Inside normalizeWhitespace:
    t = t.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " "); // all Zs spaces → ASCII space
    // Collapse 2+ spaces to 1 (but not across newlines)
    t = t.replace(/(\S) {2,}(?=\S)/g, "$1 ");
    // Trim trailing spaces
    t = t.replace(/[ \t]+$/gmu, "");
  }

  if (opts.collapseBlankLines) {
    t = t.replace(/\n{3,}/g, "\n\n");
  }

  // Additional cleaning options
  if (opts.removeUrls) {
    t = t.replace(/https?:\/\/[^\s]+/g, "");
    t = t.replace(/www\.[^\s]+/g, "");
  }

  if (opts.removeEmailAddresses) {
    t = t.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "");
  }

  if (opts.removePhoneNumbers) {
    t = t.replace(/\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, "");
  }

  if (opts.removeTimestamps) {
    t = t.replace(/\b\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?\b/g, "");
    t = t.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, "");
    t = t.replace(/\b\d{4}-\d{2}-\d{2}\b/g, "");
  }

  if (opts.removeSpecialCharacters && !opts.preserveEscapeSequences) {
    // Only remove truly special characters, preserve basic punctuation
    t = t.replace(/[!@#$%^&*_+=\[\]{}|\\:"'<>~`]/g, "");
  }

  if (opts.removeExtraPunctuation) {
    t = t.replace(/\.{2,}/g, ".");
    t = t.replace(/,{2,}/g, ",");
    t = t.replace(/!{2,}/g, "!");
    t = t.replace(/\?{2,}/g, "?");
  }

  if (opts.removeRepeatedWords) {
    t = t.replace(/\b(\w+)\s+\1\b/g, "$1");
  }

  if (opts.removeEmptyLines) {
    t = t.replace(/^\s*$/gm, "");
  }

  if (opts.removeTrailingSpaces) {
    t = t.replace(/[ \t]+$/gm, "");
  }

  if (opts.removeLeadingSpaces) {
    t = t.replace(/^[ \t]+/gm, "");
  }

  // New features implementation
  if (opts.removeUTMParameters) {
    // Remove UTM parameters from URLs
    t = t.replace(/([?&])(utm_[^&\s]*)/g, '$1');
    t = t.replace(/([?&])(fbclid|gclid|msclkid)[^&\s]*/g, '$1');
    t = t.replace(/[?&]$/, ''); // Remove trailing ? or &
  }


  // Case conversion
  if (opts.caseConversion !== 'none') {
    switch (opts.caseConversion) {
      case 'lowercase':
        t = t.toLowerCase();
        break;
      case 'uppercase':
        t = t.toUpperCase();
        break;
      case 'titlecase':
        t = t.replace(/\b\w/g, (char) => char.toUpperCase());
        break;
      case 'sentencecase':
        t = t.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase());
        break;
    }
  }

  // Restore protected emoji joiners
  if (opts.preserveEmoji) {
    t = t.replace(//gu, "‍");
  }

  return t;
}

function countInvisibles(text: string) {
  const c = {
    zwsp: 0,
    wj: 0,
    zwnj: 0,
    zwj: 0,
    shy: 0,
    vs16: 0,
    ltrRtl: 0,
    bom: 0,
  };
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    
    if (cp === 0x200B) c.zwsp++;
    else if (cp === 0x2060) c.wj++;
    else if (cp === 0x200C) c.zwnj++;
    else if (cp === 0x200D) c.zwj++;
    else if (cp === 0x00AD) c.shy++;
    else if (cp === 0xFE0F) c.vs16++;
    else if (cp === 0x200E || cp === 0x200F || cp === 0x061C) c.ltrRtl++;
    else if (cp === 0xFEFF) c.bom++;
  }
  return c;
}

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { signIn, signUp } = useSimpleAuth();

  return (
    <ErrorBoundary>
      <SecurityProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
          <GumroadWebhookHandler />
          <Header onShowAuthModal={() => setShowAuthModal(true)} />
          <AppContent />
        </div>
        
        {/* Authentication Modal */}
        <SimpleAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      </SecurityProvider>
    </ErrorBoundary>
  );
}

export default App;
