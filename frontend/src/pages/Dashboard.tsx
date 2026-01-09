import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import BudgetForm from '../components/BudgetForm';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [incomeRes, expenseRes, insightsRes] = await Promise.all([
         api.get('/finance/income/'),
         api.get('/finance/expenses/'),
         api.get('/intelligence/insights/')
      ]);
      setData({
          income: incomeRes.data,
          expenses: expenseRes.data
      });
      setInsights(insightsRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (type: 'INCOME' | 'EXPENSE', id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const endpoint = type === 'INCOME' ? `/finance/income/${id}/` : `/finance/expenses/${id}/`;
      await api.delete(endpoint);
      fetchData();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Financial Dashboard</h1>
        <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name || 'User'}</span>
            <button
                onClick={() => setIsBudgetFormOpen(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-medium"
            >
                Set Budget
            </button>
            <button
                onClick={() => setIsFormOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
            >
                + Add Transaction
            </button>
            <button
                onClick={() => { logout(); navigate('/login'); }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Logout
            </button>
        </div>
      </header>

      {isFormOpen && (
        <TransactionForm 
          onSuccess={() => { setIsFormOpen(false); fetchData(); }}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {isBudgetFormOpen && (
        <BudgetForm 
          onSuccess={() => { setIsBudgetFormOpen(false); fetchData(); }}
          onCancel={() => setIsBudgetFormOpen(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Summary Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">
                ${data ? data.income.reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0).toFixed(2) : '0.00'}
            </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
             <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Expenses</h3>
             <p className="text-2xl font-bold text-red-600">
                ${data ? data.expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0).toFixed(2) : '0.00'}
            </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Balance</h3>
            <p className="text-2xl font-bold text-blue-600">
                 ${data ? (
                    data.income.reduce((sum: number, i: any) => sum + parseFloat(i.amount), 0) -
                    data.expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0)
                 ).toFixed(2) : '0.00'}
            </p>
        </div>
      </div>

       {/* Insights */}
      {insights && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Insights</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.overspending.map((alert: any, idx: number) => (
                    <div key={idx} className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                        <div className="flex items-center">
                             <div className="flex-1">
                                <h3 className="text-red-800 font-bold text-md">Overspending Alert: {alert.category}</h3>
                                <p className="text-red-700 text-sm mt-1">{alert.message}</p>
                             </div>
                        </div>
                    </div>
                ))}
                 {insights.predictions.map((pred: any, idx: number) => (
                    <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded shadow-sm">
                        <div className="flex items-center">
                             <div className="flex-1">
                                <h3 className="text-yellow-800 font-bold text-md">Prediction Warning: {pred.category}</h3>
                                <p className="text-yellow-700 text-sm mt-1">{pred.message}</p>
                             </div>
                        </div>
                    </div>
                ))}
             </div>
          </div>
      )}

      {/* Transactions Table Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
             <table className="min-w-full">
                 <thead>
                     <tr className="bg-gray-50">
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                         <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                    {data?.expenses.length === 0 && data?.income.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                No transactions yet. Click "+ Add Transaction" to get started!
                            </td>
                        </tr>
                    )}
                    {data?.expenses.map((e: any) => (
                        <tr key={e.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">Expense</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.category_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">-${e.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <button
                                    onClick={() => handleDelete('EXPENSE', e.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                     {data?.income.map((i: any) => (
                        <tr key={i.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">Income</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{i.category_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">+${i.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <button
                                    onClick={() => handleDelete('INCOME', i.id)}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                 </tbody>
             </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
