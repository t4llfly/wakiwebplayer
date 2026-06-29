"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueueItem, SendCommand } from "@/lib/bot-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QueueManagerProps {
  queue: QueueItem[];
  sendCommand: SendCommand;
}

function SortableTrack({
  track,
  index,
  onRemove,
}: {
  track: QueueItem;
  index: number;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${track.title}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-background/50 hover:bg-background/80 transition-colors group border border-transparent hover:border-border"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className="text-sm font-medium text-muted-foreground w-6">
        {index + 1}.
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm truncate font-medium" title={track.title}>
          {track.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {track.requester}
        </p>
      </div>

      <span className="text-xs text-muted-foreground font-mono">
        {formatTime(track.length_ms)}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onRemove(index)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function QueueManager({ queue, sendCommand }: QueueManagerProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex(
        (t, i) => `${t.title}-${i}` === active.id,
      );
      const newIndex = queue.findIndex((t, i) => `${t.title}-${i}` === over.id);

      sendCommand("move_track", {
        from_index: oldIndex,
        to_index: newIndex,
      });
    }
  };

  const handleRemove = (index: number) => {
    sendCommand("remove_track", { index });
  };

  const handleClear = () => {
    sendCommand("clear_queue");
  };

  if (queue.length === 0) return null;

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex justify-between items-center mb-3">
        <p className="text-xs font-bold text-muted-foreground uppercase">
          Далее в очереди ({queue.length})
        </p>

        {queue.length > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="h-7 text-xs">
                <Trash2 className="w-3 h-3 mr-1" />
                Очистить
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Очистить очередь?</AlertDialogTitle>
                <AlertDialogDescription>
                  Будет удалено {queue.length} треков. Сейчас играющий трек не
                  пострадает.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClear}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Очистить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={queue.map((t, i) => `${t.title}-${i}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {queue.map((track, index) => (
              <SortableTrack
                key={`${track.title}-${index}`}
                track={track}
                index={index}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
