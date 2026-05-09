'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';

interface Field {
  id: string;
  name: string;
  order: number;
}

interface Category {
  id: string;
  name: string;
  fieldId: string;
  order: number;
}

interface Post {
  id: string;
  title: string;
  categoryId: string;
  order: number;
}
type CategoryApi = Category & { field_id?: string };
type PostApi = Post & { category_id?: string };

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-card border border-border rounded-lg p-4 mb-2 cursor-move hover:border-primary transition-colors"
    >
      {children}
    </div>
  );
}

export function ReorderClient() {
  const t = useTranslations('admin.reorder');
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'fields' | 'categories' | 'posts'>('fields');
  const [fields, setFields] = useState<Field[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function fetchFields() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/fields');
      const data = await res.json();
      setFields(data.sort((a: Field, b: Field) => a.order - b.order));
    } catch (error) {
      console.error('Failed to fetch fields:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCategories(fieldId: string) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      const filtered = (data as CategoryApi[])
        .filter((c) => c.fieldId === fieldId || c.field_id === fieldId)
        .sort((a, b) => a.order - b.order);
      setCategories(filtered);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchPosts(categoryId: string) {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/posts');
      const result = await res.json();
      const posts = (result.data ?? []) as PostApi[];
      const filtered = posts
        .filter((p) => p.categoryId === categoryId || p.category_id === categoryId)
        .sort((a, b) => a.order - b.order);
      setPosts(filtered);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveOrder(type: 'field' | 'category' | 'post', items: Array<{ id: string }>) {
    setIsSaving(true);
    try {
      const itemsWithOrder = items.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      const res = await fetch('/api/admin/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, items: itemsWithOrder }),
      });

      if (!res.ok) throw new Error('Failed to save order');

      // Trigger navigation refresh
      window.dispatchEvent(new CustomEvent('navigation:refresh'));
      router.refresh();
    } catch (error) {
      console.error('Failed to save order:', error);
      alert(t('saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }

  // Fetch fields
  useEffect(() => {
    fetchFields();
  }, []);

  // Fetch categories when field is selected
  useEffect(() => {
    if (selectedFieldId) {
      fetchCategories(selectedFieldId);
    }
  }, [selectedFieldId]);

  // Fetch posts when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      fetchPosts(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    if (activeTab === 'fields') {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      const newFields = arrayMove(fields, oldIndex, newIndex);
      setFields(newFields);
      saveOrder('field', newFields);
    } else if (activeTab === 'categories') {
      const oldIndex = categories.findIndex((c) => c.id === active.id);
      const newIndex = categories.findIndex((c) => c.id === over.id);
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);
      saveOrder('category', newCategories);
    } else if (activeTab === 'posts') {
      const oldIndex = posts.findIndex((p) => p.id === active.id);
      const newIndex = posts.findIndex((p) => p.id === over.id);
      const newPosts = arrayMove(posts, oldIndex, newIndex);
      setPosts(newPosts);
      saveOrder('post', newPosts);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'fields'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('tabFields')}
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'categories'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('tabCategories')}
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'posts'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('tabPosts')}
        </button>
      </div>

      {isSaving && (
        <div className="mb-4 p-3 bg-primary/10 text-primary rounded-md">{t('saving')}</div>
      )}

      {/* Fields Tab */}
      {activeTab === 'fields' && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">{t('hintFields')}</p>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <SortableItem key={field.id} id={field.id}>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{field.name}</div>
                      </div>
                      <svg
                        className="w-5 h-5 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('selectField')}
            </label>
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">{t('selectFieldPlaceholder')}</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>

          {selectedFieldId && (
            <>
              <p className="text-sm text-muted-foreground mb-4">{t('hintCategories')}</p>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t('emptyCategories')}</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={categories.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {categories.map((category, index) => (
                      <SortableItem key={category.id} id={category.id}>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{category.name}</div>
                          </div>
                          <svg
                            className="w-5 h-5 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8h16M4 16h16"
                            />
                          </svg>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </>
          )}
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div>
          <div className="mb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t('selectField')}
              </label>
              <select
                value={selectedFieldId}
                onChange={(e) => {
                  setSelectedFieldId(e.target.value);
                  setSelectedCategoryId('');
                }}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="">{t('selectFieldPlaceholder')}</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedFieldId && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('selectCategory')}
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="">{t('selectCategoryPlaceholder')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedCategoryId && (
            <>
              <p className="text-sm text-muted-foreground mb-4">{t('hintPosts')}</p>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">{t('loading')}</div>
              ) : posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t('emptyPosts')}</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={posts.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {posts.map((post, index) => (
                      <SortableItem key={post.id} id={post.id}>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{post.title}</div>
                          </div>
                          <svg
                            className="w-5 h-5 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8h16M4 16h16"
                            />
                          </svg>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
