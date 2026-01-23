export interface Map {
    id: string;
    user_id: string;
    name: string;
    image_url: string;
    width: number;
    height: number;
    created_at: string;
    updated_at: string;
}

export interface MapNode {
    id: string;
    map_id: string;
    x: number;
    y: number;
    label: string;
    node_type: 'delivery' | 'waypoint' | 'charging';
    created_at: string;
}

export interface MapConnection {
    id: string;
    map_id: string;
    from_node_id: string;
    to_node_id: string;
    created_at: string;
}

export type NodeType = 'delivery' | 'waypoint' | 'charging';

export interface CanvasState {
    panOffset: { x: number; y: number };
    scale: number;
    isDragging: boolean;
    dragStart: { x: number; y: number } | null;
}

export interface MapWithNodes {
    map: Map;
    nodes: MapNode[];
    connections: MapConnection[];
}
