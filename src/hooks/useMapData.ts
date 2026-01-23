import { useState, useCallback, useEffect } from 'react';
import { Map, MapNode, MapConnection } from '@/types/map';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

export const useMapData = (userId: string | null) => {
    const [maps, setMaps] = useState<Map[]>([]);
    const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
    const [nodes, setNodes] = useState<MapNode[]>([]);
    const [connections, setConnections] = useState<MapConnection[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Helper to map MongoDB _id to id and normalize fields
    const normalizeMap = (m: any): Map => ({
        ...m,
        id: m._id,
        user_id: m.userId,
        image_url: m.imageUrl,
        created_at: m.createdAt
    });

    const normalizeNode = (n: any): MapNode => ({
        ...n,
        id: n._id,
        map_id: n.mapId,
        node_type: n.type,
        created_at: n.createdAt
    });

    const normalizeConnection = (c: any): MapConnection => ({
        ...c,
        id: c._id,
        map_id: c.mapId,
        from_node_id: c.fromNodeId,
        to_node_id: c.toNodeId,
        created_at: c.createdAt
    });

    // Fetch all maps
    const fetchMaps = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/maps`);
            if (!response.ok) throw new Error('Failed to fetch maps');

            const data = await response.json();
            const normalizedMaps = data.map(normalizeMap);
            setMaps(normalizedMaps);

            // Auto-select first map if none selected
            if (normalizedMaps.length > 0 && !selectedMapId) {
                setSelectedMapId(normalizedMaps[0].id);
            }
        } catch (error) {
            console.error('Error fetching maps:', error);
            toast.error('Failed to load maps (Is the local server running?)');
        } finally {
            setIsLoading(false);
        }
    }, [selectedMapId]);

    // Fetch data for selected map
    const fetchMapData = useCallback(async (mapId: string) => {
        setIsLoading(true);
        try {
            // Fetch nodes
            const nodesRes = await fetch(`${API_URL}/maps/${mapId}/nodes`);
            if (!nodesRes.ok) throw new Error('Failed to fetch nodes');
            const nodesData = await nodesRes.json();
            setNodes(nodesData.map(normalizeNode));

            // Fetch connections
            const connRes = await fetch(`${API_URL}/maps/${mapId}/connections`);
            if (!connRes.ok) throw new Error('Failed to fetch connections');
            const connData = await connRes.json();
            setConnections(connData.map(normalizeConnection));

        } catch (error) {
            console.error('Error fetching map data:', error);
            toast.error('Failed to load map data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create a new map
    const createMap = useCallback(async (name: string, imageUrl: string, width: number, height: number, imageFile?: File) => {
        try {
            // Note: imageUrl coming from MapUpload might be a local preview URL.
            // We need to support file upload properly here if imageFile is provided.
            // However, the uploadMapImage function handles the file upload separate from this creation in the original flow?
            // Actually in the new flow, we should probably upload and create in one step or similar.
            // But let's stick to the existing pattern: upload first, then create, OR modify to upload here.

            // Wait, looking at the backend, POST /api/maps expects 'image' file in formData.
            // So we should repurpose this or the uploadMapImage.
            // Let's rely on uploadMapImage to do nothing or change the flow?

            // Actually, the MapUpload component logic was: 
            // 1. User selects file -> uploadMapImage -> returns publicUrl
            // 2. User clicks "Save/Upload" -> createMap(name, publicUrl...)

            // We need to change this flow slightly because the backend POST /api/maps does BOTH upload and create.
            // OR we can keep two steps if we add a separate upload endpoint.
            // But our backend POST /api/maps takes the file AND metadata.

            // To minimize frontend component changes, I'll temporarily break the "clean" separation.
            // But wait, `MapUpload.tsx` calls `onUpload` which calls `handleMapUpload` in Index.tsx.
            // `handleMapUpload` calls `createMap` with the image URL? No, checking Index.tsx...
            // It calls `uploadMapImage` then `createMap`.

            // Let's support the legacy signature but ignore the imageUrl string if we can,
            // or better, update the backend to support simpler flow if needed.
            // But actually, for MERN, standard is multipart/form-data with everything.

            // I will implement a SEPARATE upload function if needed, but the current backend merges them.
            // Let's look at `index.js` I wrote.
            // `app.post('/api/maps', upload.single('image'), ...)`
            // It expects `name`, `width`, `height` in body and `image` in file.

            // So calling `createMap` needs the File object.
            // I need to update the hook signature to accept `File`.
            // But `Index.tsx` passes `imageUrl` string (from `uploadMapImage`).

            // Hacky Fix for smooth migration:
            // 1. `uploadMapImage` will now be a dummy that just returns the File object (or a fake URL representing it) to the component?
            // No, `MapUpload` displays the preview.

            // Let's just modify `createMap` to take the File. 
            // I'll need to update `Index.tsx` to pass the file to `createMap`.

            throw new Error("Update: createMap now requires a File object in the new MERN setup.");

        } catch (error) {
            // ...
        }
    }, []);

    // RE-WRITING createMap to be correct for MERN
    const createMapMern = useCallback(async (name: string, file: File, width: number, height: number) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('name', name);
            formData.append('width', String(width));
            formData.append('height', String(height));
            formData.append('userId', userId || 'demo-user-123');

            const response = await fetch(`${API_URL}/maps`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            const normalized = normalizeMap(data);

            setMaps((prev) => [normalized, ...prev]);
            setSelectedMapId(normalized.id);
            toast.success('Map uploaded successfully');
            return normalized;
        } catch (error) {
            console.error('Error creating map:', error);
            toast.error('Failed to create map');
            return null;
        }
    }, [userId]);


    const deleteMap = useCallback(async (mapId: string) => {
        try {
            const response = await fetch(`${API_URL}/maps/${mapId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Delete failed');

            setMaps((prev) => prev.filter((m) => m.id !== mapId));
            if (selectedMapId === mapId) {
                const remaining = maps.filter((m) => m.id !== mapId);
                setSelectedMapId(remaining.length > 0 ? remaining[0].id : null);
            }
            toast.success('Map deleted');
        } catch (error) {
            console.error('Error deleting map:', error);
            toast.error('Failed to delete map');
        }
    }, [maps, selectedMapId]);

    const createNode = useCallback(async (mapId: string, x: number, y: number, label: string, nodeType: string) => {
        try {
            const response = await fetch(`${API_URL}/nodes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mapId, x, y, label, type: nodeType
                })
            });
            if (!response.ok) throw new Error('Failed to create node');

            const data = await response.json();
            const normalized = normalizeNode(data);
            setNodes((prev) => [...prev, normalized]);
            return normalized;
        } catch (error) {
            console.error('Error creating node:', error);
            toast.error('Failed to create node');
            return null;
        }
    }, []);

    const updateNode = useCallback(async (nodeId: string, updates: any) => {
        try {
            // Map frontend fields to backend fields if necessary
            // Frontend 'node_type' -> Backend 'type'
            const backendUpdates = { ...updates };
            if (updates.node_type) {
                backendUpdates.type = updates.node_type;
                delete backendUpdates.node_type;
            }

            const response = await fetch(`${API_URL}/nodes/${nodeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendUpdates)
            });
            if (!response.ok) throw new Error('Failed to update node');

            const data = await response.json();
            const normalized = normalizeNode(data);
            setNodes((prev) => prev.map((n) => (n.id === nodeId ? normalized : n)));
            return normalized;
        } catch (error) {
            console.error('Error updating node:', error);
            toast.error('Failed to update node');
            return null;
        }
    }, []);

    const deleteNode = useCallback(async (nodeId: string) => {
        try {
            const response = await fetch(`${API_URL}/nodes/${nodeId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete node');

            setNodes((prev) => prev.filter((n) => n.id !== nodeId));
            setConnections((prev) =>
                prev.filter((c) => c.from_node_id !== nodeId && c.to_node_id !== nodeId)
            );
        } catch (error) {
            console.error('Error deleting node:', error);
            toast.error('Failed to delete node');
        }
    }, []);

    const createConnection = useCallback(async (mapId: string, fromNodeId: string, toNodeId: string) => {
        try {
            const response = await fetch(`${API_URL}/connections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mapId, fromNodeId, toNodeId })
            });

            if (!response.ok) {
                const err = await response.json();
                if (err.error === 'Connection already exists') {
                    toast.error('Connection already exists');
                    return null;
                }
                throw new Error('Failed to create connection');
            }

            const data = await response.json();
            const normalized = normalizeConnection(data);
            setConnections((prev) => [...prev, normalized]);
            return normalized;
        } catch (error) {
            console.error('Error creating connection:', error);
            toast.error('Failed to create connection');
            return null;
        }
    }, []);

    const deleteConnection = useCallback(async (connectionId: string) => {
        try {
            const response = await fetch(`${API_URL}/connections/${connectionId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete connection');

            setConnections((prev) => prev.filter((c) => c.id !== connectionId));
        } catch (error) {
            console.error('Error deleting connection:', error);
            toast.error('Failed to delete connection');
        }
    }, []);

    // Placeholder to satisfy interface but we'll use createMapMern for real work
    const uploadMapImage = useCallback(async (file: File): Promise<string | null> => {
        // In MERN flow, we upload during creation. 
        // We'll return a fake URL or null here, and handle the file in the component.
        // Or better: we return the FILE itself (casemode hack) or just success.
        return "ready-to-upload";
    }, []);

    return {
        maps,
        selectedMapId,
        setSelectedMapId,
        nodes,
        connections,
        isLoading,
        createMap: createMapMern, // Swap implementation
        deleteMap,
        createNode,
        updateNode,
        deleteNode,
        createConnection,
        deleteConnection,
        uploadMapImage,
        refreshMaps: fetchMaps,
    };
};
