import { useEffect, useState, useCallback, useRef } from 'react';
import { MapNode, MapConnection, NodeType } from '@/types/map';
import { Robot } from '@/data/robots';
import { useCanvas } from '@/hooks/useCanvas';
import {
    screenToCanvas,
    canvasToScreen,
    findNodeAtPosition,
    getNodeColor,
    connectionExists,
} from '@/lib/mapUtils';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface InteractiveMapProps {
    mapImageUrl: string;
    mapWidth: number;
    mapHeight: number;
    nodes: MapNode[];
    connections: MapConnection[];
    robots?: Robot[];
    selectedRobotId?: string | null;
    onAddNode: (x: number, y: number, label: string, nodeType: NodeType) => void;
    onDeleteNode: (nodeId: string) => void;
    onAddConnection: (fromNodeId: string, toNodeId: string) => void;
    onDeleteConnection: (connectionId: string) => void;
    onRobotClick?: (robotId: string) => void;
    editable?: boolean;
}

const InteractiveMap = ({
    mapImageUrl,
    mapWidth,
    mapHeight,
    nodes,
    connections,
    robots = [],
    selectedRobotId,
    onAddNode,
    onDeleteNode,
    onAddConnection,
    onDeleteConnection,
    onRobotClick,
    editable = true,
}: InteractiveMapProps) => {
    const {
        canvasRef,
        canvasState,
        handleWheel,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        getContext,
        resetView,
        fitToImage,
    } = useCanvas();

    const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
    const [selectedNodeType, setSelectedNodeType] = useState<NodeType>('waypoint');
    const [selectedNodeForConnection, setSelectedNodeForConnection] = useState<string | null>(null);
    const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
    const [deleteMode, setDeleteMode] = useState(false);
    const animationFrameRef = useRef<number>();

    // Load map image
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setMapImage(img);
            fitToImage(img.width, img.height);
        };
        img.onerror = () => {
            toast.error('Failed to load map image');
        };
        img.src = mapImageUrl;
    }, [mapImageUrl, fitToImage]);

    // Canvas event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [handleWheel, canvasRef]);

    // Handle canvas clicks
    const handleCanvasClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!canvasRef.current || !editable) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const canvasPos = screenToCanvas(
                e.clientX,
                e.clientY,
                canvasState.panOffset,
                canvasState.scale,
                rect
            );

            // Check if clicked on existing node
            const clickedNode = findNodeAtPosition(nodes, canvasPos, 15 / canvasState.scale);

            if (deleteMode && clickedNode) {
                onDeleteNode(clickedNode.id);
                setDeleteMode(false);
                return;
            }

            if (clickedNode) {
                // Connection mode
                if (selectedNodeForConnection) {
                    if (selectedNodeForConnection !== clickedNode.id) {
                        // Check if connection already exists
                        if (!connectionExists(connections, selectedNodeForConnection, clickedNode.id)) {
                            onAddConnection(selectedNodeForConnection, clickedNode.id);
                        } else {
                            toast.info('Connection already exists');
                        }
                    }
                    setSelectedNodeForConnection(null);
                } else {
                    setSelectedNodeForConnection(clickedNode.id);
                    toast.info('Click another node to connect');
                }
            } else {
                // Add new node
                if (!selectedNodeForConnection) {
                    const label = `${selectedNodeType.charAt(0).toUpperCase()}${nodes.filter(n => n.node_type === selectedNodeType).length + 1}`;
                    onAddNode(canvasPos.x, canvasPos.y, label, selectedNodeType);
                } else {
                    setSelectedNodeForConnection(null);
                }
            }
        },
        [
            canvasRef,
            canvasState,
            nodes,
            connections,
            selectedNodeType,
            selectedNodeForConnection,
            deleteMode,
            editable,
            onAddNode,
            onDeleteNode,
            onAddConnection,
        ]
    );

    // Handle mouse move for hover effects
    const handleCanvasMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();
            const canvasPos = screenToCanvas(
                e.clientX,
                e.clientY,
                canvasState.panOffset,
                canvasState.scale,
                rect
            );

            const node = findNodeAtPosition(nodes, canvasPos, 15 / canvasState.scale);
            setHoveredNode(node);
        },
        [canvasRef, canvasState, nodes]
    );

    // Render canvas
    const render = useCallback(() => {
        const ctx = getContext();
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        // Apply transformations
        ctx.translate(canvasState.panOffset.x, canvasState.panOffset.y);
        ctx.scale(canvasState.scale, canvasState.scale);

        // Draw map image
        if (mapImage) {
            ctx.drawImage(mapImage, 0, 0);
        }

        // Draw connections
        ctx.lineWidth = 3 / canvasState.scale;
        connections.forEach((conn) => {
            const fromNode = nodes.find((n) => n.id === conn.from_node_id);
            const toNode = nodes.find((n) => n.id === conn.to_node_id);

            if (fromNode && toNode) {
                ctx.strokeStyle = '#94a3b8'; // slate-400
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(toNode.x, toNode.y);
                ctx.stroke();

                // Draw arrow
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
                const arrowSize = 10 / canvasState.scale;
                ctx.fillStyle = '#94a3b8';
                ctx.beginPath();
                ctx.moveTo(toNode.x, toNode.y);
                ctx.lineTo(
                    toNode.x - arrowSize * Math.cos(angle - Math.PI / 6),
                    toNode.y - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                ctx.lineTo(
                    toNode.x - arrowSize * Math.cos(angle + Math.PI / 6),
                    toNode.y - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                ctx.closePath();
                ctx.fill();
            }
        });

        // Draw connection preview
        if (selectedNodeForConnection) {
            const fromNode = nodes.find((n) => n.id === selectedNodeForConnection);
            if (fromNode && hoveredNode) {
                ctx.strokeStyle = '#3b82f6'; // blue
                ctx.setLineDash([5 / canvasState.scale, 5 / canvasState.scale]);
                ctx.beginPath();
                ctx.moveTo(fromNode.x, fromNode.y);
                ctx.lineTo(hoveredNode.x, hoveredNode.y);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Draw nodes
        nodes.forEach((node) => {
            const isSelected = node.id === selectedNodeForConnection;
            const isHovered = hoveredNode?.id === node.id;
            const radius = (isHovered || isSelected ? 12 : 10) / canvasState.scale;

            ctx.fillStyle = getNodeColor(node.node_type);
            ctx.strokeStyle = isSelected ? '#3b82f6' : '#ffffff';
            ctx.lineWidth = (isSelected ? 4 : 2) / canvasState.scale;

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Draw label
            if (isHovered || isSelected) {
                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${12 / canvasState.scale}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(node.label || node.node_type, node.x, node.y - radius - 5 / canvasState.scale);
            }
        });

        // Draw robot markers
        robots.forEach((robot) => {
            const x = (robot.position.x / 100) * mapWidth;
            const y = (robot.position.y / 100) * mapHeight;
            const radius = 8 / canvasState.scale;

            // Robot color based on status
            let color = '#10b981'; // green
            if (robot.battery < 20) color = '#f59e0b'; // amber
            if (robot.status === 'OFF') color = '#6b7280'; // gray

            ctx.fillStyle = color;
            ctx.strokeStyle = robot.id === selectedRobotId ? '#ffffff' : '#000000';
            ctx.lineWidth = 2 / canvasState.scale;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Robot ID
            ctx.fillStyle = '#000000';
            ctx.font = `bold ${10 / canvasState.scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(robot.id.split('-')[1], x, y);
        });

        ctx.restore();
    }, [
        getContext,
        canvasRef,
        canvasState,
        mapImage,
        nodes,
        connections,
        robots,
        selectedRobotId,
        selectedNodeForConnection,
        hoveredNode,
        mapWidth,
        mapHeight,
    ]);

    // Animation loop
    useEffect(() => {
        const animate = () => {
            render();
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [render]);

    // Resize canvas to match container
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const resizeObserver = new ResizeObserver(() => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        });

        resizeObserver.observe(canvas);
        return () => resizeObserver.disconnect();
    }, [canvasRef]);

    return (
        <div className="card-industrial p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Interactive Map
                </h3>
                <div className="flex items-center gap-2">
                    {editable && (
                        <>
                            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                                {(['waypoint', 'delivery', 'charging'] as NodeType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedNodeType(type)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${selectedNodeType === type
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <Button
                                size="sm"
                                variant={deleteMode ? 'destructive' : 'outline'}
                                onClick={() => setDeleteMode(!deleteMode)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                    <Button size="sm" variant="outline" onClick={resetView}>
                        <Maximize2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="relative">
                <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseDown={(e) => handleMouseDown(e.nativeEvent, e.button === 2)}
                    onMouseUp={handleMouseUp}
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-96 bg-muted rounded-lg cursor-crosshair border border-border"
                    style={{ cursor: deleteMode ? 'not-allowed' : canvasState.isDragging ? 'grabbing' : 'crosshair' }}
                />

                {/* Legend */}
                <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor('waypoint') }} />
                        <span>Waypoint</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor('delivery') }} />
                        <span>Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor('charging') }} />
                        <span>Charging</span>
                    </div>
                </div>

                {/* Instructions */}
                {editable && (
                    <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 text-xs text-muted-foreground max-w-xs">
                        {deleteMode ? (
                            <p>Click a node to delete it</p>
                        ) : selectedNodeForConnection ? (
                            <p>Click another node to create a connection</p>
                        ) : (
                            <p>Click to add nodes • Click two nodes to connect • Scroll to zoom • Drag to pan</p>
                        )}
                    </div>
                )}
            </div>

            {/* Node count */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{nodes.length} nodes, {connections.length} connections</span>
                <span className="font-mono">Zoom: {(canvasState.scale * 100).toFixed(0)}%</span>
            </div>
        </div>
    );
};

export default InteractiveMap;
