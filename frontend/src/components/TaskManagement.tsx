import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { tasksApi, Task, CreateTaskRequest, UpdateTaskRequest } from '../services/api';
import { 
  Plus, Search, Filter, Edit2, Trash2, CheckCircle, Clock, AlertCircle,
  Calendar, User, Tag, FileText, X, Save
} from 'lucide-react';

interface TaskManagementProps {
  projectId?: number;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ projectId }) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [newTask, setNewTask] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
    estimatedHours: 0,
    projectId: projectId || 0,
    assignedToId: 0
  });

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: projectId ? ['project-tasks', projectId] : ['tasks'],
    queryFn: () => projectId 
      ? tasksApi.getTasksByProject(projectId, token!)
      : tasksApi.getAllTasks(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData: CreateTaskRequest) => tasksApi.createTask(taskData, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-tasks', projectId] : ['tasks'] });
      setShowCreateModal(false);
      resetNewTask();
    },
    onError: (error: any) => {
      console.error('Error creating task:', error);
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskRequest }) => 
      tasksApi.updateTask(id, data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-tasks', projectId] : ['tasks'] });
      setEditingTask(null);
    },
    onError: (error: any) => {
      console.error('Error updating task:', error);
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => tasksApi.deleteTask(taskId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectId ? ['project-tasks', projectId] : ['tasks'] });
    },
    onError: (error: any) => {
      console.error('Error deleting task:', error);
    }
  });

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: '',
      estimatedHours: 0,
      projectId: projectId || 0,
      assignedToId: 0
    });
  };

  const handleCreateTask = () => {
    createTaskMutation.mutate(newTask);
  };

  const handleUpdateTask = () => {
    if (editingTask) {
      updateTaskMutation.mutate({
        id: editingTask.id,
        data: {
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          dueDate: editingTask.dueDate,
          estimatedHours: editingTask.estimatedHours,
          assignedToId: editingTask.assignedToId
        }
      });
    }
  };

  const handleDeleteTask = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'PENDING': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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
        Failed to load tasks. Please try again.
        <button onClick={() => queryClient.invalidateQueries({ queryKey: ['tasks'] })} className="ml-2 text-blue-500 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {projectId ? 'Project Tasks' : 'Task Management'}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full dark:bg-gray-700 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="ALL">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          Total: {filteredTasks.length} tasks
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task: Task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {task.title}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="text-blue-500 hover:text-blue-700 p-1"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {task.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {task.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}

                {task.estimatedHours > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    Est: {task.estimatedHours}h
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterStatus !== 'ALL' || filterPriority !== 'ALL'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first task'}
          </p>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create New Task</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Estimated Hours"
                value={newTask.estimatedHours}
                onChange={(e) => setNewTask({...newTask, estimatedHours: Number(e.target.value)})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={newTask.status}
                onChange={(e) => setNewTask({...newTask, status: e.target.value as any})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <input
                type="date"
                placeholder="Due Date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Assigned To (User ID)"
                value={newTask.assignedToId}
                onChange={(e) => setNewTask({...newTask, assignedToId: Number(e.target.value)})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <textarea
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Edit Task</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Task Title"
                value={editingTask.title}
                onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Estimated Hours"
                value={editingTask.estimatedHours}
                onChange={(e) => setEditingTask({...editingTask, estimatedHours: Number(e.target.value)})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <select
                value={editingTask.status}
                onChange={(e) => setEditingTask({...editingTask, status: e.target.value as any})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <select
                value={editingTask.priority}
                onChange={(e) => setEditingTask({...editingTask, priority: e.target.value as any})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <input
                type="date"
                placeholder="Due Date"
                value={editingTask.dueDate}
                onChange={(e) => setEditingTask({...editingTask, dueDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="number"
                placeholder="Assigned To (User ID)"
                value={editingTask.assignedToId}
                onChange={(e) => setEditingTask({...editingTask, assignedToId: Number(e.target.value)})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <textarea
              placeholder="Task Description"
              value={editingTask.description}
              onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-4"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={updateTaskMutation.isPending}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
