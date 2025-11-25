import { Rnd } from 'react-rnd';
import EditableText from './EditableText';
import { useSelectedElement } from '../../../contexts/SelectedElementContext';
import { Move } from 'lucide-react';

interface DraggableTextProps {
    id: string;
    initialValue: string;
    onSave: (value: string) => void;
    onPositionChange?: (x: number, y: number) => void;
    onSizeChange?: (width: number, height: number) => void;
    tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    multiline?: boolean;
    disabled?: boolean;
    // Position and size
    x?: number;
    y?: number;
    width?: number | string;
    height?: number | string;
    // Drag mode
    dragEnabled?: boolean;
    sectionId?: string;
}

export default function DraggableText({
    id,
    initialValue,
    onSave,
    onPositionChange,
    onSizeChange,
    tagName = 'div',
    className = '',
    style = {},
    placeholder = 'Type here...',
    multiline = false,
    disabled = false,
    x = 0,
    y = 0,
    width = 'auto',
    height = 'auto',
    dragEnabled = false,
    sectionId,
    ...props
}: DraggableTextProps & React.HTMLAttributes<HTMLElement>) {
    const { selectedElement } = useSelectedElement();
    const isSelected = selectedElement?.elementId === id;

    // If drag mode is disabled, render normal EditableText
    if (!dragEnabled) {
        return (
            <EditableText
                initialValue={initialValue}
                onSave={onSave}
                tagName={tagName}
                className={className}
                style={style}
                placeholder={placeholder}
                multiline={multiline}
                disabled={disabled}
                data-element-id={id}
                data-section-id={sectionId}
                {...props}
            />
        );
    }

    // Drag mode enabled - use Rnd with corner move handle
    return (
        <Rnd
            position={{ x, y }}
            size={{
                width: width === 'auto' ? 'auto' : width,
                height: height === 'auto' ? 'auto' : height
            }}
            onDragStop={(_e, d) => {
                onPositionChange?.(d.x, d.y);
            }}
            onResizeStop={(_e, _direction, ref, _delta, position) => {
                const newWidth = ref.offsetWidth;
                const newHeight = ref.offsetHeight;
                onSizeChange?.(newWidth, newHeight);
                onPositionChange?.(position.x, position.y);
            }}
            bounds="parent"
            enableResizing={isSelected}
            disableDragging={disabled}
            dragHandleClassName="move-handle"
            className={`group ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-blue-300/50'}`}
            style={{
                zIndex: isSelected ? 50 : 10,
            }}
            dragGrid={[5, 5]}
            resizeGrid={[5, 5]}
        >
            {/* Editable Content */}
            <div className="h-full w-full bg-white/5 backdrop-blur-sm rounded p-3 relative">
                <EditableText
                    initialValue={initialValue}
                    onSave={onSave}
                    tagName={tagName}
                    className={className}
                    style={style}
                    placeholder={placeholder}
                    multiline={multiline}
                    disabled={disabled}
                    data-element-id={id}
                    data-section-id={sectionId}
                    {...props}
                />

                {/* Move Handle - Four-point arrow in top-left corner (only when selected) */}
                {isSelected && (
                    <div
                        className="move-handle absolute -top-3 -left-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-move shadow-lg hover:bg-blue-600 transition-colors z-50"
                        title="Click and drag to move"
                    >
                        <Move className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>

            {/* Resize handles (corners) - only when selected */}
            {isSelected && (
                <>
                    {/* Top-right resize handle */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow" />
                    {/* Bottom-left resize handle */}
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow" />
                    {/* Bottom-right resize handle */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow" />
                </>
            )}
        </Rnd>
    );
}
