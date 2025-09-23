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
        return 'bg-gray-800 border-gray-700';
      case 'pro':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'enterprise':
        return 'bg-purple-500/20 border-purple-500/30';
      default:
        return 'bg-gray-800 border-gray-700';
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
    <div className={`rounded-xl border p-4 ${getTierColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getTierIcon()}
          <span className="text-sm font-medium text-white capitalize">
            {currentTier.name} Plan
          </span>
        </div>
        {user.tier === 'free' && (
          <button
            onClick={onUpgrade}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg transition-colors"
          >
            Upgrade
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-400">Daily Usage</span>
          <span className={`text-sm font-medium ${getUsageColor()}`}>
            {getUsageMessage()}
          </span>
        </div>

        {remainingCleanings !== -1 && (
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                remainingCleanings === 0 
                  ? 'bg-red-500' 
                  : remainingCleanings <= 2 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
              }`}
              style={{
                width: `${Math.max(0, (usage.dailyCleanings / currentTier.limits.dailyCleanings) * 100)}%`
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>Total: {usage.totalCleanings.toLocaleString()}</span>
          <span>Max: {currentTier.limits.maxTextLength === -1 ? '∞' : currentTier.limits.maxTextLength.toLocaleString()} chars</span>
        </div>
        
        {/* Character limit warning for free tier */}
        {user.tier === 'free' && (
          <div className="text-xs text-neutral-500">
            Free tier: 2,000 character limit per cleaning
          </div>
        )}
      </div>

      {remainingCleanings === 0 && user.tier === 'free' && (
        <div className="mt-3 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-300">
              Upgrade to Pro for unlimited cleanings
            </span>
          </div>
        </div>
      )}
    </div>
  );
}




