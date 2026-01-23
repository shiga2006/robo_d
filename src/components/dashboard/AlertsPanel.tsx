import { AlertTriangle, Battery, Clock, X } from 'lucide-react';
import { Robot } from '@/data/robots';

interface Alert {
  id: string;
  robotId: string;
  robotName: string;
  battery: number;
  timestamp: Date;
}

interface AlertsPanelProps {
  lowBatteryRobots: Robot[];
  onDismiss: (robotId: string) => void;
}

const AlertsPanel = ({ lowBatteryRobots, onDismiss }: AlertsPanelProps) => {
  if (lowBatteryRobots.length === 0) return null;

  return (
    <div className="card-industrial p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Active Alerts
        </h3>
        <span className="ml-auto bg-destructive/20 text-destructive text-xs font-mono px-2 py-0.5 rounded">
          {lowBatteryRobots.length}
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {lowBatteryRobots.map((robot) => (
          <div
            key={robot.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30"
          >
            <Battery className="w-4 h-4 text-destructive" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                Low Battery: {robot.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{robot.id}</span>
                <span>•</span>
                <span className="text-destructive font-semibold">{robot.battery}%</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Now</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsPanel;
