import { useRef, useState, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { ModelBlock } from './ModelBlock';
import { RelationshipLine } from './RelationshipLine';
import { RelationshipConnector } from './RelationshipConnector';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { currentProject, models, relationships, updateProject, createModel } = useProject();
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const groups = currentProject?.canvas_state?.groups || [];

  useEffect(() => {
    if (currentProject?.canvas_state?.viewport) {
      setViewport(currentProject.canvas_state.viewport);
    }
  }, [currentProject]);

  const saveViewport = (newViewport: typeof viewport) => {
    if (!currentProject) return;
    updateProject(currentProject.id, {
      canvas_state: {
        ...currentProject.canvas_state,
        viewport: newViewport,
      },
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * delta));
    const newViewport = { ...viewport, zoom: newZoom };
    setViewport(newViewport);
    saveViewport(newViewport);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const newViewport = {
        ...viewport,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      };
      setViewport(newViewport);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      saveViewport(viewport);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;

    const modelId = e.dataTransfer.getData('modelId');
    if (modelId) {
      const model = models.find(m => m.id === modelId);
      if (model) {
        await createModel({
          ...model,
          project_id: currentProject.id,
          canvas_position: { x, y },
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleZoomIn = () => {
    const newViewport = { ...viewport, zoom: Math.min(3, viewport.zoom * 1.2) };
    setViewport(newViewport);
    saveViewport(newViewport);
  };

  const handleZoomOut = () => {
    const newViewport = { ...viewport, zoom: Math.max(0.1, viewport.zoom / 1.2) };
    setViewport(newViewport);
    saveViewport(newViewport);
  };

  const handleResetView = () => {
    const newViewport = { x: 0, y: 0, zoom: 1 };
    setViewport(newViewport);
    saveViewport(newViewport);
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-slate-100">
      <div
        ref={canvasRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: '0 0',
          }}
          className="relative"
        >
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              width: '10000px',
              height: '10000px',
              left: '-5000px',
              top: '-5000px',
            }}
          >
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="rgb(203 213 225)"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect
              x="-5000"
              y="-5000"
              width="10000"
              height="10000"
              fill="url(#grid)"
            />
          </svg>

          {groups.map((group) => (
            <div
              key={group.id}
              className="absolute border-2 border-dashed rounded-lg pointer-events-none"
              style={{
                left: `${group.x}px`,
                top: `${group.y}px`,
                width: `${group.width}px`,
                height: `${group.height}px`,
                borderColor: group.color,
                backgroundColor: `${group.color}15`,
              }}
            >
              <div
                className="absolute -top-6 left-0 px-2 py-1 rounded text-sm font-medium"
                style={{ color: group.color }}
              >
                {group.label}
              </div>
            </div>
          ))}

          {relationships.map((rel) => (
            <RelationshipLine key={rel.id} relationship={rel} />
          ))}

          {models.map((model) => (
            <ModelBlock
              key={model.id}
              model={model}
              isSelected={selectedModel === model.id}
              onSelect={() => setSelectedModel(model.id)}
              isConnecting={isConnecting}
              onStartConnection={() => {
                setIsConnecting(true);
                setConnectionStart(model.id);
              }}
              onEndConnection={() => {
                setIsConnecting(false);
                setConnectionStart(null);
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2 border border-slate-200">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-slate-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-slate-700" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 hover:bg-slate-100 rounded transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg px-4 py-2 border border-slate-200">
        <div className="text-xs text-slate-600">
          Zoom: {Math.round(viewport.zoom * 100)}%
        </div>
      </div>

      <RelationshipConnector />
    </div>
  );
}
