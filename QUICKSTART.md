# Quick Start Guide - Interactive Map Feature

## Setup Steps (5 minutes)

### Step 1: Create Supabase Tables

1. Go to: **https://supabase.com/dashboard/project/ywhbqhigcwxrocxlysqc/sql/new**
2. Copy the entire SQL from the file below and paste it into the SQL editor
3. Click **RUN** to execute

**SQL Location**: `supabase/migrations/20260123_create_maps_tables.sql`

### Step 2: Create Storage Bucket

1. Go to: **https://supabase.com/dashboard/project/ywhbqhigcwxrocxlysqc/storage/buckets**
2. Click **New bucket**
3. Settings:
   - Name: `map-images`
   - Public: ✅ YES (check this!)
   - Click **Create**

### Step 3: Add Storage Policies

1. Click on the `map-images` bucket you just created
2. Go to **Policies** tab
3. Click **New policy** → **For full customization** → Use the SQL editor
4. Paste and run each policy below:

```sql
-- Policy 1
CREATE POLICY "Public can view map images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'map-images');

-- Policy 2  
CREATE POLICY "Authenticated users can upload map images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'map-images' AND auth.role() = 'authenticated');

-- Policy 3
CREATE POLICY "Users can update their own map images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'map-images' AND auth.uid()::text = owner);

-- Policy 4
CREATE POLICY "Users can delete their own map images"
ON storage.objects FOR DELETE
USING (bucket_id = 'map-images' AND auth.uid()::text = owner);
```

### Step 4: Start Dev Server

Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd C:\Users\livin\bot-beacon-central
npm run dev
```

Then open: **http://localhost:5173**

## Testing the Feature

1. **Upload a Map**: Click "Upload Map" button → Drop an image → Enter name → Upload
2. **Add Nodes**: Select node type (Waypoint/Delivery/Charging) → Click on map
3. **Connect Nodes**: Click one node → Click another node → See connection
4. **Pan/Zoom**: Scroll to zoom, Ctrl+drag to pan
5. **Delete**: Click trash icon → Click node to delete

## Troubleshooting

**Can't run npm?**
- Run PowerShell as Administrator
- Run: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

**Tables not created?**
- Check you ran the ENTIRE SQL migration file
- Verify in Supabase dashboard: Tables → See `maps`, `map_nodes`, `map_connections`

**Upload fails?**
- Ensure storage bucket `map-images` is PUBLIC
- Verify storage policies are created

## Demo User

The app currently uses demo user ID: `demo-user-123`
For production, implement proper authentication in `src/pages/Index.tsx`
