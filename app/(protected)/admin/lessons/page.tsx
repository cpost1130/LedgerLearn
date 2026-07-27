"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/useToast";

interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  type: string;
  content: unknown;
  orderIndex: number;
  moduleTitle: string | null;
}

interface ModuleOption {
  id: number;
  title: string;
}

type FormMode = "closed" | "add" | "edit";

export default function ManageLessonsPage() {
  const { addToast, ToastContainer } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [moduleOptions, setModuleOptions] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModuleId, setFilterModuleId] = useState<string>("");
  const [formMode, setFormMode] = useState<FormMode>("closed");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    type: "written",
    moduleId: "",
    orderIndex: 0,
    content: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchModules = async () => {
    try {
      const res = await fetch("/api/admin/modules");
      if (res.ok) {
        const data = await res.json();
        setModuleOptions(data.modules);
      }
    } catch {
      // Silently fail — modules dropdown will just be empty
    }
  };

  const fetchLessons = async () => {
    try {
      let url = "/api/admin/lessons";
      if (filterModuleId) {
        url += `?moduleId=${filterModuleId}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setLessons(data.lessons);
    } catch {
      addToast("Failed to load lessons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLessons();
  }, [filterModuleId]);

  const resetForm = () => {
    setForm({ title: "", type: "written", moduleId: "", orderIndex: 0, content: "" });
    setFormMode("closed");
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setFormMode("add");
  };

  const openEdit = (lesson: Lesson) => {
    setForm({
      title: lesson.title,
      type: lesson.type,
      moduleId: String(lesson.moduleId),
      orderIndex: lesson.orderIndex,
      content: lesson.content ? JSON.stringify(lesson.content, null, 2) : "",
    });
    setEditingId(lesson.id);
    setFormMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.moduleId) {
      addToast("Please select a module", "error");
      return;
    }
    setSaving(true);

    let contentValue: unknown = null;
    if (form.content.trim()) {
      try {
        contentValue = JSON.parse(form.content);
      } catch {
        addToast("Content must be valid JSON", "error");
        setSaving(false);
        return;
      }
    }

    try {
      const url =
        formMode === "add"
          ? "/api/admin/lessons"
          : `/api/admin/lessons/${editingId}`;
      const method = formMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          moduleId: parseInt(form.moduleId, 10),
          orderIndex: form.orderIndex,
          content: contentValue,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      addToast(
        formMode === "add" ? "Lesson created" : "Lesson updated",
        "success"
      );
      resetForm();
      fetchLessons();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save lesson";
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      addToast("Lesson deleted", "success");
      fetchLessons();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      addToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const typeLabel = (t: string) =>
    ({ written: "Written", slides: "Slides", exercise: "Exercise", quiz: "Quiz" }[
      t
    ] ?? t);

  if (loading) {
    return <p className="text-gray-500">Loading lessons...</p>;
  }

  return (
    <div>
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Lessons</h2>
        <button
          onClick={openAdd}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-deep-blue transition-colors cursor-pointer"
        >
          + Add Lesson
        </button>
      </div>

      {/* Filter by module */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Module
        </label>
        <select
          value={filterModuleId}
          onChange={(e) => setFilterModuleId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
        >
          <option value="">All Modules</option>
          {moduleOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
            </option>
          ))}
        </select>
      </div>

      {/* Form modal */}
      {formMode !== "closed" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {formMode === "add" ? "Add Lesson" : "Edit Lesson"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="written">Written</option>
                    <option value="slides">Slides</option>
                    <option value="exercise">Exercise</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Module
                  </label>
                  <select
                    required
                    value={form.moduleId}
                    onChange={(e) =>
                      setForm({ ...form, moduleId: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="">Select module...</option>
                    {moduleOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Index
                </label>
                <input
                  required
                  type="number"
                  value={form.orderIndex}
                  onChange={(e) =>
                    setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content (JSON)
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  rows={10}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder='{"body": "Lesson content...", "slides": [...]}'
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-deep-blue transition-colors cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lessons table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lessons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No lessons found. Click &quot;+ Add Lesson&quot; to create one.
                </td>
              </tr>
            ) : (
              lessons.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{l.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {typeLabel(l.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{l.orderIndex}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {l.moduleTitle ?? `Module ${l.moduleId}`}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(l)}
                      className="text-teal hover:text-deep-blue font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(l.id)}
                      disabled={deletingId === l.id}
                      className="text-red-500 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === l.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
