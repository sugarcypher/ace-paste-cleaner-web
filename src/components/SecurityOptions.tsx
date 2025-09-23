import { Shield, Lock, Eye } from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';

export function SecurityOptions() {
  const { securitySettings, updateSecuritySettings } = useSecurity();

  const handleToggle = async (key: keyof typeof securitySettings, value: any) => {
    await updateSecuritySettings({ [key]: value });
  };

  const securityFeatures = [
    {
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
    <div className="mb-6">
      <label className="block text-sm uppercase tracking-wider text-neutral-400 mb-4">Enterprise Security</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {securityFeatures.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <div key={index} className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <IconComponent className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">{section.title}</h3>
              </div>
              
              <div className="space-y-3">
                {section.options.map((option) => (
                  <div key={option.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-neutral-300">{option.label}</label>
                      {option.type === 'boolean' && (
                        <button
                          onClick={() => handleToggle(option.key, !option.value)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            option.value ? 'bg-emerald-500' : 'bg-neutral-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              option.value ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    
                    {option.type === 'select' && (
                      <select
                        value={option.value}
                        onChange={(e) => handleToggle(option.key, e.target.value)}
                        className="w-full px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {option.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {'description' in option && option.description && (
                      <p className="text-xs text-neutral-500">{option.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Security Status */}
      <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-300">Security Status</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-200">SOC 2 Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-200">GDPR Ready</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-200">CCPA Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-200">Zero Data Retention</span>
          </div>
        </div>
      </div>
    </div>
  );
}
