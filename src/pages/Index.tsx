import { useState, useMemo } from 'react';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar, { FilterType } from '@/components/dashboard/Sidebar';
import RobotCard from '@/components/dashboard/RobotCard';
import RobotDetailModal from '@/components/dashboard/RobotDetailModal';
import AlertBanner from '@/components/dashboard/AlertBanner';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import InteractiveMap from '@/components/map/InteractiveMap';
import MapSelector from '@/components/map/MapSelector';
import MapUpload from '@/components/map/MapUpload';
import NodePanel from '@/components/map/NodePanel';
import { robots, getLowBatteryRobots, getActiveRobots, getMaintenanceRobots, Robot } from '@/data/robots';
import { useMapData } from '@/hooks/useMapData';
import { useAuth } from '@/contexts/AuthContext';
import { NodeType } from '@/types/map';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Index = () => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id || 'demo-user-123';

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);
  const [modalRobot, setModalRobot] = useState<Robot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    maps,
    selectedMapId,
    setSelectedMapId,
    nodes,
    connections,
    createMap,
    deleteMap,
    createNode,
    updateNode,
    deleteNode,
    createConnection,
    deleteConnection,
  } = useMapData(userId);

  const lowBatteryRobots = useMemo(() => getLowBatteryRobots(), []);
  const activeRobots = useMemo(() => getActiveRobots(), []);
  const maintenanceRobots = useMemo(() => getMaintenanceRobots(), []);

  const filterCounts = {
    all: robots.length,
    active: activeRobots.length,
    lowBattery: lowBatteryRobots.length,
    maintenance: maintenanceRobots.length,
  };

  const filteredRobots = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return activeRobots;
      case 'lowBattery':
        return lowBatteryRobots;
      case 'maintenance':
        return maintenanceRobots;
      default:
        return robots;
    }
  }, [activeFilter, activeRobots, lowBatteryRobots, maintenanceRobots]);

  const handleRobotCardClick = (robot: Robot) => {
    setModalRobot(robot);
    setIsModalOpen(true);
  };

  const handleMapRobotClick = (robotId: string) => {
    setSelectedRobotId(robotId);
    const robot = robots.find(r => r.id === robotId);
    if (robot) {
      setModalRobot(robot);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalRobot(null);
  };

  const handleMapUpload = async (file: File, name: string, width: number, height: number) => {
    setIsUploading(true);
    try {
      // For MERN stack: Pass file directly to createMap
      await createMap(name, file, width, height);
      setShowUploadDialog(false);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddNode = async (x: number, y: number, label: string, nodeType: NodeType) => {
    if (selectedMapId) {
      await createNode(selectedMapId, x, y, label, nodeType);
    }
  };

  const handleAddConnection = async (fromNodeId: string, toNodeId: string) => {
    if (selectedMapId) {
      await createConnection(selectedMapId, fromNodeId, toNodeId);
    }
  };

  const selectedMap = maps.find((m) => m.id === selectedMapId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar alertCount={lowBatteryRobots.length} />

      <AlertBanner
        lowBatteryRobots={lowBatteryRobots}
        onDismiss={() => setIsBannerVisible(false)}
        isVisible={isBannerVisible}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Map Selector */}
            <MapSelector
              maps={maps}
              selectedMapId={selectedMapId}
              onSelectMap={setSelectedMapId}
              onDeleteMap={deleteMap}
              onNewMap={() => setShowUploadDialog(true)}
            />

            {/* Interactive Map Section */}
            {selectedMap ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <InteractiveMap
                    mapImageUrl={selectedMap.image_url}
                    mapWidth={selectedMap.width}
                    mapHeight={selectedMap.height}
                    nodes={nodes}
                    connections={connections}
                    robots={robots}
                    selectedRobotId={selectedRobotId}
                    onAddNode={handleAddNode}
                    onDeleteNode={deleteNode}
                    onAddConnection={handleAddConnection}
                    onDeleteConnection={deleteConnection}
                    onRobotClick={handleMapRobotClick}
                    editable={true}
                  />
                </div>
                <div className="lg:col-span-1">
                  <NodePanel
                    nodes={nodes}
                    onUpdateNode={updateNode}
                    onDeleteNode={deleteNode}
                  />
                </div>
              </div>
            ) : (
              <div className="card-industrial p-12 text-center">
                <h3 className="text-lg font-semibold mb-2">No Map Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Upload a floor plan to start marking delivery points and robot paths
                </p>
                <Button onClick={() => setShowUploadDialog(true)}>
                  Upload Your First Map
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Robot Cards Grid */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {activeFilter === 'all' ? 'All Robots' :
                      activeFilter === 'active' ? 'Active Robots' :
                        activeFilter === 'lowBattery' ? 'Low Battery Robots' :
                          'Needs Maintenance'}
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground font-mono">
                      {filteredRobots.length} robots
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRobots.map((robot) => (
                    <RobotCard
                      key={robot.id}
                      robot={robot}
                      isHighlighted={selectedRobotId === robot.id}
                      onClick={() => handleRobotCardClick(robot)}
                    />
                  ))}
                </div>

                {filteredRobots.length === 0 && (
                  <div className="card-industrial p-8 text-center">
                    <p className="text-muted-foreground">No robots match the current filter.</p>
                  </div>
                )}
              </div>

              {/* Alerts Panel */}
              <div className="lg:col-span-1">
                <AlertsPanel
                  lowBatteryRobots={lowBatteryRobots}
                  onDismiss={() => { }}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Map Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Floor Plan Map</DialogTitle>
          </DialogHeader>
          <MapUpload onUpload={handleMapUpload} isUploading={isUploading} />
        </DialogContent>
      </Dialog>

      <RobotDetailModal
        robot={modalRobot}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;
