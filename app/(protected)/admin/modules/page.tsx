"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/useToast";

interface Module {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  orderIndex: number;
  dripDelayDays: number;
  lessonCount: number;
}

type FormMode = "closed" | "add" | "edit";

export default function ManageModulesPage() {
  const { addToast, ToastContainer } = useToast();
  const [moduleList, setModuleList] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<FormMode>("closed");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    orderIndex: 0,
    dripDelayDays: 0,
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/modules");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setModuleList(data.modules);
    } catch {
      addToast("Failed to load modules", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, []);

  const resetForm = () => {
    setForm({ title: "", slug: "", description: "", orderIndex: 0, dripDelayDays: 0 });
    setFormMode("closed");
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setFormMode("add");
  };

  const openEdit = (mod: Module) => {
    setForm({
      title: mod.title,
      slug: mod.slug,
      description: mod.description ?? "",
      orderIndex: mod.orderIndex,
      dripDelayDays: mod.dripDelayDays,
    });
    setEditingId(mod.id);
    setFormMode("edit");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url =
        formMode === "add"
          ? "/api/admin/modules"
          : `/api/admin/modules/${editingId}`;
      const method = formMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      addToast(
        formMode === "add" ? "Module created" : "Module updated",
        "success"
      );
      resetForm();
      fetchModules();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save module";
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this module and all its lessons? This cannot be undone."))
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/modules/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete");
      }
      addToast("Module deleted", "success");
      fetchModules();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      addToast(message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading modules...</p>;
  }

  return (
    <div>
      <ToastContainer />
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Modules</h2>
        <button
          onClick={openAdd}
          className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-deep-blue transition-colors cursor-pointer"
        >
          + Add Module
        </button>
      </div>

      {/* Form modal / inline */}
      {formMode !== "closed" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {formMode === "add" ? "Add Module" : "Edit Module"}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  required
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  placeholder="e.g. module-1-bookkeeping-basics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    Drip Delay (days)
                  </label>
                  <input
                    required
                    type="number"
                    value={form.dripDelayDays}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dripDelayDays: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
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

      {/* Modules table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Drip (days)</th>
              <th className="px-4 py-3 font-medium">Lessons</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {moduleList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No modules yet. Click &quot;+ Add Module&quot; to create one.
                </td>
              </tr>
            ) : (
              moduleList.map((mod) => (
                <tr key={mod.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{mod.title}</td>
                  <td className="px-4 py-3 text-gray-500">{mod.slug}</td>
                  <td className="px-4 py-3">{mod.orderIndex}</td>
                  <td className="px-4 py-3">{mod.dripDelayDays}</td>
                  <td className="px-4 py-3">{mod.lessonCount}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(mod)}
                      className="text-teal hover:text-deep-blue font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(mod.id)}
                      disabled={deletingId === mod.id}
                      className="text-red-500 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === mod.id ? "Deleting..." : "Delete"}
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
