import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
    FORMAT_TEXT_COMMAND,
    FORMAT_BLOCK_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
} from 'lexical';
import {$wrapNodes} from '@lexical/selection';
import {HeadingNode} from '@lexical/rich-text';
import {useCallback, useState, useEffect} from 'react';

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);

    useEffect(() => {
        return editor.registerUpdateListener(({editorState}) => {
            editorState.read(() => {
                const selection = editorState._selection;
                if (selection) {
                    const hasFormat = selection.hasFormat('bold');
                    setIsBold(hasFormat);
                    setIsItalic(selection.hasFormat('italic'));
                }
            });
        });
    }, [editor]);

    const formatText = useCallback((format) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    }, [editor]);

    const formatBlock = useCallback((tag) => {
        editor.dispatchCommand(FORMAT_BLOCK_COMMAND, tag);
    }, [editor]);

    return (
        <div style={{
            display: 'flex',
            gap: '8px',
            padding: '12px',
            borderBottom: '1px solid #e0e0e0',
            flexWrap: 'wrap',
            background: '#fafafa',
            borderRadius: '8px 8px 0 0',
        }}>
            <button onClick={() => editor.dispatchCommand(UNDO_COMMAND)} title="Undo">↶</button>
            <button onClick={() => editor.dispatchCommand(REDO_COMMAND)} title="Redo">↷</button>
            <div style={{width: '1px', background: '#ddd'}} />

            <button
                onClick={() => formatText('bold')}
                style={{fontWeight: isBold ? 'bold' : 'normal'}}
                title="Bold"
            >B</button>
            <button
                onClick={() => formatText('italic')}
                style={{fontStyle: isItalic ? 'italic' : 'normal'}}
                title="Italic"
            >I</button>
            <button onClick={() => formatText('underline')} title="Underline">U</button>
            <button onClick={() => formatText('strikethrough')} title="Strikethrough">S</button>

            <div style={{width: '1px', background: '#ddd'}} />

            <button onClick={() => formatBlock('h1')} title="Heading 1">H1</button>
            <button onClick={() => formatBlock('h2')} title="Heading 2">H2</button>
            <button onClick={() => formatBlock('ul')} title="Bullet List">•</button>
            <button onClick={() => formatBlock('ol')} title="Ordered List">1.</button>
            <button onClick={() => formatBlock('quote')} title="Quote">"</button>

            <style>{`
                button {
                    padding: 6px 12px;
                    border: 1px solid #ddd;
                    background: #fff;
                    cursor: pointer;
                    border-radius: 4px;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                button:hover {
                    background: #f0f0f0;
                    border-color: #999;
                }
                button:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
}