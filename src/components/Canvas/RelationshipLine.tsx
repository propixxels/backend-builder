import { useProject } from '../../contexts/ProjectContext';
import { Relationship } from '../../lib/types';

interface RelationshipLineProps {
  relationship: Relationship;
}

export function RelationshipLine({ relationship }: RelationshipLineProps) {
  const { models, updateRelationship, deleteRelationship } = useProject();

  const sourceModel = models.find(m => m.id === relationship.source_model_id);
  const targetModel = models.find(m => m.id === relationship.target_model_id);

  if (!sourceModel || !targetModel) return null;

  const startX = sourceModel.canvas_position.x + 120;
  const startY = sourceModel.canvas_position.y + 30;
  const endX = targetModel.canvas_position.x + 120;
  const endY = targetModel.canvas_position.y + 30;

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const handleClick = () => {
    const cardinals: Array<'1:1' | '1:M' | 'M:M'> = ['1:1', '1:M', 'M:M'];
    const currentIndex = cardinals.indexOf(relationship.cardinality);
    const nextIndex = (currentIndex + 1) % cardinals.length;
    updateRelationship(relationship.id, { cardinality: cardinals[nextIndex] });
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm('Delete this relationship?')) {
      deleteRelationship(relationship.id);
    }
  };

  return (
    <g className="pointer-events-auto">
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="rgb(71 85 105)"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />

      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="rgb(71 85 105)" />
        </marker>
      </defs>

      <foreignObject
        x={midX - 30}
        y={midY - 15}
        width="60"
        height="30"
        className="overflow-visible"
      >
        <div className="flex items-center justify-center">
          <button
            onClick={handleClick}
            onContextMenu={handleRightClick}
            className="bg-white px-3 py-1 rounded-full border-2 border-slate-600 text-sm font-semibold text-slate-900 hover:bg-slate-100 shadow-md transition-colors"
            title="Click to change, right-click to delete"
          >
            {relationship.cardinality}
          </button>
        </div>
      </foreignObject>
    </g>
  );
}
