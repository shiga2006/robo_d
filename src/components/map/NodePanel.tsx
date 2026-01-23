import { useState } from 'react';
import { MapNode, NodeType } from '@/types/map';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getNodeColor } from '@/lib/mapUtils';
import { Trash2, Edit2, Check, X } from 'lucide-react';

interface NodePanelProps {
    nodes: MapNode[];
    onUpdateNode: (nodeId: string, updates: Partial<Pick<MapNode, 'label' | 'node_type'>>) => void;
    onDeleteNode: (nodeId: string) => void;
}

const NodePanel = ({ nodes, onUpdateNode, onDeleteNode }: NodePanelProps) => {
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState('');
    const [editType, setEditType] = useState<NodeType>('waypoint');
    const [filterType, setFilterType] = useState<NodeType | 'all'>('all');

    const filteredNodes = nodes.filter((node) =>
        filterType === 'all' ? true : node.node_type === filterType
    );

    const startEdit = (node: MapNode) => {
        setEditingNodeId(node.id);
        setEditLabel(node.label);
        setEditType(node.node_type);
    };

    const saveEdit = () => {
        if (editingNodeId) {
            onUpdateNode(editingNodeId, { label: editLabel, node_type: editType });
            setEditingNodeId(null);
        }
    };

    const cancelEdit = () => {
        setEditingNodeId(null);
    };

    return (
        <div className="card-industrial p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Nodes ({nodes.length})
                </h3>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as NodeType | 'all')}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="waypoint">Waypoint</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="charging">Charging</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredNodes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        {filterType === 'all' ? 'No nodes yet. Click on the map to add nodes.' : `No ${filterType} nodes.`}
                    </p>
                ) : (
                    filteredNodes.map((node) => (
                        <div
                            key={node.id}
                            className="border border-border rounded-lg p-3 space-y-2 hover:bg-muted/50 transition-colors"
                        >
                            {editingNodeId === node.id ? (
                                <>
                                    <div className="space-y-2">
                                        <div>
                                            <Label htmlFor={`label-${node.id}`} className="text-xs">
                                                Label
                                            </Label>
                                            <Input
                                                id={`label-${node.id}`}
                                                value={editLabel}
                                                onChange={(e) => setEditLabel(e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`type-${node.id}`} className="text-xs">
                                                Type
                                            </Label>
                                            <Select value={editType} onValueChange={(value) => setEditType(value as NodeType)}>
                                                <SelectTrigger className="h-8 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="waypoint">Waypoint</SelectItem>
                                                    <SelectItem value="delivery">Delivery</SelectItem>
                                                    <SelectItem value="charging">Charging</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="sm" onClick={saveEdit} className="flex-1 h-7 text-xs">
                                            <Check className="w-3 h-3 mr-1" />
                                            Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1 h-7 text-xs">
                                            <X className="w-3 h-3 mr-1" />
                                            Cancel
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: getNodeColor(node.node_type) }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm truncate">{node.label || 'Unnamed'}</div>
                                            <div className="text-xs text-muted-foreground capitalize">{node.node_type}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => startEdit(node)}
                                            className="flex-1 h-7 text-xs"
                                        >
                                            <Edit2 className="w-3 h-3 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onDeleteNode(node.id)}
                                            className="h-7 text-xs"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NodePanel;
