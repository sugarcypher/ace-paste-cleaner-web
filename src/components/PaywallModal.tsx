import React, { useState } from 'react';
import { X, Check, Zap, Crown, Building } from 'lucide-react';
import { PRICING_TIERS, PricingTier } from '../types/pricing';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tierId: string) => void;
  currentTier: string;
  reason: 'daily_limit' | 'text_length' | 'feature_required';
  currentTextLength?: number;
}

export function PaywallModal({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  currentTier, 
  reason,
  currentTextLength = 0 
}: PaywallModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>('pro');

  if (!isOpen) return null;

  const getReasonMessage = () => {
    switch (reason) {
      case 'daily_limit':
        return 'You\'ve reached your daily cleaning limit. Upgrade to continue cleaning text!';
      case 'text_length':
        return `Your text is ${currentTextLength.toLocaleString()} characters. Free tier supports up to 10,000 characters.`;
      case 'feature_required':
        return 'This feature requires a Pro or Enterprise subscription.';
      default:
        return 'Upgrade to unlock more features!';
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return <Zap className="w-6 h-6 text-gray-400" />;
      case 'pro':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'enterprise':
        return <Building className="w-6 h-6 text-purple-500" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return 'border-gray-600 bg-gray-800/50';
      case 'pro':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'enterprise':
        return 'border-purple-500/50 bg-purple-500/10';
      default:
        return 'border-gray-600 bg-gray-800/50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div>
            <h2 className="text-2xl font-bold text-white">Upgrade Your Plan</h2>
            <p className="text-neutral-400 mt-1">{getReasonMessage()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`relative rounded-xl border p-6 cursor-pointer transition-all ${
                  selectedTier === tier.id
                    ? getTierColor(tier.id) + ' ring-2 ring-current'
                    : getTierColor(tier.id) + ' hover:opacity-80'
                } ${tier.id === currentTier ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => tier.id !== currentTier && setSelectedTier(tier.id)}
              >
                {tier.id === currentTier && (
                  <div className="absolute top-4 right-4 bg-green-500 text-green-900 px-2 py-1 rounded-full text-xs font-medium">
                    Current
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  {getTierIcon(tier.id)}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">
                        ${tier.price}
                      </span>
                      {tier.price > 0 && (
                        <span className="text-neutral-400">/{tier.interval}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-neutral-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => tier.id !== currentTier && onUpgrade(tier.id)}
                  disabled={tier.id === currentTier}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    tier.id === currentTier
                      ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                      : selectedTier === tier.id
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                >
                  {tier.id === currentTier ? 'Current Plan' : 
                   tier.price === 0 ? 'Downgrade' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-800/50">
          <div className="text-center">
            <p className="text-sm text-neutral-400 mb-4">
              All plans include a 7-day free trial. Cancel anytime.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-neutral-500">
              <span>🔒 Secure payments</span>
              <span>💳 All major cards</span>
              <span>🔄 Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
