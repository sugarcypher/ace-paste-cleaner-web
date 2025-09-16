import React, { useState, useCallback } from 'react';
import { X, Lock, Eye, Database, Wifi, Fingerprint, Clock, AlertTriangle, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { useSecurity, SecuritySettings } from '../contexts/SecurityContext';

interface PrivacyAgreementProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SecurityOption {
  key: keyof SecuritySettings;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'boolean' | 'select';
  options?: { value: any; label: string; description: string }[];
  recommended?: any;
  enterprise?: boolean;
}

const SECURITY_OPTIONS: SecurityOption[] = [
  {
    key: 'dataRetention',
    title: 'Data Retention Policy',
    description: 'How long should processed text be stored',
    icon: Database,
    type: 'select',
    options: [
      { value: 'none', label: 'No Storage', description: 'Text is never stored (most secure)' },
      { value: 'session', label: 'Session Only', description: 'Cleared when browser closes' },
      { value: 'persistent', label: 'Persistent', description: 'Stored until manually cleared' },
    ],
    recommended: 'none',
    enterprise: true,
  },
  {
    key: 'encryptionLevel',
    title: 'Encryption Level',
    description: 'Security level for data protection',
    icon: Lock,
    type: 'select',
    options: [
      { value: 'standard', label: 'Standard', description: 'AES-128 encryption' },
      { value: 'enhanced', label: 'Enhanced', description: 'AES-256 with key derivation' },
    ],
    recommended: 'enhanced',
    enterprise: true,
  },
  {
    key: 'analyticsEnabled',
    title: 'Usage Analytics',
    description: 'Anonymous usage statistics for app improvement',
    icon: Eye,
    type: 'boolean',
    recommended: false,
  },
  {
    key: 'crashReportingEnabled',
    title: 'Crash Reporting',
    description: 'Automatic crash reports to improve stability',
    icon: AlertTriangle,
    type: 'boolean',
    recommended: false,
  },
  {
    key: 'networkLogging',
    title: 'Network Activity Logging',
    description: 'Log network requests for debugging',
    icon: Wifi,
    type: 'boolean',
    recommended: false,
    enterprise: true,
  },
  {
    key: 'biometricProtection',
    title: 'Biometric Protection',
    description: 'Require fingerprint/face ID to access app',
    icon: Fingerprint,
    type: 'boolean',
    recommended: false,
    enterprise: true,
  },
  {
    key: 'autoLockEnabled',
    title: 'Auto-Lock',
    description: 'Automatically lock app after inactivity',
    icon: Clock,
    type: 'boolean',
    recommended: false,
    enterprise: true,
  },
];

export function PrivacyAgreement({ isOpen, onClose }: PrivacyAgreementProps) {
  const { securitySettings, acceptTerms, updateSecuritySettings } = useSecurity();
  const [localSettings, setLocalSettings] = useState<SecuritySettings>(securitySettings);
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const handleSettingChange = useCallback((key: keyof SecuritySettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleAcceptTerms = useCallback(async () => {
    if (!hasReadTerms) {
      console.warn('Terms not read - please scroll through the complete agreement');
      return;
    }

    try {
      setIsAccepting(true);
      await updateSecuritySettings(localSettings);
      await acceptTerms();
      onClose();
    } catch {
      console.error('Failed to save settings');
    } finally {
      setIsAccepting(false);
    }
  }, [hasReadTerms, localSettings, acceptTerms, updateSecuritySettings, onClose]);

  const renderSecurityOption = (option: SecurityOption) => {
    const IconComponent = option.icon;
    const currentValue = localSettings[option.key];
    const isRecommended = currentValue === option.recommended;

    return (
      <div key={option.key} className="bg-neutral-800 rounded-xl p-4 mb-3 border border-neutral-700">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <IconComponent className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">{option.title}</h3>
            {option.enterprise && (
              <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                ENT
              </span>
            )}
            {isRecommended && (
              <CheckCircle className="w-4 h-4 text-yellow-500" />
            )}
          </div>
          <p className="text-sm text-neutral-400">{option.description}</p>
        </div>

        {option.type === 'boolean' ? (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={currentValue as boolean}
              onChange={(e) => handleSettingChange(option.key, e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <span className="text-sm text-neutral-300">
              {currentValue ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        ) : (
          <div className="space-y-2">
            {option.options?.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentValue === opt.value
                    ? 'bg-blue-500/20 border border-blue-500/50'
                    : 'bg-neutral-700 hover:bg-neutral-600'
                }`}
              >
                <input
                  type="radio"
                  name={option.key}
                  value={opt.value}
                  checked={currentValue === opt.value}
                  onChange={(e) => handleSettingChange(option.key, e.target.value)}
                  className="w-4 h-4 accent-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{opt.label}</div>
                  <div className="text-xs text-neutral-400">{opt.description}</div>
                </div>
                {currentValue === opt.value && (
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Privacy & Security Agreement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Privacy Policy */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Privacy Policy</h3>
            <div className="bg-neutral-800 rounded-xl p-6 border border-blue-500/30">
              <div className="space-y-4 text-sm text-neutral-300">
                <p>
                  <span className="font-semibold text-white">Data Processing:</span> Ace Paste Cleaner processes text locally in your browser to detect and remove invisible tracking characters. No text content is transmitted to external servers unless explicitly configured.
                </p>
                
                <p>
                  <span className="font-semibold text-white">Data Collection:</span> We collect only the minimum data necessary for app functionality. This includes usage statistics (if enabled), crash reports (if enabled), and security logs (if enabled).
                </p>
                
                <p>
                  <span className="font-semibold text-white">Data Storage:</span> All processed text is handled according to your selected data retention policy. By default, no text is stored permanently.
                </p>
                
                <p>
                  <span className="font-semibold text-white">Encryption:</span> All stored data is encrypted using industry-standard AES encryption. Enhanced mode uses AES-256 with PBKDF2 key derivation.
                </p>
                
                <p>
                  <span className="font-semibold text-white">Third Parties:</span> We do not share your data with third parties except as required by law or with your explicit consent.
                </p>
              </div>
            </div>
          </div>

          {/* Security Configuration */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Security Configuration</h3>
            <p className="text-sm text-neutral-400">
              Configure security settings according to your organization's requirements
            </p>
            
            {SECURITY_OPTIONS.map(renderSecurityOption)}
          </div>

          {/* Terms of Service */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Terms of Service</h3>
            <div className="bg-neutral-800 rounded-xl p-6 border border-blue-500/30">
              <div className="space-y-4 text-sm text-neutral-300">
                <p>
                  <span className="font-semibold text-white">Acceptable Use:</span> Ace Paste Cleaner is designed for legitimate text processing needs. Users are responsible for ensuring compliance with applicable laws and regulations.
                </p>
                
                <p>
                  <span className="font-semibold text-white">Liability:</span> Ace Paste Cleaner is provided "as is" without warranties. Users assume responsibility for data backup and security practices.
                </p>
                
                <p>
                  <span className="font-semibold text-white">Updates:</span> Security updates may be applied automatically to maintain protection against emerging threats.
                </p>
                
                <p>
                  <span className="font-semibold text-white">Compliance:</span> This application is designed to meet enterprise security standards including SOC 2, ISO 27001, and GDPR requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-400 mb-4">Security Compliance</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['SOC 2', 'ISO 27001', 'GDPR', 'CCPA'].map((badge) => (
                <div key={badge} className="bg-yellow-500/20 border border-yellow-500 px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold text-yellow-400">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Accept Button */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-800/50">
          <button
            onClick={handleAcceptTerms}
            disabled={!hasReadTerms || isAccepting}
            className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-colors ${
              !hasReadTerms || isAccepting
                ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isAccepting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                Accept Terms & Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          {!hasReadTerms && (
            <p className="text-xs text-neutral-400 text-center mt-2">
              Please scroll to read the complete agreement
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
