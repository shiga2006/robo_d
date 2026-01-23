import { Map as MapType } from '@/types/map';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MapSelectorProps {
    maps: MapType[];
    selectedMapId: string | null;
    onSelectMap: (mapId: string) => void;
    onDeleteMap: (mapId: string) => void;
    onNewMap: () => void;
}

const MapSelector = ({ maps, selectedMapId, onSelectMap, onDeleteMap, onNewMap }: MapSelectorProps) => {
    const selectedMap = maps.find((m) => m.id === selectedMapId);

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <Select value={selectedMapId || undefined} onValueChange={onSelectMap}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a map or upload new" />
                    </SelectTrigger>
                    <SelectContent>
                        {maps.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                                No maps yet. Upload one!
                            </div>
                        ) : (
                            maps.map((map) => (
                                <SelectItem key={map.id} value={map.id}>
                                    {map.name}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={onNewMap} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Upload Map
            </Button>

            {selectedMap && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Map?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{selectedMap.name}"? This will also delete all
                                nodes and connections. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteMap(selectedMap.id)} className="bg-destructive text-destructive-foreground">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
};

export default MapSelector;
