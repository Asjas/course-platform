import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  type UniqueIdentifier,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { queryClient } from "~/lib/query.client";
import { trpc } from "~/lib/trpc.client";

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
}

interface Lesson {
  id: string;
  title: string;
  order: number;
  moduleId: string;
  courseId: string;
  isPreview: boolean;
  videoUrl: string | null;
  duration: number | null;
}

interface CourseEditorSidebarProps {
  modules: Module[];
  lessons: Lesson[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string, type: "module" | "lesson") => void;
  onModulesReordered: () => void;
  onLessonsReordered: () => void;
}

interface SortableLessonProps {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: () => void;
}

function SortableLesson({ lesson, isSelected, onSelect }: SortableLessonProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lesson.id,
    data: { type: "lesson", moduleId: lesson.moduleId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      className={`group flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
        isSelected
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
          : "text-gray-700 dark:text-gray-300"
      }`}
      ref={setNodeRef}
      style={style}
    >
      <button
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <button
        className="flex-1 text-left"
        type="button"
        onClick={onSelect}
      >
        {lesson.order + 1}. {lesson.title}
      </button>
    </div>
  );
}

interface SortableModuleProps {
  module: Module;
  lessons: Lesson[];
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onSelectLesson: (lessonId: string) => void;
  selectedLessonId: string | null;
}

function SortableModule({
  module,
  lessons,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onDelete,
  onSelectLesson,
  selectedLessonId,
}: SortableModuleProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sortedLessons = [...lessons]
    .filter((l) => l.moduleId === module.id)
    .sort((a, b) => a.order - b.order);

  return (
    <div
      className="mb-2"
      ref={setNodeRef}
      style={style}
    >
      <div
        className={`group flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${
          isSelected
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
            : "border-gray-200 dark:border-gray-700"
        }`}
      >
        <button
          className="cursor-grab touch-none text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          type="button"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          type="button"
          onClick={onToggle}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <button
          className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white"
          type="button"
          onClick={onSelect}
        >
          {module.order + 1}. {module.title}
        </button>

        <button
          className="text-red-600 opacity-0 group-hover:opacity-100 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          type="button"
          onClick={onDelete}
        >
          <Trash2Icon className="h-4 w-4" />
        </button>
      </div>

      {isExpanded && sortedLessons.length > 0 && (
        <div className="mt-1 ml-8 space-y-1">
          <SortableContext
            items={sortedLessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedLessons.map((lesson) => (
              <SortableLesson
                isSelected={selectedLessonId === lesson.id}
                key={lesson.id}
                lesson={lesson}
                onSelect={() => onSelectLesson(lesson.id)}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

export default function CourseEditorSidebar({
  modules,
  lessons,
  selectedItemId,
  onSelectItem,
  onModulesReordered,
  onLessonsReordered,
}: CourseEditorSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id)),
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const reorderModulesMutation = useMutation(
    trpc.courses.reorderModules.mutationOptions(),
  );

  const reorderLessonsMutation = useMutation(
    trpc.courses.reorderLessons.mutationOptions(),
  );

  const moveLessonMutation = useMutation(
    trpc.courses.moveLessonToModule.mutationOptions(),
  );

  const deleteModuleMutation = useMutation(
    trpc.courses.deleteModule.mutationOptions(),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  // Get all sortable item IDs (modules + lessons)
  const allItems = [
    ...sortedModules.map((m) => m.id),
    ...lessons.map((l) => l.id),
  ];

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragOver() {
    // Visual feedback during drag is handled by @dnd-kit automatically
    // No need to modify state here - just let the library handle the visual preview
    // The actual reordering happens in handleDragEnd
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    // Check if we're dragging a module
    const isModuleDrag = modules.some((m) => m.id === active.id);
    const isLessonDrag = lessons.some((l) => l.id === active.id);

    if (isModuleDrag && modules.some((m) => m.id === over.id)) {
      // Module reordering
      const oldIndex = sortedModules.findIndex((m) => m.id === active.id);
      const newIndex = sortedModules.findIndex((m) => m.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reorderedModules = arrayMove(sortedModules, oldIndex, newIndex);
      const updatedModules = reorderedModules.map((m, idx) => ({
        ...m,
        order: idx,
      }));

      // Optimistically update
      onModulesReordered();

      // Persist to backend
      const toastId = toast.loading("Reordering modules...");
      try {
        await reorderModulesMutation.mutateAsync({
          modules: updatedModules.map((m) => ({ id: m.id, order: m.order })),
        });

        queryClient.invalidateQueries({
          queryKey: ["admin", "courses"],
        });

        toast.success("Modules reordered!", { id: toastId });
      } catch (error) {
        console.error("Failed to reorder modules:", error);
        toast.error("Failed to reorder modules", { id: toastId });
      }
    } else if (isLessonDrag) {
      // Lesson reordering or moving between modules
      const activeLesson = lessons.find((l) => l.id === active.id);
      if (!activeLesson) return;

      const overLesson = lessons.find((l) => l.id === over.id);
      const overModule = modules.find((m) => m.id === over.id);

      if (overLesson) {
        // Lesson dropped on another lesson
        const sourceModuleId = activeLesson.moduleId;
        const targetModuleId = overLesson.moduleId;

        if (sourceModuleId === targetModuleId) {
          // Reordering within same module
          const moduleLessons = lessons
            .filter((l) => l.moduleId === sourceModuleId)
            .sort((a, b) => a.order - b.order);

          const oldIndex = moduleLessons.findIndex((l) => l.id === active.id);
          const newIndex = moduleLessons.findIndex((l) => l.id === over.id);

          if (oldIndex === -1 || newIndex === -1) return;

          const reorderedLessons = arrayMove(moduleLessons, oldIndex, newIndex);
          const updatedLessons = reorderedLessons.map((l, idx) => ({
            ...l,
            order: idx,
          }));

          onLessonsReordered();

          const toastId = toast.loading("Reordering lessons...");
          try {
            await reorderLessonsMutation.mutateAsync({
              lessons: updatedLessons.map((l) => ({
                id: l.id,
                order: l.order,
              })),
            });

            queryClient.invalidateQueries({
              queryKey: ["admin", "courses"],
            });

            toast.success("Lessons reordered!", { id: toastId });
          } catch (error) {
            console.error("Failed to reorder lessons:", error);
            toast.error("Failed to reorder lessons", { id: toastId });
          }
        } else {
          // Moving between modules
          const targetModuleLessons = lessons
            .filter((l) => l.moduleId === targetModuleId)
            .sort((a, b) => a.order - b.order);

          const insertIndex = targetModuleLessons.findIndex(
            (l) => l.id === over.id,
          );

          const toastId = toast.loading("Moving lesson...");
          try {
            await moveLessonMutation.mutateAsync({
              lessonId: activeLesson.id,
              newModuleId: targetModuleId,
              newOrder:
                insertIndex >= 0 ? insertIndex : targetModuleLessons.length,
            });

            queryClient.invalidateQueries({
              queryKey: ["admin", "courses"],
            });

            toast.success("Lesson moved!", { id: toastId });
          } catch (error) {
            console.error("Failed to move lesson:", error);
            toast.error("Failed to move lesson", { id: toastId });
          }
        }
      } else if (overModule) {
        // Lesson dropped on module header - move to end of that module
        const targetModuleId = overModule.id;

        if (activeLesson.moduleId === targetModuleId) return;

        const targetModuleLessons = lessons
          .filter((l) => l.moduleId === targetModuleId)
          .sort((a, b) => a.order - b.order);

        const toastId = toast.loading("Moving lesson...");
        try {
          await moveLessonMutation.mutateAsync({
            lessonId: activeLesson.id,
            newModuleId: targetModuleId,
            newOrder: targetModuleLessons.length,
          });

          queryClient.invalidateQueries({
            queryKey: ["admin", "courses"],
          });

          toast.success("Lesson moved!", { id: toastId });
        } catch (error) {
          console.error("Failed to move lesson:", error);
          toast.error("Failed to move lesson", { id: toastId });
        }
      }
    }
  }

  async function handleDeleteModule(moduleId: string, moduleName: string) {
    if (
      !confirm(
        `Delete module "${moduleName}"? This will also delete all lessons in this module.`,
      )
    ) {
      return;
    }

    const toastId = toast.loading(`Deleting module ${moduleName}...`);
    try {
      await deleteModuleMutation.mutateAsync({ moduleId });

      queryClient.invalidateQueries({
        queryKey: ["admin", "courses"],
      });

      toast.success(`Module ${moduleName} deleted successfully!`, {
        id: toastId,
      });
    } catch (error) {
      console.error("Failed to delete module:", error);
      toast.error("Failed to delete module. Please try again.", {
        id: toastId,
      });
    }
  }

  const activeModule = sortedModules.find((m) => m.id === activeId);
  const activeLesson = lessons.find((l) => l.id === activeId);

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Course Structure
        </h2>
        <button
          className="inline-flex items-center rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700"
          type="button"
          onClick={() => onSelectItem("new-module", "module")}
        >
          <PlusIcon className="mr-1 h-3.5 w-3.5" />
          Module
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          <SortableContext
            items={allItems}
            strategy={verticalListSortingStrategy}
          >
            {sortedModules.map((module) => (
              <SortableModule
                isExpanded={expandedModules.has(module.id)}
                isSelected={selectedItemId === module.id}
                key={module.id}
                lessons={lessons}
                module={module}
                onDelete={() => handleDeleteModule(module.id, module.title)}
                onSelect={() => onSelectItem(module.id, "module")}
                onSelectLesson={(lessonId) => onSelectItem(lessonId, "lesson")}
                onToggle={() => toggleModule(module.id)}
                selectedLessonId={
                  selectedItemId && lessons.find((l) => l.id === selectedItemId)
                    ? selectedItemId
                    : null
                }
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {activeModule ? (
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {activeModule.order + 1}. {activeModule.title}
                  </span>
                </div>
              </div>
            ) : activeLesson ? (
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {activeLesson.order + 1}. {activeLesson.title}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {sortedModules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No modules yet
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Click "Module" to add your first module
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
