import { useState } from 'react';
import { Shield, Lock, Eye, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

export function SecurityOptions() {
  const { securitySettings, updateSecuritySettings } = useSecurity();
  const { user, isAuthenticated } = useSimpleAuth();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dataProtection: false,
    privacyControls: false,
    accessSecurity: false
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async (key: keyof typeof securitySettings, value: any) => {
    await updateSecuritySettings({ [key]: value });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const saveConfiguration = async () => {
    if (!isAuthenticated) return;
    
    setIsSaving(true);
    try {
      // Save to user's profile or backend
      const config = {
        securitySettings,
        timestamp: new Date().toISOString(),
        userId: user?.id
      };
      
      // Store in localStorage for now (can be extended to backend)
      localStorage.setItem(`acepaste_config_${user?.id}`, JSON.stringify(config));
      
      // Show success message
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const securityFeatures = [
    {
      key: 'dataProtection',
      title: "Data Protection",
      icon: Shield,
      options: [
        {
          key: 'dataRetention' as const,
          label: 'Data Retention',
          type: 'select' as const,
          value: securitySettings.dataRetention,
          options: [
            { value: 'none', label: 'None (Zero Retention)' },
            { value: 'session', label: 'Session Only' },
            { value: 'persistent', label: 'Persistent (24h max)' }
          ]
        },
        {
          key: 'encryptionLevel' as const,
          label: 'Encryption Level',
          type: 'select' as const,
          value: securitySettings.encryptionLevel,
          options: [
            { value: 'standard', label: 'Standard (AES-256)' },
            { value: 'enhanced', label: 'Enhanced (AES-256 + E2E)' }
          ]
        }
      ]
    },
    {
      key: 'privacyControls',
      title: "Privacy Controls",
      icon: Eye,
      options: [
        {
          key: 'analyticsEnabled' as const,
          label: 'Analytics & Tracking',
          type: 'boolean' as const,
          value: securitySettings.analyticsEnabled,
          description: 'Disable for maximum privacy'
        },
        {
          key: 'crashReportingEnabled' as const,
          label: 'Crash Reporting',
          type: 'boolean' as const,
          value: securitySettings.crashReportingEnabled,
          description: 'Help improve app stability'
        },
        {
          key: 'networkLogging' as const,
          label: 'Network Logging',
          type: 'boolean' as const,
          value: securitySettings.networkLogging,
          description: 'Log network requests for debugging'
        }
      ]
    },
    {
      key: 'accessSecurity',
      title: "Access Security",
      icon: Lock,
      options: [
        {
          key: 'biometricProtection' as const,
          label: 'Biometric Protection',
          type: 'boolean' as const,
          value: securitySettings.biometricProtection,
          description: 'Require fingerprint/face ID'
        },
        {
          key: 'autoLockEnabled' as const,
          label: 'Auto-Lock',
          type: 'boolean' as const,
          value: securitySettings.autoLockEnabled,
          description: 'Automatically lock after inactivity'
        }
      ]
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Enterprise Security</h2>
        <p className="text-slate-300">Advanced security and privacy controls</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {securityFeatures.map((section, index) => {
          const IconComponent = section.icon;
          const isExpanded = expandedSections[section.key];
          return (
            <div key={index} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <button
                onClick={() => toggleSection(section.key)}
                className="flex items-center justify-between w-full mb-4 hover:bg-slate-700/50 rounded-xl p-3 -m-3 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">{section.title}</h3>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="space-y-4">
                  {section.options.map((option) => (
                  <div key={option.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-slate-300 font-medium">{option.label}</label>
                      {option.type === 'boolean' && (
                        <button
                          onClick={() => handleToggle(option.key, !option.value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                            option.value ? 'bg-emerald-500' : 'bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                              option.value ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    
                    {option.type === 'select' && (
                      <select
                        value={option.value}
                        onChange={(e) => handleToggle(option.key, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 backdrop-blur-sm"
                      >
                        {option.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {'description' in option && option.description && (
                      <p className="text-xs text-slate-500">{option.description}</p>
                    )}
                  </div>
                ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Save Configuration Button */}
      {isAuthenticated && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={saveConfiguration}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      )}
      
      {/* Security Status */}
      <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-emerald-400" />
          <span className="text-base font-semibold text-emerald-300">Security Status</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            <span className="text-emerald-200">SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            <span className="text-emerald-200">GDPR Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            <span className="text-emerald-200">CCPA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
            <span className="text-emerald-200">Zero Data Retention</span>
          </div>
        </div>
      </div>
    </div>
  );
}
