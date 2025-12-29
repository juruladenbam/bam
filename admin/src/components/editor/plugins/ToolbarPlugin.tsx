import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND, type TextFormatType } from 'lexical';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();

    const onClick = (format: TextFormatType) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    };

    return (
        <div className="flex items-center gap-1 border-b border-[#e6dbdc] p-2 bg-gray-50 rounded-t-lg">
            <button
                type="button"
                onClick={() => onClick('bold')}
                className={'p-1 hover:bg-white rounded transition-colors text-gray-600'}
                title="Bold"
            >
                <span className="material-symbols-outlined text-[20px]">format_bold</span>
            </button>
            <button
                type="button"
                onClick={() => onClick('italic')}
                className={'p-1 hover:bg-white rounded transition-colors text-gray-600'}
                title="Italic"
            >
                <span className="material-symbols-outlined text-[20px]">format_italic</span>
            </button>
            <button
                type="button"
                onClick={() => onClick('underline')}
                className={'p-1 hover:bg-white rounded transition-colors text-gray-600'}
                title="Underline"
            >
                <span className="material-symbols-outlined text-[20px]">format_underlined</span>
            </button>
            <button
                type="button"
                onClick={() => onClick('strikethrough')}
                className={'p-1 hover:bg-white rounded transition-colors text-gray-600'}
                title="Strikethrough"
            >
                <span className="material-symbols-outlined text-[20px]">format_strikethrough</span>
            </button>
            <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
            <button
                type="button"
                onClick={() => {
                    const url = prompt('Masukkan URL Link:');
                    if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                }}
                className={'p-1 hover:bg-white rounded transition-colors text-gray-600'}
                title="Insert Link"
            >
                <span className="material-symbols-outlined text-[20px]">link</span>
            </button>
        </div>
    );
}
