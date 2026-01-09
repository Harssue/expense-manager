import React, { useState, useEffect } from 'react';
import api from '../lib/axios';

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, onCancel }) => {
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/finance/categories/');
      // Filter by type
      const filtered = response.data.filter((c: any) => c.type === type);
      setCategories(filtered);
      // Auto-switch to create mode if no categories exist
      if (filtered.length === 0) {
          setIsCreatingCategory(true);
      } else {
          setIsCreatingCategory(false);
          setCategoryId('');
      }
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let finalCategoryId = categoryId;

      // Create category if needed
      if (isCreatingCategory && newCategoryName) {
        const catRes = await api.post('/finance/categories/', {
          name: newCategoryName,
          type: type
        });
        finalCategoryId = catRes.data.id;
      }

      const payload = {
        amount,
        date,
        description,
        category: finalCategoryId || null
      };

      const endpoint = type === 'INCOME' ? '/finance/income/' : '/finance/expenses/';
      await api.post(endpoint, payload);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error saving transaction');
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', width: '100%', maxWidth: '28rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Add Transaction</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Type Selection */}
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              className={`flex-1 py-2 rounded font-medium transition-colors ${type === 'EXPENSE' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setType('EXPENSE')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded font-medium transition-colors ${type === 'INCOME' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setType('INCOME')}
            >
              Income
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-medium">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-medium">Date</label>
            <input
              type="date"
              required
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-medium">Category</label>
            {!isCreatingCategory && categories.length > 0 ? (
              <div className="flex gap-2">
                <select
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="bg-gray-200 px-3 rounded hover:bg-gray-300 font-bold text-xl"
                  onClick={() => setIsCreatingCategory(true)}
                  title="Create New Category"
                >
                  +
                </button>
              </div>
            ) : (
               <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="New Category Name (e.g., Rent, Food)"
                  className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  autoFocus
                />
                 <button
                  type="button"
                  className="bg-gray-200 px-3 rounded hover:bg-gray-300 whitespace-nowrap"
                  onClick={() => {
                      setIsCreatingCategory(false);
                      // If no categories exist, we might want to keep it in create mode or showing empty select?
                      // Let's just allow toggling back.
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1 font-medium">Description (Optional)</label>
            <input
              type="text"
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
              style={{ backgroundColor: '#2563eb', color: 'white', borderRadius: '0.25rem', padding: '0.5rem 1rem' }}
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
