import React, { useState } from 'react';
import { X, Check, Zap, Crown, Building, Users, Settings, PenTool, Code } from 'lucide-react';
import { PRICING_TIERS, UPSELL_FEATURES, PricingTier, UpsellFeature } from '../types/pricing';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tierId: string) => void;
  onAddUpsell?: (upsellId: string) => void;
  currentTier: string;
  currentUpsells?: string[];
  reason: 'daily_limit' | 'text_length' | 'feature_required';
  currentTextLength?: number;
}

export function PaywallModal({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  onAddUpsell,
  currentTier, 
  currentUpsells = [],
  reason,
  currentTextLength = 0 
}: PaywallModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>('monthly');
  const [selectedUpsells, setSelectedUpsells] = useState<string[]>(currentUpsells);
  const [activeTab, setActiveTab] = useState<'plans' | 'addons'>('plans');

  if (!isOpen) return null;

  const getReasonMessage = () => {
    switch (reason) {
      case 'daily_limit':
        return 'You\'ve reached your daily cleaning limit. Upgrade to continue cleaning text!';
      case 'text_length':
        return `Your text is ${currentTextLength.toLocaleString()} characters. Free tier supports up to 2,000 characters.`;
      case 'feature_required':
        return 'This feature requires a paid subscription.';
      default:
        return 'Upgrade to unlock more features!';
    }
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return <Zap className="w-6 h-6 text-gray-400" />;
      case 'monthly':
        return <Crown className="w-6 h-6 text-blue-500" />;
      case 'quarterly':
        return <Crown className="w-6 h-6 text-green-500" />;
      case 'six_months':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'yearly':
        return <Crown className="w-6 h-6 text-orange-500" />;
      case 'two_years':
        return <Crown className="w-6 h-6 text-red-500" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getUpsellIcon = (category: string) => {
    switch (category) {
      case 'team':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'presets':
        return <Settings className="w-5 h-5 text-green-500" />;
      case 'writing':
        return <PenTool className="w-5 h-5 text-purple-500" />;
      case 'development':
        return <Code className="w-5 h-5 text-orange-500" />;
      default:
        return <Settings className="w-5 h-5" />;
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

        {/* Tabs */}
        <div className="border-b border-neutral-800">
          <div className="flex">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'plans'
                  ? 'text-white border-b-2 border-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('addons')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'addons'
                  ? 'text-white border-b-2 border-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Add-on Features
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'plans' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <span className="text-2xl font-bold text-white">
                        ${tier.price}
                      </span>
                      {tier.price > 0 && (
                        <span className="text-neutral-400 text-sm">/{tier.interval}</span>
                      )}
                    </div>
                    {tier.savings && (
                      <div className="text-xs text-green-400 font-medium">
                        {tier.savings}
                      </div>
                    )}
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
          )}

          {activeTab === 'addons' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {UPSELL_FEATURES.map((upsell) => (
                <div
                  key={upsell.id}
                  className={`relative rounded-xl border p-6 cursor-pointer transition-all ${
                    selectedUpsells.includes(upsell.id)
                      ? 'border-blue-500/50 bg-blue-500/10 ring-2 ring-blue-500/30'
                      : 'border-neutral-700 bg-neutral-800/50 hover:border-neutral-600'
                  }`}
                  onClick={() => {
                    if (selectedUpsells.includes(upsell.id)) {
                      setSelectedUpsells(selectedUpsells.filter(id => id !== upsell.id));
                    } else {
                      setSelectedUpsells([...selectedUpsells, upsell.id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {getUpsellIcon(upsell.category)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{upsell.name}</h3>
                      <p className="text-sm text-neutral-400">{upsell.description}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold text-white">
                          ${upsell.price}
                        </span>
                        <span className="text-neutral-400 text-sm">/{upsell.interval}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {upsell.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-neutral-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddUpsell) {
                        onAddUpsell(upsell.id);
                      }
                    }}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      selectedUpsells.includes(upsell.id)
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-neutral-700 text-white hover:bg-neutral-600'
                    }`}
                  >
                    {selectedUpsells.includes(upsell.id) ? 'Selected' : 'Add to Plan'}
                  </button>
                </div>
              ))}
            </div>
          )}
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
