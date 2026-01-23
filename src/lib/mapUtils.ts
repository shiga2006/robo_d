import { MapNode, MapConnection } from '@/types/map';

/**
 * Calculate Euclidean distance between two nodes
 */
export const calculateDistance = (node1: MapNode, node2: MapNode): number => {
    const dx = node2.x - node1.x;
    const dy = node2.y - node1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Convert screen coordinates to canvas coordinates accounting for pan and zoom
 */
export const screenToCanvas = (
    screenX: number,
    screenY: number,
    panOffset: { x: number; y: number },
    scale: number,
    canvasRect: DOMRect
): { x: number; y: number } => {
    const canvasX = (screenX - canvasRect.left - panOffset.x) / scale;
    const canvasY = (screenY - canvasRect.top - panOffset.y) / scale;
    return { x: canvasX, y: canvasY };
};

/**
 * Convert canvas coordinates to screen coordinates
 */
export const canvasToScreen = (
    canvasX: number,
    canvasY: number,
    panOffset: { x: number; y: number },
    scale: number
): { x: number; y: number } => {
    const screenX = canvasX * scale + panOffset.x;
    const screenY = canvasY * scale + panOffset.y;
    return { x: screenX, y: screenY };
};

/**
 * Check if a point is near a node (for click detection)
 */
export const isPointNearNode = (
    point: { x: number; y: number },
    node: MapNode,
    threshold: number = 15
): boolean => {
    const distance = Math.sqrt(
        Math.pow(point.x - node.x, 2) + Math.pow(point.y - node.y, 2)
    );
    return distance <= threshold;
};

/**
 * Find node at a given position
 */
export const findNodeAtPosition = (
    nodes: MapNode[],
    position: { x: number; y: number },
    threshold: number = 15
): MapNode | null => {
    // Reverse array to check top nodes first (last drawn)
    for (let i = nodes.length - 1; i >= 0; i--) {
        if (isPointNearNode(position, nodes[i], threshold)) {
            return nodes[i];
        }
    }
    return null;
};

/**
 * Check if a connection already exists between two nodes
 */
export const connectionExists = (
    connections: MapConnection[],
    nodeId1: string,
    nodeId2: string
): boolean => {
    return connections.some(
        (conn) =>
            (conn.from_node_id === nodeId1 && conn.to_node_id === nodeId2) ||
            (conn.from_node_id === nodeId2 && conn.to_node_id === nodeId1)
    );
};

/**
 * Get node color based on type
 */
export const getNodeColor = (nodeType: 'delivery' | 'waypoint' | 'charging'): string => {
    switch (nodeType) {
        case 'delivery':
            return '#10b981'; // green
        case 'charging':
            return '#f59e0b'; // amber
        case 'waypoint':
            return '#3b82f6'; // blue
        default:
            return '#6b7280'; // gray
    }
};

/**
 * Compress image file before upload
 */
export const compressImage = (file: File, maxWidth: number = 2048, maxHeight: number = 2048): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    0.85
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Please upload a JPG or PNG image' };
    }

    if (file.size > maxSize) {
        return { valid: false, error: 'Image size must be less than 10MB' };
    }

    return { valid: true };
};

/**
 * Dijkstra's algorithm for shortest path (for future use)
 */
export const findShortestPath = (
    nodes: MapNode[],
    connections: MapConnection[],
    startNodeId: string,
    endNodeId: string
): string[] | null => {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited = new Set<string>();

    // Initialize
    nodes.forEach((node) => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        unvisited.add(node.id);
    });
    distances[startNodeId] = 0;

    while (unvisited.size > 0) {
        // Find unvisited node with smallest distance
        let currentNodeId: string | null = null;
        let minDistance = Infinity;
        unvisited.forEach((nodeId) => {
            if (distances[nodeId] < minDistance) {
                minDistance = distances[nodeId];
                currentNodeId = nodeId;
            }
        });

        if (currentNodeId === null || distances[currentNodeId] === Infinity) break;

        if (currentNodeId === endNodeId) break;

        unvisited.delete(currentNodeId);

        // Update distances to neighbors
        const currentNode = nodes.find((n) => n.id === currentNodeId);
        if (!currentNode) continue;

        connections
            .filter((conn) => conn.from_node_id === currentNodeId || conn.to_node_id === currentNodeId)
            .forEach((conn) => {
                const neighborId =
                    conn.from_node_id === currentNodeId ? conn.to_node_id : conn.from_node_id;
                const neighbor = nodes.find((n) => n.id === neighborId);
                if (!neighbor || !unvisited.has(neighborId)) return;

                const distance = calculateDistance(currentNode, neighbor);
                const alt = distances[currentNodeId!] + distance;

                if (alt < distances[neighborId]) {
                    distances[neighborId] = alt;
                    previous[neighborId] = currentNodeId;
                }
            });
    }

    // Reconstruct path
    if (distances[endNodeId] === Infinity) return null;

    const path: string[] = [];
    let current: string | null = endNodeId;
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    return path;
};
