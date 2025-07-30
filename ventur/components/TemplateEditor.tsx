// components/portal/TemplateEditor.tsx
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Pilcrow, List, ListOrdered, ChevronDown, Heading2, Heading3, Image as ImageIcon } from 'lucide-react';

interface TemplateEditorProps {
    content: string;
    onUpdate: (html: string) => void;
    onImageUpload?: (file: File) => Promise<string>;
}

// List of available dynamic fields for the letter
const DYNAMIC_FIELDS = [
    'applicant_name', 'address', 'proposal', 'reference', 'status', 'council', 'date'
];

export default function TemplateEditor({ content, onUpdate, onImageUpload }: TemplateEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] }, // Configure allowed heading levels
            }),
            Placeholder.configure({
                placeholder: 'Start writing the body of your letter here...',
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto',
                },
            }),
        ],
        immediatelyRender: false,
        content,
        editorProps: {
            attributes: {
                // This class styles the editor content area for a clean writing experience
                class: 'prose prose-sm sm:prose-base focus:outline-none p-4 bg-white rounded-md min-h-[400px]',
            },
        },
        onUpdate: ({ editor }) => {
            onUpdate(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const insertField = (field: string) => {
        editor.chain().focus().insertContent(`{{ ${field} }}`).run();
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files[0] || !onImageUpload) return;

        const file = event.target.files[0];
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('Image file is too large. Max 5MB.');
            return;
        }

        try {
            const imageUrl = await onImageUpload(file);
            editor.chain().focus().setImage({ src: imageUrl }).run();
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image. Please try again.');
        }
    };

    return (
        <div className="bg-base-100 rounded-lg">
            {/* Main Toolbar */}
            <div className="flex items-center flex-wrap gap-1 p-2 bg-base-200 rounded-t-lg border-b border-base-300 sticky top-16 z-10">
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`btn btn-sm btn-ghost ${editor.isActive('bold') ? 'btn-active' : ''}`}><Bold size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn btn-sm btn-ghost ${editor.isActive('italic') ? 'btn-active' : ''}`}><Italic size={16} /></button>
                <div className="divider divider-horizontal m-0"></div>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`btn btn-sm btn-ghost ${editor.isActive('heading', { level: 2 }) ? 'btn-active' : ''}`}><Heading2 size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`btn btn-sm btn-ghost ${editor.isActive('heading', { level: 3 }) ? 'btn-active' : ''}`}><Heading3 size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={`btn btn-sm btn-ghost ${editor.isActive('paragraph') ? 'btn-active' : ''}`}><Pilcrow size={16} /></button>
                <div className="divider divider-horizontal m-0"></div>
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn btn-sm btn-ghost ${editor.isActive('bulletList') ? 'btn-active' : ''}`}><List size={16} /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`btn btn-sm btn-ghost ${editor.isActive('orderedList') ? 'btn-active' : ''}`}><ListOrdered size={16} /></button>
                <div className="divider divider-horizontal m-0"></div>
                <div className="dropdown">
                    <button tabIndex={0} type="button" role="button" className="btn btn-sm btn-ghost">Insert Field <ChevronDown size={16} /></button>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                        {DYNAMIC_FIELDS.map(field => (
                            <li key={field}><a onClick={() => insertField(field)}>{field.replace(/_/g, ' ')}</a></li>
                        ))}
                    </ul>
                </div>

                <label className="btn btn-sm btn-ghost">
                    <ImageIcon size={16} />
                    Insert Image
                    <input
                        type="file"
                        hidden
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleImageUpload}
                    />
                </label>
            </div>

            {/* The Editor itself */}
            <div className="p-4 bg-base-200 rounded-b-lg">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
