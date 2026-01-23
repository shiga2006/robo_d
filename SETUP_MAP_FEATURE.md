# Interactive Map Feature - Setup Instructions

## Prerequisites
Before using the interactive map feature, you need to set up the Supabase database tables and storage bucket.

## Step 1: Run Database Migration

The database schema is defined in `supabase/migrations/20260123_create_maps_tables.sql`. You need to run this migration in your Supabase dashboard.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/ywhbqhigcwxrocxlysqc
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/20260123_create_maps_tables.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

This will create:
- `maps` table
- `map_nodes` table  
- `map_connections` table
- Row Level Security (RLS) policies for all tables
- Indexes for better performance

## Step 2: Create Storage Bucket

You need to manually create a storage bucket for map images in Supabase.

### Create Bucket

1. In Supabase dashboard, navigate to **Storage** in the left sidebar
2. Click **New bucket**
3. Configure the bucket:
   - **Name**: `map-images`
   - **Public bucket**: ✅ Yes (check this box)
   - **File size limit**: 10 MB (optional)
   - **Allowed MIME types**: `image/jpeg, image/jpg, image/png`
4. Click **Create bucket**

### Set Storage Policies

After creating the bucket, you need to add policies:

1. Click on the `map-images` bucket
2. Go to the **Policies** tab
3. Click **New Policy** and add the following policies one by one:

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Public can view map images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'map-images');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload map images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'map-images' AND auth.role() = 'authenticated');
```

**Policy 3: Owner Update**
```sql
CREATE POLICY "Users can update their own map images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'map-images' AND auth.uid()::text = owner);
```

**Policy 4: Owner Delete**
```sql
CREATE POLICY "Users can delete their own map images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'map-images' AND auth.uid()::text = owner);
```

## Step 3: (Optional) Enable Authentication

The current implementation uses a demo user ID (`demo-user-123`). For production use:

1. Enable authentication in Supabase
2. Update `src/pages/Index.tsx`:

```tsx
// Replace this line:
const [userId] = useState<string>('demo-user-123');

// With actual auth:
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id || null;
```

## Step 4: Start Development Server

Run the development server:

```bash
npm run dev
```

The app should now be running at http://localhost:5173

## Usage

### Upload a Map

1. Click the **"Upload Map"** button in the  dashboard
2. Drag and drop a floor plan image (PNG or JPG)
3. Enter a name for the map
4. Click **"Upload Map"**

### Add Nodes

1. Select a node type (Waypoint, Delivery, or Charging) from the toolbar
2. Click anywhere on the map to add a node
3. Nodes will be automatically labeled (W1, W2, D1, D2, etc.)

### Connect Nodes

1. Click on a node to select it
2. Click on another node to create a connection
3. An arrow will be drawn between the nodes

### Delete Nodes/Connections

1. Click the trash icon (🗑️) in the toolbar to enable delete mode
2. Click on a node to delete it (this will also delete all its connections)
3. To delete individual connections, you'll need to manually remove them from the database or add a UI for it

### Pan and Zoom

- **Zoom**: Scroll with mouse wheel
- **Pan**: Hold Ctrl/Cmd and drag, or use middle mouse button

### Manage Maps

- **Switch maps**: Use the dropdown to select different maps
- **Delete map**: Click the delete icon next to the map selector

## Troubleshooting

### "Failed to load maps" error
- Check that you've run the database migration
- Verify RLS policies are set up correctly
- Check browser console for detailed error messages

### "Failed to upload image" error
- Ensure the `map-images` storage bucket exists
- Verify storage policies are configured
- Check that the image is under 10MB and is PNG/JPG format

### Maps not persisting
- Check that the Supabase connection is working
- Verify you're using the correct user ID
- Check browser network tab for failed requests

## Example Maps

You can use any floor plan or factory layout image. Good sources:
- Factory floor plans from architectural sites
- Warehouse layouts
- Indoor mall maps
- Office building floor plans

For testing, you can use simple diagrams created in tools like:
- Draw.io
- PowerPoint
- Google Drawings
- Any image editor

The system will automatically compress images to optimize storage.
