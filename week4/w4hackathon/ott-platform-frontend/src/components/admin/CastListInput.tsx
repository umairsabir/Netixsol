import React, { useState } from 'react';
import { Plus, X, User } from 'lucide-react';

interface CastMember {
  name: string;
  role?: string;
  image?: string;
}

interface CastListInputProps {
  label: string;
  items: CastMember[];
  onChange: (items: CastMember[]) => void;
}

export const CastListInput: React.FC<CastListInputProps> = ({ 
  label, 
  items, 
  onChange,
}) => {
  const [name, setName] = useState('');

  const addItem = () => {
    if (name.trim()) {
      onChange([...items, { name: name.trim() }]);
      setName('');
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
        <div className="flex-1 relative">
           <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-s" size={16} />
           <input
             value={name}
             onChange={(e) => setName(e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder="Actor name..."
             className="w-full bg-bg-custom border border-border-darker rounded-[8px] pl-10 pr-4 py-3 text-text-p text-[14px] outline-none focus:border-primary"
           />
        </div>
        <button
          type="button"
          onClick={addItem}
          className="bg-primary text-text-p p-3 rounded-[8px] hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between bg-bg-darker border border-border-darker p-3 rounded-[8px]"
          >
            <div className="flex items-center gap-3 overflow-hidden">
               <div className="w-8 h-8 rounded-full bg-bg-custom border border-border-darker flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-text-s" />
               </div>
               <span className="text-text-p text-[14px] font-medium truncate">{item.name}</span>
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-text-s hover:text-primary transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
