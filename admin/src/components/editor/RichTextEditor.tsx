import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';
import EditorTheme from './EditorTheme';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { useEffect, useRef, useMemo, memo } from 'react';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';

function Placeholder({ text }: { text: string }) {
    return (
        <div className="absolute top-[52px] left-4 text-gray-400 pointer-events-none select-none">
            {text}
        </div>
    );
}

// Plugin to load initial HTML content
function LoadInitialContentPlugin({ html }: { html?: string }) {
    const [editor] = useLexicalComposerContext();
    const isLoaded = useRef(false);

    useEffect(() => {
        if (!isLoaded.current && html) {
            editor.update(() => {
                const root = $getRoot();
                const parser = new DOMParser();
                const dom = parser.parseFromString(html, 'text/html');
                try {
                    const nodes = $generateNodesFromDOM(editor, dom);
                    root.clear();
                    $insertNodes(nodes);
                } catch (e) {
                    console.warn('Failed to parse HTML, falling back to text', e);
                }
            });
            isLoaded.current = true;
        }
    }, [editor, html]);

    return null;
}

// Plugin to emit changes as HTML
function OnChangeHtmlPlugin({ onChange }: { onChange: (html: string) => void }) {
    const [editor] = useLexicalComposerContext();

    return (
        <OnChangePlugin onChange={(editorState) => {
            editorState.read(() => {
                const htmlString = $generateHtmlFromNodes(editor);
                onChange(htmlString);
            });
        }} />
    );
}

interface RichTextEditorProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    variant?: 'default' | 'ghost';
}

const RichTextEditor = memo(function RichTextEditor({ value, onChange, placeholder = "Jelaskan detail acara...", variant = 'default' }: RichTextEditorProps) {
    const initialConfig = useMemo(() => ({
        namespace: 'RichTextEditor',
        theme: EditorTheme,
        nodes: [LinkNode, AutoLinkNode, HeadingNode, QuoteNode, ListNode, ListItemNode],
        editorState: null, // Prevent autofocus
        onError(error: Error) {
            console.error(error);
        },
    }), []);

    const containerClasses = variant === 'default'
        ? "relative border border-[#e6dbdc] rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#ec1325]/20 focus-within:border-[#ec1325] transition-all"
        : "relative bg-transparent";

    return (
        <div className={containerClasses}>
            <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin />

                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable
                                className="min-h-[150px] p-4 outline-none prose prose-sm max-w-none"
                            />
                        }
                        placeholder={<Placeholder text={placeholder} />}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <LinkPlugin />
                    <ListPlugin />
                    <AutoLinkPlugin matchers={[(text) => {
                        const urlMatch = /(https?:\/\/[^\s]+)/.exec(text);
                        if (urlMatch) {
                            return {
                                index: urlMatch.index,
                                length: urlMatch[0].length,
                                text: urlMatch[0],
                                url: urlMatch[0],
                            };
                        }
                        return null;
                    }]} />
                    <HistoryPlugin />
                    <OnChangeHtmlPlugin onChange={onChange} />
                    <LoadInitialContentPlugin html={value} />
                </div>
            </LexicalComposer>
        </div>
    );
});

export default RichTextEditor;

