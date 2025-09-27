import { useState } from "react";
import { useSimpleAuth } from "./hooks/useSimpleAuth";
import { PaywallModal } from "./components/PaywallModal";
import { PrivacyAgreement } from "./components/PrivacyAgreement";
import { SimpleAuthModal } from "./components/SimpleAuthModal";
import { cleanText } from "./utils/textCleaner";
import { sanitizeTextAdvanced, DEFAULT_ADVANCED_PROFILE, PRESET_PROFILES } from "./utils/advancedTextCleaner";

// Basic clean options for simplified interface
interface CleanOptions {
  removeInvisible: boolean;
  stripMarkdownHeaders: boolean;
  stripBoldItalic: boolean;
  stripBackticks: boolean;
  normalizeWhitespace: boolean;
  collapseBlankLines: boolean;
  removeUrls: boolean;
  removeEmailAddresses: boolean;
  removePhoneNumbers: boolean;
}

function App() {
  const { user, signOut, usage, recordCleaning } = useSimpleAuth();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallReason, setPaywallReason] = useState('daily_limit');
  const [showPrivacyAgreement, setShowPrivacyAgreement] = useState(false);
  const hasAcceptedTerms = true; // Simplified for clean interface

  // Default clean options
  const opts: CleanOptions = {
    removeInvisible: true,
    stripMarkdownHeaders: true,
    stripBoldItalic: true,
    stripBackticks: true,
    normalizeWhitespace: true,
    collapseBlankLines: true,
    removeUrls: false,
    removeEmailAddresses: false,
    removePhoneNumbers: false,
  };

  const handleClean = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    // Check limits for demo users
    if (!user && input.length > 500) {
      setPaywallReason('daily_limit');
      setShowPaywall(true);
      setIsProcessing(false);
      return;
    }

    // Check limits for authenticated users
    if (user && user.tier === 'free' && input.length > 2000) {
      setPaywallReason('text_length');
      setShowPaywall(true);
      setIsProcessing(false);
      return;
    }

    try {
      let cleaned: string;
      
      if (!user) {
        // Demo users get simple cleaning
        cleaned = cleanText(input, opts);
      } else {
        // Authenticated users get advanced Unicode cleaning
        // Select profile based on user tier
        const profile = user.tier === 'free' 
          ? PRESET_PROFILES.EMOJI_SAFE 
          : user.tier === 'monthly'
          ? DEFAULT_ADVANCED_PROFILE
          : PRESET_PROFILES.MAX_STERILE; // Premium users get max cleaning power
        
        // Detect language for culturally-aware cleaning (simplified detection)
        const detectedLang = detectLanguage(input);
        cleaned = sanitizeTextAdvanced(input, profile, detectedLang);
      }
      
      setOutput(cleaned);
      
      // Record usage if user is logged in
      if (user) {
        await recordCleaning();
      }
    } catch (error) {
      console.error('Failed to clean text:', error);
      alert('Failed to clean text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Simple language detection based on common characters
  const detectLanguage = (text: string): string | undefined => {
    const sample = text.slice(0, 200); // Check first 200 chars
    
    // Arabic/Persian/Urdu
    if (/[\u0600-\u06FF]/u.test(sample)) {
      if (/[\u06A9\u06AF\u06CC]/u.test(sample)) return 'fa'; // Persian indicators
      return 'ar';
    }
    
    // Hindi/Bengali/Tamil/Telugu
    if (/[\u0900-\u097F]/u.test(sample)) return 'hi'; // Devanagari (Hindi)
    if (/[\u0980-\u09FF]/u.test(sample)) return 'bn'; // Bengali
    if (/[\u0B80-\u0BFF]/u.test(sample)) return 'ta'; // Tamil
    if (/[\u0C00-\u0C7F]/u.test(sample)) return 'te'; // Telugu
    
    // Thai/Khmer
    if (/[\u0E00-\u0E7F]/u.test(sample)) return 'th'; // Thai
    if (/[\u1780-\u17FF]/u.test(sample)) return 'km'; // Khmer
    
    return undefined; // Default to no language override
  };

  const copyToClipboard = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      alert('Cleaned text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (typeof text !== 'string') {
        console.error('Invalid clipboard content type');
        return;
      }
      if (text.length > 10000000) { // 10MB character limit
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Text Cleaner</h2>
              <div className="flex items-center gap-2">
                {!user ? (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Demo Mode</span>
                ) : (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.tier === 'free' 
                      ? 'bg-green-100 text-green-800'
                      : user.tier === 'monthly'
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gold-100 text-gold-800'
                  }`}>
                    {user.tier === 'free' ? 'Emoji-Safe Cleaning' 
                     : user.tier === 'monthly' ? 'Advanced Unicode Cleaning'
                     : 'Maximum Sterile Cleaning'}
                  </span>
                )}
              </div>
            </div>
            
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
                  onClick={() => setInput('This\u200B\u200Ctext\u200D\uFEFFhas\u00ADinvisible\u202Ccharacters\u2060everywhere\u180E!')}
                  className="p-3 text-left border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                >
                  <div className="font-medium text-gray-800 mb-1">
                    👻 Invisible Characters
                    {user && <span className="ml-1 text-xs text-green-600">(Advanced)</span>}
                  </div>
                  <div className="text-xs text-gray-600">Remove zero-width spaces, BOMs, control chars</div>
                </button>
                
                <button
                  onClick={() => setInput('Contact: support@example.com or call (555) 123-4567\nFollow: https://twitter.com/example?utm_source=email&utm_medium=newsletter')}
                  className="p-3 text-left border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                >
                  <div className="font-medium text-gray-800 mb-1">🔒 Privacy Scrub</div>
                  <div className="text-xs text-gray-600">Remove emails, phones, tracking URLs</div>
                </button>
                
                <button
                  onClick={() => setInput('مرحبا\u200Dبالعالم\u200C Thai: สวัสดี\u200Bโลก Emoji: 👨\u200D💻🔥\uFE0F')}
                  className="p-3 text-left border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
                >
                  <div className="font-medium text-gray-800 mb-1">
                    🌍 Multilingual Text
                    {user && <span className="ml-1 text-xs text-purple-600">(Cultural-Aware)</span>}
                  </div>
                  <div className="text-xs text-gray-600">Preserve Arabic shaping, Thai breaks, emoji</div>
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
          
          // SECURITY FIX: CWE-570/571 - Validate tier ID exists and URL is valid
          if (tierId in gumroadUrls) {
            const gumroadUrl = gumroadUrls[tierId];
            if (gumroadUrl?.startsWith('https://')) {
              window.open(gumroadUrl, '_blank');
            } else {
              console.error('Invalid Gumroad URL format for tier:', tierId);
            }
          } else {
            console.error('Unknown Gumroad tier ID:', tierId);
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
          
          // SECURITY FIX: CWE-570/571 - Validate upsell ID exists and URL is valid
          if (upsellId in upsellUrls) {
            const upsellUrl = upsellUrls[upsellId];
            if (upsellUrl?.startsWith('https://')) {
              window.open(upsellUrl, '_blank');
            } else {
              console.error('Invalid upsell URL format for ID:', upsellId);
            }
          } else {
            console.error('Unknown upsell ID:', upsellId);
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