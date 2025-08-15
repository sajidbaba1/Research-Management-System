import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { budgetApi, Budget, CreateBudgetRequest, UpdateBudgetRequest } from '../services/api';
import { 
  Plus, Search, Filter, Edit2, Trash2, DollarSign, TrendingUp, TrendingDown,
  Calendar, AlertTriangle, CheckCircle, X, Save, PieChart, BarChart3
} from 'lucide-react';

interface BudgetManagementProps {
  projectId?: number;
}

const BudgetManagement: React.FC<BudgetManagementProps> = ({ projectId }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [viewType, setViewType] = useState<'list' | 'chart'>('list');
  
  const [newBudget, setNewBudget] = useState<CreateBudgetRequest>({
    category: '',
    allocatedAmount: 0,
    spentAmount: 0,
    description: '',
    startDate: '',
    endDate: '',
    projectId: projectId || 0
  });

  const { data: budgets = [], isLoading, error } = useQuery({
    queryKey: projectId ? ['project-budget', projectId] : ['budgets'],
    queryFn: () => projectId 
      ? budgetApi.getBudgetByProject(projectId, token!)
      : budgetApi.getAllBudgets(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const createBudgetMutation = useMutation({
    mutationFn: (budgetData: CreateBudgetRequest) => budgetApi.createBudget(budgetData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-budget', projectId] : ['budgets'] });
      setShowCreateModal(false);
      resetNewBudget();
    }
  });

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBudgetRequest }) => 
      budgetApi.updateBudget(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-budget', projectId] : ['budgets'] });
      setEditingBudget(null);
    }
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (budgetId: number) => budgetApi.deleteBudget(budgetId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-budget', projectId] : ['budgets'] });
    }
  });

  const resetNewBudget = () => {
    setNewBudget({
      category: '',
      allocatedAmount: 0,
      spentAmount: 0,
      description: '',
      startDate: '',
      endDate: '',
      projectId: projectId || 0
    });
  };

  const handleCreateBudget = () => {
    createBudgetMutation.mutate(newBudget);
  };

  const handleUpdateBudget = () => {
    if (editingBudget) {
      updateBudgetMutation.mutate({
        id: editingBudget.id,
        data: {
          category: editingBudget.category,
          allocatedAmount: editingBudget.allocatedAmount,
          spentAmount: editingBudget.spentAmount,
          description: editingBudget.description,
          startDate: editingBudget.startDate,
          endDate: editingBudget.endDate
        }
      });
    }
  };

  const handleDeleteBudget = (budgetId: number) => {
    if (window.confirm('Are you sure you want to delete this budget item?')) {
      deleteBudgetMutation.mutate(budgetId);
    }
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || budget.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const calculateTotals = () => {
    const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
    const totalRemaining = totalAllocated - totalSpent;
    const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    
    return { totalAllocated, totalSpent, totalRemaining, utilizationRate };
  };

  const getUtilizationStatus = (allocated: number, spent: number) => {
    const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
    if (percentage > 100) return { color: 'text-red-600', bg: 'bg-red-100' };
    if (percentage > 90) return { color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getUniqueCategories = () => {
    return Array.from(new Set(budgets.map(b => b.category)));
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        Failed to load budget data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {projectId ? 'Project Budget' : 'Budget Management'}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totals.totalAllocated.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Allocated</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totals.totalSpent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center gap-3">
            <TrendingUp className={`w-8 h-8 ${totals.totalRemaining >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
            <div>
              <p className={`text-2xl font-bold ${totals.totalRemaining >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
                ${totals.totalRemaining.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex items-center gap-3">
            <PieChart className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totals.utilizationRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Utilization</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search budget items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          >
            <option value="ALL">All Categories</option>
            {getUniqueCategories().map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Items: {filteredBudgets.length}
        </div>
      </div>

      {/* Budget Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBudgets.map((budget) => {
          const remaining = budget.allocatedAmount - budget.spentAmount;
          const utilization = budget.allocatedAmount > 0 ? (budget.spentAmount / budget.allocatedAmount) * 100 : 0;
          const status = getUtilizationStatus(budget.allocatedAmount, budget.spentAmount);
          
          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {budget.category}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingBudget(budget)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Allocated:</span>
                  <span className="font-medium">${budget.allocatedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Spent:</span>
                  <span className="font-medium">${budget.spentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                  <span className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${remaining.toLocaleString()}
                  </span>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Utilization</span>
                    <span className={`font-medium ${status.color}`}>{utilization.toFixed(1)}%</span>
                  </div>
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        utilization > 100 ? 'bg-red-500' :
                        utilization > 90 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {budget.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">
                  {budget.description}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredBudgets.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No budget items found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Get started by adding your first budget item
          </p>
        </div>
      )}

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add Budget Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category"
                value={newBudget.category}
                onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Allocated Amount"
                value={newBudget.allocatedAmount}
                onChange={(e) => setNewBudget({...newBudget, allocatedAmount: Number(e.target.value)})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Spent Amount"
                value={newBudget.spentAmount}
                onChange={(e) => setNewBudget({...newBudget, spentAmount: Number(e.target.value)})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="date"
                value={newBudget.startDate}
                onChange={(e) => setNewBudget({...newBudget, startDate: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <textarea
              placeholder="Description"
              value={newBudget.description}
              onChange={(e) => setNewBudget({...newBudget, description: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBudget}
                disabled={createBudgetMutation.isPending}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {createBudgetMutation.isPending ? 'Adding...' : 'Add Budget'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {editingBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Budget Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Category"
                value={editingBudget.category}
                onChange={(e) => setEditingBudget({...editingBudget, category: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Allocated Amount"
                value={editingBudget.allocatedAmount}
                onChange={(e) => setEditingBudget({...editingBudget, allocatedAmount: Number(e.target.value)})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingBudget(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateBudget}
                disabled={updateBudgetMutation.isPending}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {updateBudgetMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;
