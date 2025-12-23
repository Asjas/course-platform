import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
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
  onModulesReordered: (modules: Module[]) => void;
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
          {sortedLessons.map((lesson) => (
            <button
              className={`group flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                selectedLessonId === lesson.id
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              key={lesson.id}
              type="button"
              onClick={() => onSelectLesson(lesson.id)}
            >
              <span className="flex-1 text-left">
                {lesson.order + 1}. {lesson.title}
              </span>
            </button>
          ))}
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
}: CourseEditorSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id)),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const reorderModulesMutation = useMutation(
    trpc.courses.reorderModules.mutationOptions(),
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
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedModules = arrayMove(modules, oldIndex, newIndex);
    const updatedModules = reorderedModules.map((m, idx) => ({
      ...m,
      order: idx,
    }));

    // Optimistically update
    onModulesReordered(updatedModules);

    // Persist to backend
    const toastId = toast.loading("Reordering modules...");
    try {
      await reorderModulesMutation.mutateAsync({
        modules: updatedModules.map((m) => ({ id: m.id, order: m.order })),
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "courses"],
      });

      toast.success("Modules reordered successfully!", { id: toastId });
    } catch (error) {
      console.error("Failed to reorder modules:", error);
      toast.error("Failed to reorder modules. Please try again.", {
        id: toastId,
      });
      // Revert optimistic update
      onModulesReordered(modules);
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

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);
  const activeModule = modules.find((m) => m.id === activeId);

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
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedModules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedModules.map((module) => (
              <SortableModule
                key={module.id}
                module={module}
                lessons={lessons}
                isExpanded={expandedModules.has(module.id)}
                isSelected={selectedItemId === module.id}
                onToggle={() => toggleModule(module.id)}
                onSelect={() => onSelectItem(module.id, "module")}
                onDelete={() => handleDeleteModule(module.id, module.title)}
                onSelectLesson={(lessonId) => onSelectItem(lessonId, "lesson")}
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
