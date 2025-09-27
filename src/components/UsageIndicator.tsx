import { Zap, Crown, Building, AlertCircle } from 'lucide-react';
import { User, UsageStats, PRICING_TIERS } from '../types/pricing';

interface UsageIndicatorProps {
  user: User | null;
  usage: UsageStats | null;
  onUpgrade: () => void;
}

export function UsageIndicator({ user, usage, onUpgrade }: UsageIndicatorProps) {
  if (!user || !usage) return null;

  const currentTier = PRICING_TIERS.find(tier => tier.id === user.tier) || PRICING_TIERS[0];
  const remainingCleanings = currentTier.limits.dailyCleanings === -1 
    ? -1 
    : Math.max(0, currentTier.limits.dailyCleanings - usage.dailyCleanings);

  const getTierIcon = () => {
    switch (user.tier) {
      case 'free':
        return <Zap className="w-4 h-4 text-gray-400" />;
      case 'pro':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'enterprise':
        return <Building className="w-4 h-4 text-purple-500" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getTierColor = () => {
    switch (user.tier) {
      case 'free':
        return 'bg-slate-800/50 border-slate-700/50';
      case 'pro':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'enterprise':
        return 'bg-purple-500/20 border-purple-500/30';
      default:
        return 'bg-slate-800/50 border-slate-700/50';
    }
  };

  const getUsageColor = () => {
    if (remainingCleanings === -1) return 'text-green-400'; // unlimited
    if (remainingCleanings === 0) return 'text-red-400';
    if (remainingCleanings <= 2) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getUsageMessage = () => {
    if (remainingCleanings === -1) return 'Unlimited cleanings';
    if (remainingCleanings === 0) return 'No cleanings remaining today';
    if (remainingCleanings === 1) return '1 cleaning remaining today';
    return `${remainingCleanings} cleanings remaining today`;
  };

  return (
    <div className={`rounded-2xl border p-6 ${getTierColor()} backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getTierIcon()}
          <span className="text-lg font-semibold text-white capitalize">
            {currentTier.name} Plan
          </span>
        </div>
        {user.tier === 'free' && (
          <button
            onClick={onUpgrade}
            className="text-sm bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105"
          >
            Upgrade
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Daily Usage</span>
          <span className={`text-base font-semibold ${getUsageColor()}`}>
            {getUsageMessage()}
          </span>
        </div>

        {remainingCleanings !== -1 && (
          <div className="w-full bg-slate-700/50 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                remainingCleanings === 0 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : remainingCleanings <= 2 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                  : 'bg-gradient-to-r from-emerald-500 to-green-500'
              }`}
              style={{
                width: `${Math.max(0, (usage.dailyCleanings / currentTier.limits.dailyCleanings) * 100)}%`
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Total: {usage.totalCleanings.toLocaleString()}</span>
          <span>Max: {currentTier.limits.maxTextLength === -1 ? '∞' : currentTier.limits.maxTextLength.toLocaleString()} chars</span>
        </div>
        
        {/* Character limit warning for free tier */}
        {user.tier === 'free' && (
          <div className="text-sm text-slate-500">
            Free tier: 2,000 character limit per cleaning
          </div>
        )}
      </div>

      {remainingCleanings === 0 && user.tier === 'free' && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-300">
              Upgrade to Pro for unlimited cleanings
            </span>
          </div>
        </div>
      )}
    </div>
  );
}




