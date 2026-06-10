'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import ProductForm from '../components/ProductForm';

export default function AddProductPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="hover:bg-gray-100 p-2 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Add New Product</h1>
          <p className="text-gray-500 font-medium">Create a new item in your storefront</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
        <ProductForm />
      </div>
    </div>
  );
}
