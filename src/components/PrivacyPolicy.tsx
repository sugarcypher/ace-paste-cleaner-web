import React, { useState } from 'react';
import { X, FileText, Shield, Eye, Database, Users } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
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
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-300">Data Privacy</h3>
            </div>
            <p className="text-sm text-blue-200">
              Your text data is processed locally in your browser and never stored on our servers. 
              We use industry-standard encryption and follow strict data minimization principles.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              Data Collection
            </h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• <strong>Usage Analytics:</strong> Anonymous usage statistics to improve our service</li>
              <li>• <strong>Account Data:</strong> Email address and subscription status (Pro/Enterprise users)</li>
              <li>• <strong>Payment Data:</strong> Processed securely through Stripe (we never store payment info)</li>
              <li>• <strong>Text Data:</strong> Processed locally, never transmitted to our servers</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Security Measures
            </h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• <strong>End-to-End Encryption:</strong> All data transmission is encrypted</li>
              <li>• <strong>Zero Data Retention:</strong> Text data is never stored on our servers</li>
              <li>• <strong>Regular Audits:</strong> Third-party security assessments</li>
              <li>• <strong>Access Controls:</strong> Strict access controls and monitoring</li>
              <li>• <strong>Compliance:</strong> SOC 2, GDPR, and CCPA compliant</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              Your Rights
            </h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• <strong>Data Portability:</strong> Export your data at any time</li>
              <li>• <strong>Data Deletion:</strong> Request complete data deletion</li>
              <li>• <strong>Access Rights:</strong> View what data we have about you</li>
              <li>• <strong>Opt-out:</strong> Unsubscribe from communications</li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Contact Us</h3>
            <p className="text-sm text-neutral-300 mb-2">
              For privacy-related questions or requests:
            </p>
            <p className="text-sm text-blue-400">
              Email: privacy@acepaste.xyz<br />
              Response time: Within 24 hours
            </p>
          </div>

          <div className="text-xs text-neutral-500 text-center">
            Last updated: September 15, 2025
          </div>
        </div>
      </div>
    </div>
  );
}
