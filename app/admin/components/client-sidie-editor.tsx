'use client'
import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const RichTextEditorCore = dynamic(() => import('@/app/admin/components/custom-editor'), {
    ssr: false
});

export type RichTextEditorHandle = {
    getContent: () => string;
    setContent: (html: string) => void;
};

export interface RichEditorProps extends Omit<React.ComponentProps<"textarea">, 'onChange' | 'value'> {
    value?: string;
    onChange?: (content: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const RichEditor = forwardRef<RichTextEditorHandle, RichEditorProps>(
    (
        {
            className,
            value = '',
            onChange,
            disabled = false,
            placeholder = 'Write something...',
            ...props
        },
        ref
    ) => {
        const editorRef = useRef<RichTextEditorHandle>(null);

        // Expose methods via forwardRef
        useImperativeHandle(ref, () => ({
            getContent: () => {
                return editorRef.current?.getContent() || '';
            },
            setContent: (html: string) => {
                editorRef.current?.setContent(html);
            },
        }));

        // Handle external value changes
        useEffect(() => {
            if (value && editorRef.current) {
                editorRef.current.setContent(value);
            }
        }, [value]);

        const handleContentChange = (content: string) => {
            onChange?.(content);
        };

        return (
            <div
                className={cn(
                    "w-full rounded-md border border-input bg-background ring-offset-background transition-colors",
                    "focus-within:outline-none focus-within:ring-none focus-within:ring-ring focus-within:ring-offset-none",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    "h-[300px]",
                    className
                )}
                data-disabled={disabled}
            >
                <RichTextEditorCore
                    ref={editorRef}
                    onChange={handleContentChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    value={value}
                    {...props}
                />
            </div>
        );
    }
);

RichEditor.displayName = 'RichEditor';
export default RichEditor;
