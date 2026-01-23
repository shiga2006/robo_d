import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateImageFile, compressImage } from '@/lib/mapUtils';
import { toast } from 'sonner';

interface MapUploadProps {
    onUpload: (file: File, name: string, width: number, height: number) => Promise<void>;
    isUploading: boolean;
}

const MapUpload = ({ onUpload, isUploading }: MapUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mapName, setMapName] = useState('');
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        const validation = validateImageFile(file);
        if (!validation.valid) {
            toast.error(validation.error);
            return;
        }

        setSelectedFile(file);
        setMapName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            setPreviewUrl(url);

            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height });
            };
            img.src = url;
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleUpload = async () => {
        if (!selectedFile || !mapName || !imageDimensions) {
            toast.error('Please select a file and provide a name');
            return;
        }

        try {
            // Compress image before upload
            const compressed = await compressImage(selectedFile);
            const compressedFile = new File([compressed], selectedFile.name, { type: 'image/jpeg' });

            await onUpload(compressedFile, mapName, imageDimensions.width, imageDimensions.height);

            // Reset form
            setSelectedFile(null);
            setPreviewUrl(null);
            setMapName('');
            setImageDimensions(null);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload map');
        }
    };

    return (
        <div className="card-industrial p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Upload Floor Plan</h3>

            {!previewUrl ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-colors"
                >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop your floor plan here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                        Supports: PNG, JPG (max 10MB)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="relative border border-border rounded-lg overflow-hidden">
                        <img
                            src={previewUrl}
                            alt="Map preview"
                            className="w-full h-48 object-contain bg-muted"
                        />
                        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-muted-foreground">
                            {imageDimensions?.width} × {imageDimensions?.height}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mapName">Map Name</Label>
                        <Input
                            id="mapName"
                            value={mapName}
                            onChange={(e) => setMapName(e.target.value)}
                            placeholder="e.g., Factory Floor 1, Warehouse A"
                            disabled={isUploading}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading || !mapName}
                            className="flex-1"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Upload Map
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl(null);
                                setMapName('');
                                setImageDimensions(null);
                            }}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapUpload;
