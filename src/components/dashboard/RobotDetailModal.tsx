import { X, Battery, Gauge, Weight, Calendar, Power, MapPin } from 'lucide-react';
import { Robot } from '@/data/robots';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RobotDetailModalProps {
  robot: Robot | null;
  isOpen: boolean;
  onClose: () => void;
}

const RobotDetailModal = ({ robot, isOpen, onClose }: RobotDetailModalProps) => {
  if (!robot) return null;

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span className="text-foreground">{robot.name}</span>
              <span className="ml-2 font-mono text-sm text-muted-foreground">({robot.id})</span>
            </div>
            <span className={`badge-industrial ${robot.status === 'ON' ? 'badge-on' : 'badge-off'}`}>
              {robot.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card-industrial p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Battery className="w-4 h-4" />
                <span className="text-sm">Battery</span>
              </div>
              <p className={`text-2xl font-mono font-bold ${getBatteryColor()}`}>
                {robot.battery}%
              </p>
              <div className="w-full h-2 bg-secondary rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    robot.battery < 20 ? 'bg-destructive' : 
                    robot.battery < 50 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${robot.battery}%` }}
                />
              </div>
            </div>

            <div className="card-industrial p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Gauge className="w-4 h-4" />
                <span className="text-sm">Speed</span>
              </div>
              <p className="text-2xl font-mono font-bold text-foreground">
                {robot.speed} <span className="text-sm text-muted-foreground">m/s</span>
              </p>
            </div>

            <div className="card-industrial p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Weight className="w-4 h-4" />
                <span className="text-sm">Load Weight</span>
              </div>
              <p className="text-2xl font-mono font-bold text-foreground">
                {robot.loadWeight} <span className="text-sm text-muted-foreground">kg</span>
              </p>
            </div>

            <div className="card-industrial p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Last Maintenance</span>
              </div>
              <p className="text-lg font-mono font-bold text-foreground">
                {new Date(robot.lastMaintenance).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Safety & Status */}
          <div className="card-industrial p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Safety Status</p>
                <div className="flex items-center gap-2">
                  <div className={`status-dot ${getSafetyColor()}`} />
                  <span className="text-lg font-semibold capitalize text-foreground">
                    {robot.safetyStatus}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Power State</p>
                <div className="flex items-center gap-2">
                  <Power className={`w-5 h-5 ${robot.status === 'ON' ? 'text-success' : 'text-muted-foreground'}`} />
                  <span className="text-lg font-semibold text-foreground">{robot.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Map */}
          <div className="card-industrial p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Current Location: {robot.zone}</span>
            </div>
            <div className="factory-map h-32 relative">
              <div
                className="robot-marker robot-marker-active"
                style={{
                  left: `${robot.position.x}%`,
                  top: `${robot.position.y}%`,
                }}
              >
                <span className="text-xs font-bold text-primary-foreground">
                  {robot.id.split('-')[1]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RobotDetailModal;
