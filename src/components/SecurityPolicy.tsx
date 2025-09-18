import React from 'react';
import { X, Shield, Lock, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface SecurityPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SecurityPolicy({ isOpen, onClose }: SecurityPolicyProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Security Policy</h2>
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
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-300">Security Certifications</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200">SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200">ISO 27001 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-200">CCPA Compliant</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-400" />
              Data Protection
            </h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• <strong>End-to-End Encryption:</strong> AES-256 encryption for all data transmission</li>
              <li>• <strong>Zero Data Retention:</strong> Text data is processed locally and never stored</li>
              <li>• <strong>Secure Infrastructure:</strong> Hosted on enterprise-grade cloud infrastructure</li>
              <li>• <strong>Regular Backups:</strong> Encrypted backups with 99.9% uptime SLA</li>
              <li>• <strong>Access Logging:</strong> Comprehensive audit trails for all system access</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Security Measures
            </h3>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li>• <strong>Multi-Factor Authentication:</strong> Required for all admin access</li>
              <li>• <strong>Regular Security Audits:</strong> Third-party penetration testing</li>
              <li>• <strong>Vulnerability Management:</strong> Automated security scanning</li>
              <li>• <strong>Incident Response:</strong> 24/7 security monitoring and response</li>
              <li>• <strong>Employee Training:</strong> Regular security awareness training</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              Incident Response
            </h3>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-sm text-orange-200 mb-2">
                In the event of a security incident, we will:
              </p>
              <ul className="space-y-1 text-sm text-orange-200">
                <li>• Notify affected users within 24 hours</li>
                <li>• Provide detailed incident reports</li>
                <li>• Implement immediate remediation measures</li>
                <li>• Conduct post-incident analysis</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-cyan-400" />
              Security Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a 
                href="https://acepaste.xyz/security-report" 
                className="flex items-center gap-2 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-300">Security Report</span>
              </a>
              <a 
                href="https://acepaste.xyz/bug-bounty" 
                className="flex items-center gap-2 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-cyan-300">Bug Bounty Program</span>
              </a>
            </div>
          </div>

          <div className="bg-neutral-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">Report Security Issues</h3>
            <p className="text-sm text-neutral-300 mb-2">
              Found a security vulnerability? Report it responsibly:
            </p>
            <p className="text-sm text-cyan-400">
              Email: security@acepaste.xyz<br />
              Response time: Within 4 hours for critical issues
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




