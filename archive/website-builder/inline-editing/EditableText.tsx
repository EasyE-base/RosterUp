import { useRef, useEffect, useState } from 'react';

interface EditableTextProps {
    initialValue: string;
    onSave: (value: string) => void;
    tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
    multiline?: boolean;
    disabled?: boolean;
}

export default function EditableText({
    initialValue,
    onSave,
    tagName: Tag = 'div',
    className = '',
    style = {},
    placeholder = 'Type here...',
    multiline = false,
    disabled = false,
    ...props
}: EditableTextProps & React.HTMLAttributes<HTMLElement>) {
    const elementRef = useRef<HTMLElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Sync initialValue with innerText when not focused
    useEffect(() => {
        if (elementRef.current && !isFocused && elementRef.current.innerText !== initialValue) {
            elementRef.current.innerText = initialValue;
        }
    }, [initialValue, isFocused]);

    const handleBlur = () => {
        setIsFocused(false);
        if (elementRef.current) {
            const newContent = elementRef.current.innerText;
            if (newContent !== initialValue) {
                onSave(newContent);
            }
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            elementRef.current?.blur();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    return (
        <Tag
            ref={elementRef as any}
            contentEditable={!disabled}
            suppressContentEditableWarning
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className={`
        outline-none transition-all duration-200 cursor-text
        empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400
        ${!disabled ? 'hover:bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 rounded px-1 -mx-1' : ''}
        ${className}
      `}
            style={style}
            data-placeholder={placeholder}
            {...props}
        />
    );
}
