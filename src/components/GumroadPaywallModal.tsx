import React, { useState } from 'react';
import { X, Check, Zap, Crown, Building, ExternalLink } from 'lucide-react';
import { GUMROAD_PRODUCTS, GumroadProduct } from '../types/gumroad-pricing';

interface GumroadPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  reason: 'daily_limit' | 'text_length' | 'feature_required';
  currentTextLength?: number;
}

export function GumroadPaywallModal({ 
  isOpen, 
  onClose, 
  currentTier, 
  reason,
  currentTextLength = 0 
}: GumroadPaywallModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>('yearly');

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
      case 'pro':
      case 'pro-yearly':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'lifetime':
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
      case 'pro-yearly':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'lifetime':
        return 'border-purple-500/50 bg-purple-500/10';
      default:
        return 'border-gray-600 bg-gray-800/50';
    }
  };

  const handleUpgrade = (product: GumroadProduct) => {
    if (product.gumroadUrl) {
      // Open Gumroad checkout in new tab
      window.open(product.gumroadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getSavingsText = (product: GumroadProduct) => {
    switch (product.id) {
      case 'quarterly':
        return 'Save 5% vs monthly';
      case 'six-months':
        return 'Save 5% vs monthly';
      case 'yearly':
        return 'Save 41% vs monthly';
      default:
        return null;
    }
  };

  const getSavingsAmount = (product: GumroadProduct) => {
    switch (product.id) {
      case 'quarterly':
        return '$1';
      case 'six-months':
        return '$2';
      case 'yearly':
        return '$34';
      default:
        return null;
    }
  };

  const isMostPopular = (product: GumroadProduct) => {
    return product.id === 'yearly';
  };

  const isBestValue = (product: GumroadProduct) => {
    return product.id === 'yearly';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {GUMROAD_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className={`relative rounded-xl border p-6 cursor-pointer transition-all ${
                  selectedTier === product.id
                    ? getTierColor(product.id) + ' ring-2 ring-current'
                    : getTierColor(product.id) + ' hover:opacity-80'
                } ${product.id === currentTier ? 'opacity-50 cursor-not-allowed' : ''} ${
                  isMostPopular(product) ? 'ring-2 ring-yellow-500 scale-105' : ''
                }`}
                onClick={() => product.id !== currentTier && setSelectedTier(product.id)}
              >
                {product.id === currentTier && (
                  <div className="absolute top-4 right-4 bg-green-500 text-green-900 px-2 py-1 rounded-full text-xs font-medium">
                    Current
                  </div>
                )}
                
                {isMostPopular(product) && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  {getTierIcon(product.id)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">
                        ${product.price}
                      </span>
                      {product.price > 0 && (
                        <span className="text-neutral-400 text-sm">
                          /{product.interval === 'lifetime' ? 'once' : product.interval}
                        </span>
                      )}
                    </div>
                    {getSavingsText(product) && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="text-xs text-green-400 font-bold bg-green-500/20 px-2 py-1 rounded">
                          {getSavingsText(product)}
                        </div>
                        {getSavingsAmount(product) && (
                          <div className="text-xs text-green-300 font-medium">
                            ({getSavingsAmount(product)} saved)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-neutral-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => product.id !== currentTier && handleUpgrade(product)}
                  disabled={product.id === currentTier}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    product.id === currentTier
                      ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                      : selectedTier === product.id
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-neutral-800 text-white hover:bg-neutral-700'
                  }`}
                >
                  {product.id === currentTier ? 'Current Plan' : 
                   product.price === 0 ? 'Downgrade' : (
                     <>
                       Upgrade Now
                       <ExternalLink className="w-4 h-4" />
                     </>
                   )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Time Savings Comparison */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-800/30">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Time Savings & Value</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-neutral-900 rounded-lg">
              <div className="text-sm text-neutral-400">Monthly</div>
              <div className="text-lg font-bold text-blue-400">20+ hours</div>
              <div className="text-xs text-neutral-500">$500+ value</div>
            </div>
            <div className="text-center p-3 bg-neutral-900 rounded-lg">
              <div className="text-sm text-neutral-400">Quarterly</div>
              <div className="text-lg font-bold text-green-400">80+ hours</div>
              <div className="text-xs text-neutral-500">$2,000+ value</div>
            </div>
            <div className="text-center p-3 bg-neutral-900 rounded-lg">
              <div className="text-sm text-neutral-400">6 Months</div>
              <div className="text-lg font-bold text-green-400">200+ hours</div>
              <div className="text-xs text-neutral-500">$5,000+ value</div>
            </div>
            <div className="text-center p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
              <div className="text-sm text-yellow-300">Yearly</div>
              <div className="text-lg font-bold text-yellow-400">400+ hours</div>
              <div className="text-xs text-yellow-300 font-bold">$10,000+ value - NO BRAINER!</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-800/50">
          <div className="text-center">
            <p className="text-sm text-neutral-400 mb-4">
              Secure checkout powered by Gumroad. All plans include instant access.
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-neutral-500">
              <span>🔒 Secure payments</span>
              <span>💳 All major cards</span>
              <span>🔄 Cancel anytime</span>
              <span>⚡ Instant access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
