export interface Robot {
  id: string;
  name: string;
  status: 'ON' | 'OFF';
  battery: number;
  safetyStatus: 'safe' | 'warning' | 'danger';
  speed: number;
  lastMaintenance: string;
  loadWeight: number;
  position: { x: number; y: number };
  zone: string;
}

export const robots: Robot[] = [
  {
    id: 'AGV-001',
    name: 'Atlas Prime',
    status: 'ON',
    battery: 87,
    safetyStatus: 'safe',
    speed: 1.8,
    lastMaintenance: '2024-01-10',
    loadWeight: 120,
    position: { x: 15, y: 25 },
    zone: 'Assembly Zone A'
  },
  {
    id: 'AGV-002',
    name: 'Nexus Hauler',
    status: 'ON',
    battery: 18,
    safetyStatus: 'warning',
    speed: 1.2,
    lastMaintenance: '2024-01-08',
    loadWeight: 85,
    position: { x: 45, y: 60 },
    zone: 'Warehouse B'
  },
  {
    id: 'AGV-003',
    name: 'Titan Carrier',
    status: 'OFF',
    battery: 45,
    safetyStatus: 'safe',
    speed: 0,
    lastMaintenance: '2024-01-12',
    loadWeight: 0,
    position: { x: 75, y: 30 },
    zone: 'Charging Station'
  },
  {
    id: 'AGV-004',
    name: 'Swift Runner',
    status: 'ON',
    battery: 62,
    safetyStatus: 'safe',
    speed: 2.1,
    lastMaintenance: '2024-01-05',
    loadWeight: 95,
    position: { x: 55, y: 80 },
    zone: 'Shipping Dock'
  },
  {
    id: 'AGV-005',
    name: 'Iron Sentinel',
    status: 'ON',
    battery: 12,
    safetyStatus: 'danger',
    speed: 0.8,
    lastMaintenance: '2023-12-28',
    loadWeight: 150,
    position: { x: 30, y: 45 },
    zone: 'Heavy Load Area'
  }
];

export const LOW_BATTERY_THRESHOLD = 25;

export const getLowBatteryRobots = () => {
  return robots.filter(robot => robot.battery < LOW_BATTERY_THRESHOLD);
};

export const getActiveRobots = () => {
  return robots.filter(robot => robot.status === 'ON');
};

export const getMaintenanceRobots = () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return robots.filter(robot => new Date(robot.lastMaintenance) < thirtyDaysAgo);
};
