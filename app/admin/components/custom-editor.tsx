import {useCallback, useEffect, useRef, useState} from 'react';
import {RichTextProvider} from 'reactjs-tiptap-editor';
import {Document} from '@tiptap/extension-document';
import {HardBreak} from '@tiptap/extension-hard-break';
import {ListItem} from '@tiptap/extension-list';
import {Paragraph} from '@tiptap/extension-paragraph';
import {Text} from '@tiptap/extension-text';
import {TextStyle} from '@tiptap/extension-text-style';
import {CharacterCount, Dropcursor, Gapcursor, Placeholder, TrailingNode,} from '@tiptap/extensions';
import {Blockquote, RichTextBlockquote,} from 'reactjs-tiptap-editor/blockquote';
import {Bold, RichTextBold} from 'reactjs-tiptap-editor/bold';
import {BulletList, RichTextBulletList,} from 'reactjs-tiptap-editor/bulletlist';
import {Clear, RichTextClear} from 'reactjs-tiptap-editor/clear';
import {Color, RichTextColor} from 'reactjs-tiptap-editor/color';
import {Column, ColumnNode, MultipleColumnNode, RichTextColumn,} from 'reactjs-tiptap-editor/column';
import {Emoji, RichTextEmoji} from 'reactjs-tiptap-editor/emoji';
import {FontFamily, RichTextFontFamily,} from 'reactjs-tiptap-editor/fontfamily';
import {FontSize, RichTextFontSize} from 'reactjs-tiptap-editor/fontsize';
import {Heading, RichTextHeading} from 'reactjs-tiptap-editor/heading';
import {Highlight, RichTextHighlight} from 'reactjs-tiptap-editor/highlight';
import {RichTextRedo, RichTextUndo,} from 'reactjs-tiptap-editor/history';
import {HorizontalRule, RichTextHorizontalRule,} from 'reactjs-tiptap-editor/horizontalrule';
import {Image, RichTextImage} from 'reactjs-tiptap-editor/image';
import {Indent, RichTextIndent} from 'reactjs-tiptap-editor/indent';
import {Italic, RichTextItalic} from 'reactjs-tiptap-editor/italic';
import {LineHeight, RichTextLineHeight,} from 'reactjs-tiptap-editor/lineheight';
import {Link, RichTextLink} from 'reactjs-tiptap-editor/link';
import {MoreMark, RichTextMoreMark} from 'reactjs-tiptap-editor/moremark';
import {OrderedList, RichTextOrderedList,} from 'reactjs-tiptap-editor/orderedlist';
import {RichTextStrike, Strike} from 'reactjs-tiptap-editor/strike';
import {RichTextTable, Table} from 'reactjs-tiptap-editor/table';
import {RichTextTaskList, TaskList} from 'reactjs-tiptap-editor/tasklist';
import {RichTextAlign, TextAlign} from 'reactjs-tiptap-editor/textalign';
import {RichTextTextDirection, TextDirection,} from 'reactjs-tiptap-editor/textdirection';
import {RichTextUnderline, TextUnderline,} from 'reactjs-tiptap-editor/textunderline';
import {RichTextVideo, Video} from 'reactjs-tiptap-editor/video';
import 'reactjs-tiptap-editor/style.css';
import {Editor, EditorContent, useEditor} from '@tiptap/react';

const DocumentColumn = Document.extend({
    content: '(block|columns)+',
});

const BaseKit = [
    DocumentColumn,
    Text,
    Dropcursor.configure({
        class: 'reactjs-tiptap-editor-theme',
        color: 'hsl(var(--primary))',
        width: 2,
    }),
    Gapcursor,
    HardBreak,
    Paragraph,
    TrailingNode,
    ListItem,
    TextStyle,
    Placeholder.configure({
        placeholder: "Press '/' for commands",
    }),
];

const LIMIT = 2505;

const extensions = [
    ...BaseKit,
    CharacterCount.configure({
        limit: LIMIT,
    }),
    Clear,
    FontFamily,
    Heading,
    FontSize,
    Bold,
    Italic,
    TextUnderline,
    Strike,
    MoreMark,
    Emoji,
    Color,
    Highlight,
    BulletList,
    OrderedList,
    TextAlign,
    Indent,
    LineHeight,
    TaskList,
    Link,
    Image.configure({
        upload: (files) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(URL.createObjectURL(files));
                }, 300);
            });
        },
    }),
    Video.configure({
        upload: (files) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(URL.createObjectURL(files));
                }, 300);
            });
        },
    }),
    Blockquote,
    HorizontalRule,
    Column,
    ColumnNode,
    MultipleColumnNode,
    Table,
    TextDirection,
];


// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    return function (...args: Parameters<T>) {
        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

const RichTextToolbar = () => {
    return (
        <div className="flex items-center !p-1 gap-2 flex-wrap !border-b !border-solid !border-border">
            <RichTextUndo/>
            <RichTextRedo/>
            <RichTextClear/>
            <RichTextFontFamily/>
            <RichTextHeading/>
            <RichTextFontSize/>
            <RichTextBold/>
            <RichTextItalic/>
            <RichTextUnderline/>
            <RichTextStrike/>
            <RichTextMoreMark/>
            <RichTextEmoji/>
            <RichTextColor/>
            <RichTextHighlight/>
            <RichTextBulletList/>
            <RichTextOrderedList/>
            <RichTextAlign/>
            <RichTextIndent/>
            <RichTextLineHeight/>
            <RichTextTaskList/>
            <RichTextLink/>
            <RichTextImage/>
            <RichTextVideo/>
            <RichTextBlockquote/>
            <RichTextHorizontalRule/>
            <RichTextColumn/>
            <RichTextTable/>
            <RichTextTextDirection/>
        </div>
    );
};

function App({content: text, onChange}: {content?: string, onChange: any}) {
    const [content, setContent] = useState(text?? "");
    const contentRef = useRef(text?? "");
    const debouncedSetContentRef = useRef(null);

    // Initialize debounced function
    useEffect(() => {
        debouncedSetContentRef.current = debounce((value) => {
            setContent(value);
        }, 500);
    }, []);

    const onValueChange = useCallback((value) => {
        contentRef.current = value;
        if (debouncedSetContentRef.current) {
            debouncedSetContentRef.current(value);
        }
    }, []);

    const editor = useEditor({
        textDirection: 'auto',
        content,
        extensions,
        immediatelyRender: false,
        onUpdate: ({editor}) => {
            const html = editor.getHTML();
            onValueChange(html);
            onChange(html);
        },
    });

    useEffect(() => {
        window['editor'] = editor;
    }, [editor]);

    return (
        <>
            <div className="w-full max-w-[1200px] mx-[auto] my-0">
                <RichTextProvider editor={editor as Editor}>
                    <div className="">
                        <div className="flex max-h-full w-full flex-col">
                            <RichTextToolbar/>

                            <EditorContent editor={editor}/>
                        </div>
                    </div>
                </RichTextProvider>
            </div>
        </>)
}
export default App;