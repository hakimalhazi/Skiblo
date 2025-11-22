import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType } from '../types';
import { COLORS } from '../constants';

interface GameCanvasProps {
  isDrawing: boolean;
  currentTool: ToolType;
  currentColor: string;
  brushSize: number;
  onChangeTool: (tool: ToolType) => void;
  onChangeColor: (color: string) => void;
  onChangeSize: (size: number) => void;
  onClear: () => void;
  onUndo: () => void; // Placeholder for real undo implementation
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isDrawing: canDraw,
  currentTool,
  currentColor,
  brushSize,
  onChangeTool,
  onChangeColor,
  onChangeSize,
  onClear,
  onUndo
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Resize canvas to fit container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Basic resize without keeping content (MVP)
        // In a real app, you'd save the imageData and put it back
        const canvas = canvasRef.current;
        if (canvas.width !== width || canvas.height !== height) {
           const imgData = canvas.getContext('2d')?.getImageData(0,0, canvas.width, canvas.height);
           canvas.width = width;
           canvas.height = height;
           if (imgData) canvas.getContext('2d')?.putImageData(imgData, 0, 0);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCoordinates = (event: MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ((event as TouchEvent).touches) {
      clientX = (event as TouchEvent).touches[0].clientX;
      clientY = (event as TouchEvent).touches[0].clientY;
    } else {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startPaint = useCallback((event: MouseEvent | TouchEvent) => {
    if (!canDraw) return;
    const coordinates = getCoordinates(event);
    if (coordinates) {
      setIsPainting(true);
      setLastPos(coordinates);
    }
  }, [canDraw]);

  const draw = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isPainting || !canDraw || !canvasRef.current) return;
    event.preventDefault(); // Prevent scrolling on touch

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const newPos = getCoordinates(event);
    
    ctx.beginPath();
    ctx.strokeStyle = currentTool === ToolType.ERASER ? '#FFFFFF' : currentColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Add shadow for "Glow" effect if simulated (optional)
    // ctx.shadowBlur = 2;
    // ctx.shadowColor = currentColor;

    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.stroke();
    
    setLastPos(newPos);
  }, [isPainting, canDraw, currentTool, currentColor, brushSize, lastPos]);

  const endPaint = useCallback(() => {
    setIsPainting(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => startPaint(e);
    const handleMouseMove = (e: MouseEvent) => draw(e);
    const handleMouseUp = () => endPaint();
    const handleTouchStart = (e: TouchEvent) => startPaint(e);
    const handleTouchMove = (e: TouchEvent) => draw(e);
    const handleTouchEnd = () => endPaint();

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startPaint, draw, endPaint]);

  // Toolbar Component
  const Toolbar = () => (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-3 flex flex-col gap-4 items-center border border-slate-100 max-w-[95vw]">
      {/* Tools */}
      <div className="flex gap-2 overflow-x-auto w-full justify-center pb-2 scrollbar-hide">
        <ToolButton tool={ToolType.BRUSH} icon="🖌️" active={currentTool === ToolType.BRUSH} onClick={() => onChangeTool(ToolType.BRUSH)} />
        <ToolButton tool={ToolType.ERASER} icon="🧼" active={currentTool === ToolType.ERASER} onClick={() => onChangeTool(ToolType.ERASER)} />
        <div className="w-px bg-slate-200 mx-2 h-8 self-center"></div>
        <button onClick={onUndo} className="p-2 hover:bg-slate-100 rounded-lg text-lg" title="Undo">↩️</button>
        <button onClick={onClear} className="p-2 hover:bg-red-50 text-red-500 rounded-lg text-lg" title="Clear">🗑️</button>
      </div>

      {/* Colors & Size */}
      <div className="flex flex-wrap gap-4 items-center justify-center border-t border-slate-100 pt-3 w-full">
        <div className="flex gap-1.5 flex-wrap justify-center max-w-[300px]">
          {COLORS.map(c => (
             <button
               key={c}
               onClick={() => onChangeColor(c)}
               className={`w-6 h-6 rounded-full border-2 ${currentColor === c ? 'border-slate-600 scale-110' : 'border-transparent hover:scale-110'}`}
               style={{ backgroundColor: c }}
             />
          ))}
        </div>
        <input 
          type="range" 
          min="2" 
          max="40" 
          value={brushSize} 
          onChange={(e) => onChangeSize(parseInt(e.target.value))}
          className="w-24 accent-primary cursor-pointer"
        />
      </div>
    </div>
  );

  const ToolButton = ({ tool, icon, active, onClick }: { tool: ToolType, icon: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-all ${active ? 'bg-primary text-white shadow-md scale-105' : 'text-slate-600 hover:bg-slate-100'}`}
    >
      <span className="text-xl">{icon}</span>
    </button>
  );

  return (
    <div className="relative w-full h-full bg-white rounded-3xl overflow-hidden shadow-inner" ref={containerRef}>
      {!canDraw && (
        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm">
           👀 Kijken
        </div>
      )}
      <canvas ref={canvasRef} className="touch-none cursor-crosshair" />
      {canDraw && <Toolbar />}
    </div>
  );
};
