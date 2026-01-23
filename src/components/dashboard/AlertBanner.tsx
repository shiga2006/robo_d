import { AlertTriangle, X } from 'lucide-react';
import { Robot } from '@/data/robots';

interface AlertBannerProps {
  lowBatteryRobots: Robot[];
  onDismiss: () => void;
  isVisible: boolean;
}

const AlertBanner = ({ lowBatteryRobots, onDismiss, isVisible }: AlertBannerProps) => {
  if (!isVisible || lowBatteryRobots.length === 0) return null;

  return (
    <div className="alert-banner mx-4 mt-4">
      <AlertTriangle className="w-5 h-5 text-destructive animate-blink flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          ⚠️ Low Battery Warning
        </p>
        <p className="text-xs text-muted-foreground">
          {lowBatteryRobots.map(r => r.id).join(', ')} {lowBatteryRobots.length === 1 ? 'is' : 'are'} running low on battery
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 hover:bg-destructive/20 rounded transition-colors"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default AlertBanner;
