import { Bot, Zap, Battery, Wrench, LayoutGrid } from 'lucide-react';

export type FilterType = 'all' | 'active' | 'lowBattery' | 'maintenance';

interface SidebarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    lowBattery: number;
    maintenance: number;
  };
}

const Sidebar = ({ activeFilter, onFilterChange, counts }: SidebarProps) => {
  const filters = [
    { id: 'all' as FilterType, label: 'All Robots', icon: LayoutGrid, count: counts.all },
    { id: 'active' as FilterType, label: 'Active Only', icon: Zap, count: counts.active },
    { id: 'lowBattery' as FilterType, label: 'Low Battery', icon: Battery, count: counts.lowBattery },
    { id: 'maintenance' as FilterType, label: 'Needs Maintenance', icon: Wrench, count: counts.maintenance },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Filters
        </h2>
      </div>

      <div className="p-3 flex-1">
        <div className="space-y-1">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`filter-button ${activeFilter === filter.id ? 'filter-button-active' : 'text-muted-foreground'}`}
            >
              <filter.icon className="w-5 h-5" />
              <span className="flex-1 text-sm">{filter.label}</span>
              <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                activeFilter === filter.id 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-secondary text-muted-foreground'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Bot className="w-4 h-4" />
          <span className="text-xs">System Online</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
