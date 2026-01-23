import { Battery, Gauge, MapPin, AlertTriangle } from 'lucide-react';
import { Robot, LOW_BATTERY_THRESHOLD } from '@/data/robots';

interface RobotCardProps {
  robot: Robot;
  isHighlighted: boolean;
  onClick: () => void;
}

const RobotCard = ({ robot, isHighlighted, onClick }: RobotCardProps) => {
  const isLowBattery = robot.battery < LOW_BATTERY_THRESHOLD;
  
  const getSafetyColor = () => {
    switch (robot.safetyStatus) {
      case 'safe': return 'status-dot-safe';
      case 'warning': return 'status-dot-warning';
      case 'danger': return 'status-dot-danger';
    }
  };

  const getBatteryColor = () => {
    if (robot.battery < 20) return 'text-destructive';
    if (robot.battery < 50) return 'text-warning';
    return 'text-success';
  };

  return (
    <div
      onClick={onClick}
      className={`card-robot p-4 cursor-pointer ${
        isLowBattery ? 'card-robot-alert' : ''
      } ${isHighlighted ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{robot.name}</h3>
            {isLowBattery && (
              <AlertTriangle className="w-4 h-4 text-destructive animate-blink" />
            )}
          </div>
          <p className="text-sm font-mono text-muted-foreground">{robot.id}</p>
        </div>
        <span className={`badge-industrial ${robot.status === 'ON' ? 'badge-on' : 'badge-off'}`}>
          {robot.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Battery className="w-4 h-4" />
            <span className="text-sm">Battery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  robot.battery < 20 ? 'bg-destructive' : 
                  robot.battery < 50 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${robot.battery}%` }}
              />
            </div>
            <span className={`font-mono text-sm font-medium ${getBatteryColor()}`}>
              {robot.battery}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gauge className="w-4 h-4" />
            <span className="text-sm">Speed</span>
          </div>
          <span className="font-mono text-sm text-foreground">{robot.speed} m/s</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Zone</span>
          </div>
          <span className="text-sm text-foreground truncate max-w-32">{robot.zone}</span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Safety Status</span>
          <div className="flex items-center gap-2">
            <div className={`status-dot ${getSafetyColor()}`} />
            <span className="text-sm capitalize text-foreground">{robot.safetyStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotCard;
