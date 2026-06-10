import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface DynamicListInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export const DynamicListInput: React.FC<DynamicListInputProps> = ({ 
  label, 
  items, 
  onChange, 
  placeholder = "Add item..." 
}) => {
  const [inputValue, setInputValue] = useState('');

  const addItem = () => {
    if (inputValue.trim() && !items.includes(inputValue.trim())) {
      onChange([...items, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-text-p text-[13px] font-medium">{label}</label>
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-bg-custom border border-border-darker rounded-[8px] px-4 py-3 text-text-p text-[14px] outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={addItem}
          className="bg-primary text-text-p p-3 rounded-[8px] hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-1">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 bg-bg-darker border border-border-darker px-3 py-1.5 rounded-[6px] text-text-s text-[13px]"
          >
            {item}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-text-p hover:text-primary transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-text-s text-[12px] italic opacity-50">No items added yet.</p>
        )}
      </div>
    </div>
  );
};
