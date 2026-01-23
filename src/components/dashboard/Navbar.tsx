import { Bot, Activity, AlertTriangle, Cpu, LogOut } from 'lucide-react';
import { robots, getActiveRobots } from '@/data/robots';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthSafe } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  alertCount: number;
}

const Navbar = ({ alertCount }: NavbarProps) => {
  const totalRobots = robots.length;
  const activeRobots = getActiveRobots().length;
  const { user, logout } = useAuthSafe();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Cpu className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground glow-text-primary">
            RoboFleet Control
          </h1>
          <p className="text-xs text-muted-foreground">Industrial Monitoring System</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="navbar-stat">
          <Bot className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Total Robots</p>
            <p className="text-sm font-mono font-semibold text-foreground">{totalRobots}</p>
          </div>
        </div>

        <div className="navbar-stat">
          <Activity className="w-4 h-4 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-sm font-mono font-semibold text-success">{activeRobots}</p>
          </div>
        </div>

        <div className={`navbar-stat ${alertCount > 0 ? 'border-destructive/50 bg-destructive/10' : ''}`}>
          <AlertTriangle className={`w-4 h-4 ${alertCount > 0 ? 'text-destructive animate-blink' : 'text-muted-foreground'}`} />
          <div>
            <p className="text-xs text-muted-foreground">Alerts</p>
            <p className={`text-sm font-mono font-semibold ${alertCount > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {alertCount}
            </p>
          </div>
        </div>

        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="font-semibold text-foreground">{user}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
