import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, X, Search, PlusCircle } from "lucide-react";
import api from "../../lib/axios";
import { CategoryModal } from "./CategoryModal";

interface CategorySelectProps {
  label: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  label,
  selectedIds,
  onChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const openCreateModal = () => {
    setIsOpen(false);
    setIsModalOpen(true);
    setSearchTerm("");
  };

  const { data, isLoading } = useQuery({
    queryKey: ["adminCategories", "active"],
    queryFn: async () => {
      const { data } = await api.get(
        "/admin/categories?isActive=true&limit=100",
      );
      return data;
    },
  });

  const categories = data?.results || [];
  const selectedCategories = categories.filter((c: any) =>
    selectedIds.includes(c.id),
  );
  const availableCategories = categories.filter(
    (c: any) =>
      !selectedIds.includes(c.id) &&
      c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-text-p text-[13px] font-medium">{label}</label>

      <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-bg-custom border border-border-darker rounded-[8px] focus-within:border-primary transition-all">
        {selectedCategories.map((cat: any) => (
          <div
            key={cat.id}
            className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-[6px] text-primary text-[13px] animate-in zoom-in-95"
          >
            {cat.name}
            <button
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className="hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-text-s text-[13px] hover:bg-surface border border-dashed border-border-darker hover:border-text-s transition-all"
        >
          <Plus size={14} />
          Add Category
        </button>
      </div>

      {error && <p className="text-primary text-[12px] font-medium">{error}</p>}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border-darker rounded-[12px] shadow-2xl z-[70] overflow-hidden animate-in slide-in-from-top-2">
            <div className="p-3 border-b border-border-darker bg-bg-darker/50 flex items-center gap-3">
              <div className="relative flex-1">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-s"
                />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-bg-custom border border-border-darker rounded-[6px] pl-9 pr-4 py-2 text-[13px] text-text-p outline-none focus:border-primary"
                />
              </div>
              <button
                type="button"
                onClick={openCreateModal}
                className="p-2 bg-primary/10 text-primary rounded-[6px] hover:bg-primary/20 transition-colors"
                title="Create New Category"
              >
                <PlusCircle size={20} />
              </button>
            </div>

            <div className="max-h-[250px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : availableCategories.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-text-s text-[13px] italic mb-3">
                    No categories found
                  </p>
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="text-primary text-[13px] font-bold hover:underline underline-offset-4"
                  >
                    + Add new category
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 p-1">
                  {availableCategories.map((cat: any) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        toggleCategory(cat.id);
                        setSearchTerm("");
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between px-3 py-2.5 rounded-[6px] hover:bg-primary/10 text-text-p text-[14px] text-left transition-colors group"
                    >
                      {cat.name}
                      <Plus
                        size={16}
                        className="text-text-s group-hover:text-primary transition-colors"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
        }}
        onSuccess={(newCat) => {
          toggleCategory(newCat.id || newCat._id);
        }}
      />
    </div>
  );
};
