import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSectionWrapperProps {
  id: string;
  children: (props: { dragHandleProps: any }) => React.ReactNode;
}

export function SortableSectionWrapper({ id, children }: SortableSectionWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 50 : 'auto',
    position: 'relative',
    scale: isDragging ? '0.98' : '1',
    boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
    borderRadius: isDragging ? '1rem' : '0',
    overflow: 'hidden',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ dragHandleProps: listeners })}
    </div>
  );
}
