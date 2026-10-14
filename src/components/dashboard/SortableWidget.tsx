'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export default function SortableWidget({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <section
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      aria-label={title}
      className={isDragging ? 'opacity-60' : undefined}
    >
      <div className="mb-2 flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${title}`}
          title="Drag to reorder"
          className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-secondary transition hover:bg-[var(--hover)] hover:text-primary active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
        <h2 className="text-base font-bold text-primary">{title}</h2>
      </div>
      {children}
    </section>
  );
}
