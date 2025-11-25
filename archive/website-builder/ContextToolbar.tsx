import { useEffect, useState } from 'react';
import { useSelectedElement } from '../../contexts/SelectedElementContext';
import { Trash2, Copy, ArrowUp, ArrowDown, Sparkles, Image as ImageIcon, Link as LinkIcon, Type } from 'lucide-react';
import RippleEffect from '../ui/RippleEffect';

export default function ContextToolbar() {
    const { selectedElement } = useSelectedElement();
    const [show, setShow] = useState(false);

    // Mock actions for now - will connect to real handlers later
    const handleAction = (action: string) => {
        console.log(`Action: ${action} on ${selectedElement?.elementId}`);
    };

    // Only show if an element is selected
    useEffect(() => {
        setShow(!!selectedElement);
    }, [selectedElement]);

    if (!show || !selectedElement) return null;

    // Determine tools based on element type
    const renderTools = () => {
        const type = selectedElement.elementType;

        if (type === 'image') {
            return (
                <>
                    <ToolbarButton icon={<ImageIcon className="w-4 h-4" />} label="Replace" onClick={() => handleAction('replace')} />
                    <ToolbarDivider />
                    <ToolbarButton icon={<Sparkles className="w-4 h-4" />} label="AI Edit" onClick={() => handleAction('ai-edit')} />
                </>
            );
        }

        if (type === 'text' || type === 'heading') {
            return (
                <>
                    <ToolbarButton icon={<Type className="w-4 h-4" />} label="Format" onClick={() => handleAction('format')} />
                    <ToolbarDivider />
                    <ToolbarButton icon={<Sparkles className="w-4 h-4" />} label="Rewrite" onClick={() => handleAction('rewrite')} />
                </>
            );
        }

        if (type === 'button') {
            return (
                <>
                    <ToolbarButton icon={<LinkIcon className="w-4 h-4" />} label="Link" onClick={() => handleAction('link')} />
                    <ToolbarDivider />
                    <ToolbarButton icon={<Type className="w-4 h-4" />} label="Text" onClick={() => handleAction('text')} />
                </>
            );
        }

        // Default / Section tools
        return (
            <>
                <ToolbarButton icon={<ArrowUp className="w-4 h-4" />} label="Up" onClick={() => handleAction('move-up')} />
                <ToolbarButton icon={<ArrowDown className="w-4 h-4" />} label="Down" onClick={() => handleAction('move-down')} />
                <ToolbarDivider />
                <ToolbarButton icon={<Copy className="w-4 h-4" />} label="Duplicate" onClick={() => handleAction('duplicate')} />
                <ToolbarButton icon={<Trash2 className="w-4 h-4 text-red-400" />} label="Delete" onClick={() => handleAction('delete')} />
            </>
        );
    };

    // Position logic would go here (simplified for now)
    // We'll just center it at the bottom of the screen or near the selection if possible
    // For Phase 2 MVP, let's make it a floating pill above the selection or fixed bottom center if selection is off-screen.

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="glass-panel rounded-full p-1.5 flex items-center shadow-2xl ring-1 ring-white/20">
                {renderTools()}
                <ToolbarDivider />
                <div className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {selectedElement.elementType}
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
    return (
        <RippleEffect
            onClick={onClick}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors relative group"
            title={label}
        >
            {icon}
            <span className="sr-only">{label}</span>
            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {label}
            </span>
        </RippleEffect>
    );
}

function ToolbarDivider() {
    return <div className="w-px h-4 bg-white/10 mx-1" />;
}
