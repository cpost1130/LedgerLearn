"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/useToast";

interface DripModule {
  id: number;
  title: string;
  slug: string;
  orderIndex: number;
  dripDelayDays: number;
}

export default function DripSchedulePage() {
  const { addToast, ToastContainer } = useToast();
  const [moduleList, setModuleList] = useState<DripModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [savingId, setSavingId] = useState<number | null>(null);

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
  }, [addToast]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const startEdit = (mod: DripModule) => {
    setEditingId(mod.id);
    setEditValue(mod.dripDelayDays);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dripDelayDays: editValue }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      addToast("Drip delay updated", "success");
      setEditingId(null);
      fetchModules();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save";
      addToast(message, "error");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading drip schedule...</p>;
  }

  return (
    <div>
      <ToastContainer />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Drip Schedule</h2>
      <p className="text-sm text-gray-500 mb-6">
        Set how many days after purchase each module unlocks. Module 1
        (orderIndex=1) typically has 0 delay so it&apos;s available immediately.
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Drip Delay (days)</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {moduleList.map((mod) => (
              <tr key={mod.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{mod.orderIndex}</td>
                <td className="px-4 py-3 font-medium">{mod.title}</td>
                <td className="px-4 py-3 text-gray-500">{mod.slug}</td>
                <td className="px-4 py-3">
                  {editingId === mod.id ? (
                    <input
                      type="number"
                      min={0}
                      value={editValue}
                      onChange={(e) =>
                        setEditValue(parseInt(e.target.value) || 0)
                      }
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal"
                    />
                  ) : (
                    <span className="font-mono">{mod.dripDelayDays}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === mod.id ? (
                    <span className="space-x-2">
                      <button
                        onClick={() => saveEdit(mod.id)}
                        disabled={savingId === mod.id}
                        className="text-teal hover:text-deep-blue font-medium cursor-pointer disabled:opacity-50"
                      >
                        {savingId === mod.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => startEdit(mod)}
                      className="text-teal hover:text-deep-blue font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
