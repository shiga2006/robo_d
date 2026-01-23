import { Robot, LOW_BATTERY_THRESHOLD } from '@/data/robots';

interface FactoryMapProps {
  robots: Robot[];
  selectedRobotId: string | null;
  onRobotClick: (robotId: string) => void;
}

const FactoryMap = ({ robots, selectedRobotId, onRobotClick }: FactoryMapProps) => {
  const getMarkerClass = (robot: Robot) => {
    if (robot.battery < LOW_BATTERY_THRESHOLD) return 'robot-marker-warning';
    if (robot.status === 'OFF') return 'robot-marker-inactive';
    return 'robot-marker-active';
  };

  return (
    <div className="card-industrial p-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Factory Floor Map
      </h3>
      
      <div className="factory-map h-64 relative">
        {/* Zone Labels */}
        <div className="absolute top-2 left-2 text-xs text-muted-foreground/60 font-mono">
          Assembly Zone A
        </div>
        <div className="absolute top-2 right-2 text-xs text-muted-foreground/60 font-mono">
          Charging Station
        </div>
        <div className="absolute bottom-12 left-2 text-xs text-muted-foreground/60 font-mono">
          Heavy Load Area
        </div>
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/60 font-mono">
          Shipping Dock
        </div>
        <div className="absolute top-1/2 right-1/4 text-xs text-muted-foreground/60 font-mono">
          Warehouse B
        </div>

        {/* Robot Markers */}
        {robots.map((robot) => (
          <button
            key={robot.id}
            onClick={() => onRobotClick(robot.id)}
            className={`robot-marker ${getMarkerClass(robot)} ${
              selectedRobotId === robot.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-125' : ''
            }`}
            style={{
              left: `${robot.position.x}%`,
              top: `${robot.position.y}%`,
            }}
            title={`${robot.name} (${robot.id})`}
          >
            <span className="text-xs font-bold text-primary-foreground">
              {robot.id.split('-')[1]}
            </span>
          </button>
        ))}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex items-center gap-4 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-border">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Low Battery</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactoryMap;
