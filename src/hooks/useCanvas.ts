import { useState, useCallback, useRef, useEffect } from 'react';
import { CanvasState } from '@/types/map';

export const useCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvasState, setCanvasState] = useState<CanvasState>({
        panOffset: { x: 0, y: 0 },
        scale: 1,
        isDragging: false,
        dragStart: null,
    });

    // Handle mouse wheel for zoom
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setCanvasState((prev) => {
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.min(Math.max(prev.scale * delta, 0.5), 5);

            // Zoom towards mouse position
            const scaleRatio = newScale / prev.scale;
            const newPanX = mouseX - (mouseX - prev.panOffset.x) * scaleRatio;
            const newPanY = mouseY - (mouseY - prev.panOffset.y) * scaleRatio;

            return {
                ...prev,
                scale: newScale,
                panOffset: { x: newPanX, y: newPanY },
            };
        });
    }, []);

    // Handle mouse down for panning
    const handleMouseDown = useCallback((e: MouseEvent, isRightClick: boolean = false) => {
        if (isRightClick || e.button === 1 || e.ctrlKey || e.metaKey) { // Right click or middle mouse or ctrl+click
            e.preventDefault();
            setCanvasState((prev) => ({
                ...prev,
                isDragging: true,
                dragStart: { x: e.clientX, y: e.clientY },
            }));
        }
    }, []);

    // Handle mouse move for panning
    const handleMouseMove = useCallback((e: MouseEvent) => {
        setCanvasState((prev) => {
            if (!prev.isDragging || !prev.dragStart) return prev;

            const dx = e.clientX - prev.dragStart.x;
            const dy = e.clientY - prev.dragStart.y;

            return {
                ...prev,
                panOffset: {
                    x: prev.panOffset.x + dx,
                    y: prev.panOffset.y + dy,
                },
                dragStart: { x: e.clientX, y: e.clientY },
            };
        });
    }, []);

    // Handle mouse up
    const handleMouseUp = useCallback(() => {
        setCanvasState((prev) => ({
            ...prev,
            isDragging: false,
            dragStart: null,
        }));
    }, []);

    // Get canvas context
    const getContext = useCallback((): CanvasRenderingContext2D | null => {
        return canvasRef.current?.getContext('2d') || null;
    }, []);

    // Reset canvas view
    const resetView = useCallback(() => {
        setCanvasState({
            panOffset: { x: 0, y: 0 },
            scale: 1,
            isDragging: false,
            dragStart: null,
        });
    }, []);

    // Fit canvas to image
    const fitToImage = useCallback((imageWidth: number, imageHeight: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvasRect.width / imageWidth;
        const scaleY = canvasRect.height / imageHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9;

        const offsetX = (canvasRect.width - imageWidth * scale) / 2;
        const offsetY = (canvasRect.height - imageHeight * scale) / 2;

        setCanvasState({
            panOffset: { x: offsetX, y: offsetY },
            scale,
            isDragging: false,
            dragStart: null,
        });
    }, []);

    return {
        canvasRef,
        canvasState,
        handleWheel,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        getContext,
        resetView,
        fitToImage,
    };
};
