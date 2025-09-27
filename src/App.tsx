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
    // Allow basic cleaning without authentication for demo purposes
    // Limit demo to 500 characters
    if (!user && input.length > 500) {
      return input; // Return input as-is if over demo limit
    }
    
    // Use advanced invisible character detection if enabled and user is authenticated
    if (user && opts.removeInvisible && securitySettings.encryptionLevel === 'enhanced') {
      return stripInvisibleCharacters(cleanText(input, opts));
    }
    
    return cleanText(input, opts);
  }, [input, opts, securitySettings, user]);

  const handleClean = async () => {
    // SECURITY: Type validation to prevent type confusion attacks
    // Validate input is a string to ensure safe text processing
    if (typeof input !== 'string') {
      console.error('Invalid input type for text cleaning');
      return;
    }
    
    // Allow demo usage without authentication for text under 500 characters
    if (!user) {
      if (input.length > 500) {
        setPaywallReason('daily_limit');
        setShowPaywall(true);
        return;
      }
      // Demo usage is allowed, cleaning happens automatically via useMemo
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
      // SECURITY: Output validation to prevent clipboard injection attacks
      // Validate cleaned text before copying to ensure data integrity
      if (typeof cleaned !== 'string') {
        console.error('Invalid cleaned text type');
        return;
      }
      await navigator.clipboard.writeText(cleaned);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      // SECURITY: Input validation to prevent clipboard-based attacks
      // Validate clipboard content type to prevent type confusion
      if (typeof text !== 'string') {
        console.error('Invalid clipboard content type');
        return;
      }
      // SECURITY: Resource protection - limit clipboard size to prevent memory exhaustion
      if (text.length > 10000000) { // 10MB character limit for security
        console.error('Clipboard content too large');
        alert('The clipboard content is too large. Please paste smaller text.');
        return;
      }
      setInput(text);
    } catch (err) {
      console.error('Failed to paste text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">ACE PASTE CLEANER</h1>
              <p className="text-sm text-gray-600">Clean text instantly</p>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full capitalize">{user.tier}</span>
                  <button onClick={signOut} className="text-sm text-gray-500 hover:text-gray-700">Sign Out</button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* MAIN TOOL - Priority #1 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* User Status */}
        {!user ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 font-medium">Demo Mode</p>
                <p className="text-blue-700 text-sm">Clean up to 500 characters without signing up</p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Get Unlimited
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-900 font-medium capitalize">{user.tier} Plan</p>
                {usage && (
                  <p className="text-green-700 text-sm">
                    {user.tier === 'free' ? (
                      `${Math.max(0, 3 - usage.dailyCleanings)} cleanings remaining today`
                    ) : (
                      `${usage.totalCleanings} total cleanings`
                    )}
                  </p>
                )}
              </div>
              {user.tier === 'free' && (
                <button
                  onClick={() => setShowPaywall(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Text Cleaning Tool */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Text Cleaner</h2>
            
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste or type your text here
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Paste your messy text here and click Clean to remove formatting and invisible characters..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {input.length} characters {!user && input.length > 500 && '(Demo limit: 500 characters)'}
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={pasteFromClipboard}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Paste
                </button>
                <button
                  onClick={() => setInput('')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
                <button
                  onClick={handleClean}
                  disabled={!input || isProcessing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                  Clean Text
                </button>
              </div>
              
              {/* Output Section */}
              {output && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cleaned text
                  </label>
                  <textarea
                    value={output}
                    readOnly
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {output.length} characters • {input.length - output.length} characters removed
                    </p>
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Clean Text
                    </button>
                  </div>
                </div>
              )}
              
              {!hasAcceptedTerms && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 mb-2">To use this tool, please accept our privacy terms.</p>
                  <button
                    onClick={() => setShowPrivacyAgreement(true)}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Accept Privacy Terms
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Example Tasks */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Try Example Tasks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setInput('# Hello World\n\n**This** is _formatted_ text with `code` blocks and extra   spaces.\n\n• List item 1\n• List item 2\n\nVisit https://example.com for more info!')}
                  className="p-3 text-left border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                >
                  <div className="font-medium text-gray-800 mb-1">📝 Markdown Cleanup</div>
                  <div className="text-xs text-gray-600">Remove headers, bold/italic, code blocks</div>
                </button>
                
                <button
                  onClick={() => setInput('This    text     has\n\n\n\nmultiple blank lines\n\n\nand     extra     spaces     everywhere\t\t\nMixed\twhitespace\tcharacters   too!')}
                  className="p-3 text-left border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                >
                  <div className="font-medium text-gray-800 mb-1">🧹 Whitespace Cleanup</div>
                  <div className="text-xs text-gray-600">Fix spacing and normalize whitespace</div>
                </button>
                
                <button
                  onClick={() => setInput('Contact: support@example.com or call (555) 123-4567\nFollow: https://twitter.com/example?utm_source=email&utm_medium=newsletter')}
                  className="p-3 text-left border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                >
                  <div className="font-medium text-gray-800 mb-1">🔒 Privacy Scrub</div>
                  <div className="text-xs text-gray-600">Remove emails, phones, tracking URLs</div>
                </button>
                
                <button
                  onClick={() => setInput('Convert THIS mixed CaSe TeXt into the format you want. some words are ALL CAPS while others are lowercase.')}
                  className="p-3 text-left border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                >
                  <div className="font-medium text-gray-800 mb-1">🔤 Case Conversion</div>
                  <div className="text-xs text-gray-600">Transform text case format</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple Footer */}
      <div className="mt-16 border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            Your text never leaves your browser. Processing is 100% client-side.
          </p>
        </div>
      </div>
      
      {/* Modals */}
      <SimpleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
      
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onUpgrade={(tierId) => {
          const gumroadUrls: Record<string, string> = {
            'monthly': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=monthly&wanted=true',
            'quarterly': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=quarterly&wanted=true', 
            'six_months': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=six-months&wanted=true',
            'yearly': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=yearly&wanted=true',
            'two_years': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=two-years&wanted=true'
          };
          
          const gumroadUrl = gumroadUrls[tierId];
          if (gumroadUrl && typeof gumroadUrl === 'string') {
            window.open(gumroadUrl, '_blank');
          } else {
            console.error('No Gumroad URL found for tier:', tierId);
          }
          setShowPaywall(false);
        }}
        onAddUpsell={(upsellId) => {
          const upsellUrls: Record<string, string> = {
            'team_license': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=team-license&wanted=true',
            'pro_preset_pack': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=pro-preset-pack&wanted=true',
            'writers_toolkit': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=writers-toolkit&wanted=true',
            'dev_mode': 'https://thinkwelllabs.gumroad.com/l/kcrps?option=dev-mode&wanted=true'
          };
          
          const upsellUrl = upsellUrls[upsellId];
          if (upsellUrl && typeof upsellUrl === 'string') {
            window.open(upsellUrl, '_blank');
          } else {
            console.error('No Gumroad URL found for upsell:', upsellId);
          }
        }}
        currentTier={user?.tier || 'free'}
        reason={paywallReason}
        currentTextLength={input.length}
      />

      <PrivacyAgreement
        isOpen={showPrivacyAgreement}
        onClose={() => setShowPrivacyAgreement(false)}
      />
    </div>
  );
}

export default App;
