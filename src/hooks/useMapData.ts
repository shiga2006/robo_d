import { useState, useCallback, useEffect } from 'react';
import { Map, MapNode, MapConnection } from '@/types/map';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'http://127.0.0.1:5000/api';

export const useMapData = (userId: string | null) => {
    const { token } = useAuth();
    const [maps, setMaps] = useState<Map[]>([]);
    const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
    const [nodes, setNodes] = useState<MapNode[]>([]);
    const [connections, setConnections] = useState<MapConnection[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getHeaders = (isMultipart = false) => {
        const headers: any = {};
        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    // Helper to map MongoDB _id to id and normalize fields
    const normalizeMap = (m: any): Map => {
        const id = m._id || m.id;
        return {
            ...m,
            id: id,
            _id: id,
            user_id: m.userId || m.user_id,
            image_url: m.imageUrl || m.image_url,
            created_at: m.createdAt || m.created_at
        };
    };

    const normalizeNode = (n: any): MapNode => {
        const id = n._id || n.id;
        return {
            ...n,
            id: id,
            _id: id,
            map_id: n.mapId || n.map_id,
            node_type: n.type || n.node_type,
            created_at: n.createdAt || n.created_at
        };
    };

    const normalizeConnection = (c: any): MapConnection => {
        const id = c._id || c.id;
        return {
            ...c,
            id: id,
            _id: id,
            map_id: c.mapId || c.map_id,
            from_node_id: c.fromNodeId || c.from_node_id,
            to_node_id: c.toNodeId || c.to_node_id,
            created_at: c.createdAt || c.created_at
        };
    };

    // Fetch all maps
    const fetchMaps = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = userId ? `${API_URL}/maps?userId=${userId}` : `${API_URL}/maps`;
            const response = await fetch(url, {
                headers: getHeaders()
            });
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
            // toast.error('Failed to load maps (Is the local server running?)');
        } finally {
            setIsLoading(false);
        }
    }, [userId, selectedMapId, token]);

    // Fetch data for selected map
    const fetchMapData = useCallback(async (mapId: string) => {
        setIsLoading(true);
        try {
            const headers = getHeaders();
            // Fetch nodes
            const nodesRes = await fetch(`${API_URL}/maps/${mapId}/nodes`, { headers });
            if (!nodesRes.ok) throw new Error('Failed to fetch nodes');
            const nodesData = await nodesRes.json();
            setNodes(nodesData.map(normalizeNode));

            // Fetch connections
            const connRes = await fetch(`${API_URL}/maps/${mapId}/connections`, { headers });
            if (!connRes.ok) throw new Error('Failed to fetch connections');
            const connData = await connRes.json();
            setConnections(connData.map(normalizeConnection));

        } catch (error) {
            console.error('Error fetching map data:', error);
            toast.error('Failed to load map data');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // Create a new map
    const createMap = useCallback(async (name: string, file: File, width: number, height: number) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('name', name);
            formData.append('width', String(width));
            formData.append('height', String(height));
            formData.append('userId', userId || 'demo-user-123');

            const response = await fetch(`${API_URL}/maps`, {
                method: 'POST',
                headers: getHeaders(true),
                body: formData
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Upload failed');
            }

            const data = await response.json();
            const normalized = normalizeMap(data);

            setMaps((prev) => [normalized, ...prev]);
            setSelectedMapId(normalized.id);
            toast.success('Map uploaded successfully');
            return normalized;
        } catch (error: any) {
            console.error('Error creating map:', error);
            toast.error(error.message || 'Failed to create map');
            return null;
        } finally {
            setIsLoading(false);
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

    // Initial fetch
    useEffect(() => {
        fetchMaps();
    }, [fetchMaps]);

    // Fetch data when map is selected
    useEffect(() => {
        if (selectedMapId) {
            fetchMapData(selectedMapId);
        }
    }, [selectedMapId, fetchMapData]);

    return {
        maps,
        selectedMapId,
        setSelectedMapId,
        nodes,
        connections,
        isLoading,
        createMap,
        deleteMap,
        createNode,
        updateNode,
        deleteNode,
        createConnection,
        deleteConnection,
        refreshMaps: fetchMaps,
    };
};
