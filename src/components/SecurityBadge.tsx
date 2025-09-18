import React from 'react';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Shield className="w-6 h-6 text-green-400" />
        <h3 className="text-lg font-semibold text-green-300">Enterprise-Grade Security</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-200">End-to-end encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-200">SOC 2 compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-200">GDPR compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-200">CCPA compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-200">Zero data retention</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-200">Regular security audits</span>
        </div>
      </div>
    </div>
  );
}




