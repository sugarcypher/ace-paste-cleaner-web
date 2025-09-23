import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SecuritySettings } from '../types/advancedDetection';

interface SecurityContextType {
  hasAcceptedTerms: boolean;
  securitySettings: SecuritySettings;
  isLoading: boolean;
  acceptTerms: () => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  dataRetention: 'none',
  analyticsEnabled: false,
  crashReportingEnabled: false,
  encryptionLevel: 'enhanced',
  networkLogging: false,
  biometricProtection: false,
  autoLockEnabled: false,
  autoLockTimeout: 300,
};

const STORAGE_KEYS = {
  TERMS_ACCEPTED: 'ace_paste_cleaner_terms_accepted',
  SECURITY_SETTINGS: 'ace_paste_cleaner_security_settings',
};

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(DEFAULT_SECURITY_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      setIsLoading(true);
      
      const [termsAccepted, storedSettings] = await Promise.all([
        localStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED),
        localStorage.getItem(STORAGE_KEYS.SECURITY_SETTINGS),
      ]);

      if (termsAccepted === 'true') {
        setHasAcceptedTerms(true);
      }

      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSecuritySettings({ ...DEFAULT_SECURITY_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error('Failed to load stored security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const acceptTerms = useCallback(async () => {
    try {
      localStorage.setItem(STORAGE_KEYS.TERMS_ACCEPTED, 'true');
      setHasAcceptedTerms(true);
    } catch (error) {
      console.error('Failed to save terms acceptance:', error);
      throw error;
    }
  }, []);

  const updateSecuritySettings = useCallback(async (newSettings: Partial<SecuritySettings>) => {
    try {
      const updatedSettings = { ...securitySettings, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SECURITY_SETTINGS, JSON.stringify(updatedSettings));
      setSecuritySettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update security settings:', error);
      throw error;
    }
  }, [securitySettings]);

  const resetToDefaults = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.TERMS_ACCEPTED);
      localStorage.removeItem(STORAGE_KEYS.SECURITY_SETTINGS);
      setHasAcceptedTerms(false);
      setSecuritySettings(DEFAULT_SECURITY_SETTINGS);
    } catch (error) {
      console.error('Failed to reset security settings:', error);
      throw error;
    }
  }, []);

  const value = useMemo(() => ({
    hasAcceptedTerms,
    securitySettings,
    isLoading,
    acceptTerms,
    updateSecuritySettings,
    resetToDefaults,
  }), [hasAcceptedTerms, securitySettings, isLoading]);

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}




