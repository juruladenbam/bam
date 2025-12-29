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
import { useEffect, useRef, memo } from 'react';

function Placeholder() {
    return (
        <div className="absolute top-[52px] left-4 text-gray-400 pointer-events-none select-none">
            Jelaskan detail acara...
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
                // If it's plain text, generateNodesFromHtml handles it fine usually?
                // Let's wrap in try/catch to fallback to text insertion if needed
                try {
                    const nodes = $generateNodesFromDOM(editor, dom);
                    root.clear();
                    $insertNodes(nodes);
                } catch (e) {
                    // Fallback
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
}

function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const initialConfig = {
        namespace: 'MyEditor',
        theme: EditorTheme,
        nodes: [LinkNode, AutoLinkNode],
        onError(error: Error) {
            console.error(error);
        },
    };

    return (
        <div className="relative border border-[#e6dbdc] rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#ec1325]/20 focus-within:border-[#ec1325] transition-all">
            <LexicalComposer initialConfig={initialConfig}>
                <ToolbarPlugin />

                <div className="relative">
                    <RichTextPlugin
                        contentEditable={
                            <ContentEditable className="min-h-[150px] p-4 outline-none prose prose-sm max-w-none" />
                        }
                        placeholder={<Placeholder />}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                    <LinkPlugin />
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
}
export default memo(RichTextEditor);
