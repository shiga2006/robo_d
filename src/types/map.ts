export interface Map {
    _id?: string; // MongoDB ID
    id: string;   // Frontend ID (mapped from _id)
    user_id: string; // Kept for compatibility, though we might use userId in backend
    userId?: string; // Backend field name
    name: string;
    image_url: string; // Kept for compatibility
    imageUrl?: string; // Backend field name
    width: number;
    height: number;
    created_at?: string;
    createdAt?: string;
    updated_at?: string;
}

export interface MapNode {
    _id?: string;
    id: string;
    map_id: string;
    mapId?: string;
    x: number;
    y: number;
    label: string;
    node_type: 'delivery' | 'waypoint' | 'charging';
    type?: 'delivery' | 'waypoint' | 'charging'; // Backend field match
    created_at?: string;
}

export interface MapConnection {
    _id?: string;
    id: string;
    map_id: string;
    mapId?: string;
    from_node_id: string;
    fromNodeId?: string;
    to_node_id: string;
    toNodeId?: string;
    created_at?: string;
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
