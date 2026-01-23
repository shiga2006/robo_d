-- Create maps table
CREATE TABLE IF NOT EXISTS public.maps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create map_nodes table
CREATE TABLE IF NOT EXISTS public.map_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    map_id UUID NOT NULL REFERENCES public.maps(id) ON DELETE CASCADE,
    x REAL NOT NULL,
    y REAL NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    node_type TEXT NOT NULL CHECK (node_type IN ('delivery', 'waypoint', 'charging')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create map_connections table
CREATE TABLE IF NOT EXISTS public.map_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    map_id UUID NOT NULL REFERENCES public.maps(id) ON DELETE CASCADE,
    from_node_id UUID NOT NULL REFERENCES public.map_nodes(id) ON DELETE CASCADE,
    to_node_id UUID NOT NULL REFERENCES public.map_nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(from_node_id, to_node_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS maps_user_id_idx ON public.maps(user_id);
CREATE INDEX IF NOT EXISTS map_nodes_map_id_idx ON public.map_nodes(map_id);
CREATE INDEX IF NOT EXISTS map_connections_map_id_idx ON public.map_connections(map_id);

-- Enable Row Level Security
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for maps table
CREATE POLICY "Users can view their own maps" ON public.maps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own maps" ON public.maps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own maps" ON public.maps
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maps" ON public.maps
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for map_nodes table
CREATE POLICY "Users can view nodes of their maps" ON public.map_nodes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = map_nodes.map_id AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert nodes to their maps" ON public.map_nodes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = map_nodes.map_id AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update nodes of their maps" ON public.map_nodes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = map_nodes.map_id AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete nodes of their maps" ON public.map_nodes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = map_nodes.map_id AND maps.user_id = auth.uid()
        )
    );

-- Create RLS policies for map_connections table
CREATE POLICY "Users can view connections of their maps" ON public.map_connections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = map_connections.map_id AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert connections to their maps" ON public.map_connections
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = map_connections.map_id AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update connections of their maps" ON public.map_connections
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = map_connections.map_id AND maps.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete connections of their maps" ON public.map_connections
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.maps
            WHERE maps.id = map_connections.map_id AND maps.user_id = auth.uid()
        )
    );

-- Create storage bucket for map images (this should be run in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('map-images', 'map-images', true);

-- Create storage policies (run after bucket creation)
-- CREATE POLICY "Public can view map images" ON storage.objects FOR SELECT USING (bucket_id = 'map-images');
-- CREATE POLICY "Authenticated users can upload map images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'map-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can update their own map images" ON storage.objects FOR UPDATE USING (bucket_id = 'map-images' AND auth.uid()::text = owner);
-- CREATE POLICY "Users can delete their own map images" ON storage.objects FOR DELETE USING (bucket_id = 'map-images' AND auth.uid()::text = owner);
