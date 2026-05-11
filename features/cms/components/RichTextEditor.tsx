/**
 * WYSIWYG body editor (TipTap) — outputs HTML for existing post pipeline (sanitize + PostContent).
 */

'use client';

import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Youtube from '@tiptap/extension-youtube';
import { useTranslations } from 'next-intl';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Bold,
  Code2,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Minus,
  Pilcrow,
  Quote,
  Redo,
  LayoutPanelTop,
  Strikethrough,
  Table2,
  Trash2,
  Underline,
  Undo,
  Code,
  ImageIcon,
  Video,
} from 'lucide-react';
import {
  RichTextToolbarButton,
  RichTextToolbarSeparator,
} from '@/features/cms/components/RichTextToolbarButton';
import { adminFetchFormDataJson } from '@/lib/admin/admin-fetch';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  /** Accessible label (e.g. matches visible field label). */
  ariaLabel: string;
}

export function RichTextEditor({ value, onChange, ariaLabel }: RichTextEditorProps) {
  const t = useTranslations('admin.cms.postEditor');
  const placeholder = t('richTextPlaceholder');
  const [, rerenderToolbar] = useReducer((n: number) => n + 1, 0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: {
            class: 'text-primary underline underline-offset-2',
          },
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'blockquote'],
      }),
      Highlight.configure({
        multicolor: false,
        HTMLAttributes: {
          class: 'rounded px-0.5 bg-amber-200/90 text-inherit dark:bg-amber-500/35 [color:inherit]',
        },
      }),
      TableKit.configure({
        table: {
          resizable: false,
          HTMLAttributes: {
            class: 'w-full border-collapse border border-border text-sm my-4',
          },
        },
        tableCell: {
          HTMLAttributes: {
            class: 'border border-border px-3 py-2 align-top [&_p]:mb-0 [&_p]:leading-relaxed',
          },
        },
        tableHeader: {
          HTMLAttributes: {
            class:
              'border border-border bg-muted/60 px-3 py-2 font-semibold text-left align-top [&_p]:mb-0',
          },
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    [placeholder]
  );

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions,
      content: value?.trim() ? value : '<p></p>',
      editorProps: {
        attributes: {
          class:
            'max-w-none min-h-[280px] px-3 py-2 text-base leading-relaxed text-foreground outline-none',
          'aria-label': ariaLabel,
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    },
    [extensions]
  );

  useEffect(() => {
    if (!editor) return;
    const bump = () => rerenderToolbar();
    editor.on('selectionUpdate', bump);
    editor.on('transaction', bump);
    return () => {
      editor.off('selectionUpdate', bump);
      editor.off('transaction', bump);
    };
  }, [editor]);

  const onLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(t('toolbarLinkPrompt'), previous ?? 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const onYoutube = () => {
    if (!editor) return;
    const url = window.prompt(t('toolbarYoutubePrompt'), 'https://www.youtube.com/watch?v=');
    if (url === null || !url.trim()) return;
    editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
  };

  const onImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setImageUploadError(null);
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'post_media');
      const data = await adminFetchFormDataJson<{ url?: string }>('/api/admin/upload', formData);
      if (!data.url) throw new Error(t('uploadFailed'));
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || '';
      editor.chain().focus().setImage({ src: data.url, alt }).run();
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : t('uploadFailed'));
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const toolbar = ((): ReactNode => {
    if (!editor) {
      return <div className="h-10 border-b border-border bg-muted/30" aria-hidden />;
    }
    return (
      <div
        className="flex flex-wrap gap-0.5 border-b border-border bg-muted/30 p-1.5"
        role="toolbar"
        aria-label={t('toolbarAria')}
      >
        <RichTextToolbarButton
          title={t('toolbarBold')}
          active={editor.isActive('bold')}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarItalic')}
          active={editor.isActive('italic')}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarUnderline')}
          active={editor.isActive('underline')}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarStrike')}
          active={editor.isActive('strike')}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarCode')}
          active={editor.isActive('code')}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarHighlight')}
          active={editor.isActive('highlight')}
          disabled={!editor.can().chain().focus().toggleHighlight().run()}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarSeparator />
        <RichTextToolbarButton
          title={t('toolbarH2')}
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarH3')}
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarH4')}
          active={editor.isActive('heading', { level: 4 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        >
          <Heading4 className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarParagraph')}
          active={editor.isActive('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarSeparator />
        <RichTextToolbarButton
          title={t('toolbarAlignLeft')}
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarAlignCenter')}
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarAlignRight')}
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarAlignJustify')}
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <AlignJustify className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarSeparator />
        <RichTextToolbarButton
          title={t('toolbarBulletList')}
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarOrderedList')}
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarBlockquote')}
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarSeparator />
        <RichTextToolbarButton
          title={t('toolbarCodeBlock')}
          active={editor.isActive('codeBlock')}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarLink')}
          active={editor.isActive('link')}
          onClick={onLink}
        >
          <LinkIcon className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={imageUploading ? t('toolbarImageUploading') : t('toolbarImage')}
          disabled={imageUploading}
          onClick={() => {
            setImageUploadError(null);
            imageInputRef.current?.click();
          }}
        >
          <ImageIcon className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton title={t('toolbarYoutube')} onClick={onYoutube}>
          <Video className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarHorizontalRule')}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarSeparator />
        <RichTextToolbarButton
          title={t('toolbarInsertTable')}
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <Table2 className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarToggleHeaderRow')}
          disabled={!editor.can().toggleHeaderRow()}
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
        >
          <LayoutPanelTop className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarDeleteTable')}
          disabled={!editor.can().deleteTable()}
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarSeparator />
        <RichTextToolbarButton
          title={t('toolbarUndo')}
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
        <RichTextToolbarButton
          title={t('toolbarRedo')}
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" strokeWidth={2} />
        </RichTextToolbarButton>
      </div>
    );
  })();

  return (
    <div className="post-rich-editor overflow-hidden rounded-md border border-input bg-background shadow-sm">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onImageFile}
      />
      {toolbar}
      {imageUploadError ? (
        <p className="border-b border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
          {imageUploadError}
        </p>
      ) : null}
      <EditorContent
        editor={editor}
        className="post-rich-editor-content max-h-[min(70vh,720px)] overflow-y-auto"
      />
    </div>
  );
}
