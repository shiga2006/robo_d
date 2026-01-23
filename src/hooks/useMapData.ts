import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Map, MapNode, MapConnection } from '@/types/map';
import { toast } from 'sonner';

export const useMapData = (userId: string | null) => {
    const [maps, setMaps] = useState<Map[]>([]);
    const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
    const [nodes, setNodes] = useState<MapNode[]>([]);
    const [connections, setConnections] = useState<MapConnection[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch all maps for current user
    const fetchMaps = useCallback(async () => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('maps')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMaps(data || []);

            // Auto-select first map if none selected
            if (data && data.length > 0 && !selectedMapId) {
                setSelectedMapId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching maps:', error);
            toast.error('Failed to load maps');
        } finally {
            setIsLoading(false);
        }
    }, [userId, selectedMapId]);

    // Fetch nodes and connections for selected map
    const fetchMapData = useCallback(async (mapId: string) => {
        setIsLoading(true);
        try {
            // Fetch nodes
            const { data: nodesData, error: nodesError } = await supabase
                .from('map_nodes')
                .select('*')
                .eq('map_id', mapId);

            if (nodesError) throw nodesError;
            setNodes(nodesData || []);

            // Fetch connections
            const { data: connectionsData, error: connectionsError } = await supabase
                .from('map_connections')
                .select('*')
                .eq('map_id', mapId);

            if (connectionsError) throw connectionsError;
            setConnections(connectionsData || []);
        } catch (error) {
            console.error('Error fetching map data:', error);
            toast.error('Failed to load map data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create a new map
    const createMap = useCallback(async (name: string, imageUrl: string, width: number, height: number) => {
        if (!userId) return null;

        try {
            const { data, error } = await supabase
                .from('maps')
                .insert({
                    user_id: userId,
                    name,
                    image_url: imageUrl,
                    width,
                    height,
                })
                .select()
                .single();

            if (error) throw error;

            setMaps((prev) => [data, ...prev]);
            setSelectedMapId(data.id);
            toast.success('Map uploaded successfully');
            return data;
        } catch (error) {
            console.error('Error creating map:', error);
            toast.error('Failed to create map');
            return null;
        }
    }, [userId]);

    // Delete a map
    const deleteMap = useCallback(async (mapId: string) => {
        try {
            const { error } = await supabase
                .from('maps')
                .delete()
                .eq('id', mapId);

            if (error) throw error;

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

    // Create a node
    const createNode = useCallback(async (
        mapId: string,
        x: number,
        y: number,
        label: string,
        nodeType: 'delivery' | 'waypoint' | 'charging'
    ) => {
        try {
            const { data, error } = await supabase
                .from('map_nodes')
                .insert({
                    map_id: mapId,
                    x,
                    y,
                    label,
                    node_type: nodeType,
                })
                .select()
                .single();

            if (error) throw error;

            setNodes((prev) => [...prev, data]);
            return data;
        } catch (error) {
            console.error('Error creating node:', error);
            toast.error('Failed to create node');
            return null;
        }
    }, []);

    // Update a node
    const updateNode = useCallback(async (
        nodeId: string,
        updates: Partial<Pick<MapNode, 'x' | 'y' | 'label' | 'node_type'>>
    ) => {
        try {
            const { data, error } = await supabase
                .from('map_nodes')
                .update(updates)
                .eq('id', nodeId)
                .select()
                .single();

            if (error) throw error;

            setNodes((prev) => prev.map((n) => (n.id === nodeId ? data : n)));
            return data;
        } catch (error) {
            console.error('Error updating node:', error);
            toast.error('Failed to update node');
            return null;
        }
    }, []);

    // Delete a node
    const deleteNode = useCallback(async (nodeId: string) => {
        try {
            const { error } = await supabase
                .from('map_nodes')
                .delete()
                .eq('id', nodeId);

            if (error) throw error;

            setNodes((prev) => prev.filter((n) => n.id !== nodeId));
            // Connections will be deleted automatically due to CASCADE
            setConnections((prev) =>
                prev.filter((c) => c.from_node_id !== nodeId && c.to_node_id !== nodeId)
            );
        } catch (error) {
            console.error('Error deleting node:', error);
            toast.error('Failed to delete node');
        }
    }, []);

    // Create a connection
    const createConnection = useCallback(async (
        mapId: string,
        fromNodeId: string,
        toNodeId: string
    ) => {
        try {
            const { data, error } = await supabase
                .from('map_connections')
                .insert({
                    map_id: mapId,
                    from_node_id: fromNodeId,
                    to_node_id: toNodeId,
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    toast.error('Connection already exists');
                } else {
                    throw error;
                }
                return null;
            }

            setConnections((prev) => [...prev, data]);
            return data;
        } catch (error) {
            console.error('Error creating connection:', error);
            toast.error('Failed to create connection');
            return null;
        }
    }, []);

    // Delete a connection
    const deleteConnection = useCallback(async (connectionId: string) => {
        try {
            const { error } = await supabase
                .from('map_connections')
                .delete()
                .eq('id', connectionId);

            if (error) throw error;

            setConnections((prev) => prev.filter((c) => c.id !== connectionId));
        } catch (error) {
            console.error('Error deleting connection:', error);
            toast.error('Failed to delete connection');
        }
    }, []);

    // Upload map image to Supabase storage
    const uploadMapImage = useCallback(async (file: File): Promise<string | null> => {
        if (!userId) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        try {
            const { data, error } = await supabase.storage
                .from('map-images')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('map-images')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
            return null;
        }
    }, [userId]);

    // Load maps on mount
    useEffect(() => {
        fetchMaps();
    }, [fetchMaps]);

    // Load map data when selected map changes
    useEffect(() => {
        if (selectedMapId) {
            fetchMapData(selectedMapId);
        } else {
            setNodes([]);
            setConnections([]);
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
        uploadMapImage,
        refreshMaps: fetchMaps,
    };
};
