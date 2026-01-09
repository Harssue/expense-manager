import React, { useState, useEffect } from 'react';
import api from '../lib/axios';

interface BudgetFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onSuccess, onCancel }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7) + '-01'); // YYYY-MM-01
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/finance/categories/');
      // Only Expense categories typically have budgets
      setCategories(response.data.filter((c: any) => c.type === 'EXPENSE'));
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/finance/budgets/', {
        category: categoryId,
        amount: amount,
        month: month
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error saving budget');
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
        <h2 className="text-xl font-bold mb-4 text-gray-800">Set Monthly Budget</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-medium">Category</label>
            <select
              required
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
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1 font-medium">Budget Amount</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full border rounded p-2"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-1 font-medium">Month (Start Date)</label>
            <input
              type="date"
              required
              className="w-full border rounded p-2"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.25rem' }}
              value={month}
              onChange={e => setMonth(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">Select any day, we'll store it as the 1st of the month.</p>
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
              Set Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
