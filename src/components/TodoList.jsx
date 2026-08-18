import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
// Simple SVG icon replacements
const Plus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const Check = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const Trash2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const Flag = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2h7a2 2 0 012 2v6a2 2 0 01-2 2H12l-1-2H5a2 2 0 00-2 2z" />
  </svg>
)

const Filter = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
)

const TodoList = () => {
  const { user } = useAuth()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTodo, setNewTodo] = useState('')
  const [newTodoDueDate, setNewTodoDueDate] = useState('')
  const [newTodoPriority, setNewTodoPriority] = useState('medium')
  const [filter, setFilter] = useState('all') // all, active, completed
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
    setLoading(false)
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    setIsAdding(true)
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: user.id,
          title: newTodo.trim(),
          due_date: newTodoDueDate || null,
          priority: newTodoPriority
        })
        .select()
        .single()

      if (error) throw error
      
      setTodos(prev => [data, ...prev])
      setNewTodo('')
      setNewTodoDueDate('')
      setNewTodoPriority('medium')
    } catch (error) {
      console.error('Error adding todo:', error)
      alert('Error adding task. Please try again.')
    }
    setIsAdding(false)
  }

  const toggleTodo = async (id, completed) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id)

      if (error) throw error
      
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      )
    } catch (error) {
      console.error('Error updating todo:', error)
      alert('Error updating task. Please try again.')
    }
  }

  const deleteTodo = async (id) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setTodos(prev => prev.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
      alert('Error deleting task. Please try again.')
    }
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50'
      case 'medium': return 'text-amethyst bg-amethyst/10'
      case 'low': return 'text-gray-500 bg-gray-50'
      default: return 'text-amethyst bg-amethyst/10'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString()
  }

  const isOverdue = (dateString) => {
    if (!dateString) return false
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="w-6 h-6 border-4 border-amethyst border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-semibold">To-Do List</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white focus:border-amethyst focus:ring-1 focus:ring-amethyst/20"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Add new todo form */}
      <div className="card">
        <form onSubmit={addTodo} className="space-y-4">
          <div>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="input-field"
              disabled={isAdding}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Due Date (optional)
              </label>
              <input
                type="date"
                value={newTodoDueDate}
                onChange={(e) => setNewTodoDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-amethyst focus:ring-1 focus:ring-amethyst/20"
                disabled={isAdding}
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Priority
              </label>
              <select
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-amethyst focus:ring-1 focus:ring-amethyst/20"
                disabled={isAdding}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!newTodo.trim() || isAdding}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>

      {/* Todo list */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-gray-400 mb-2">
              {filter === 'active' && todos.some(t => t.completed) ? 
                '🎉 All tasks completed!' : 
                filter === 'completed' ? 
                'No completed tasks yet' :
                'No tasks yet'
              }
            </div>
            <p className="text-sm text-gray-500">
              {filter === 'active' && todos.some(t => t.completed) ? 
                'Great job! You\'ve completed all your tasks.' :
                'Add your first task to get started on your wellness journey'
              }
            </p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div 
              key={todo.id} 
              className={`card transition-all duration-200 ${
                todo.completed ? 'bg-gray-50/80' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                    todo.completed 
                      ? 'bg-amethyst border-amethyst text-white' 
                      : 'border-gray-300 hover:border-amethyst'
                  }`}
                >
                  {todo.completed && <Check className="w-3 h-3" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium transition-all duration-200 ${
                    todo.completed 
                      ? 'text-gray-500 line-through' 
                      : 'text-gray-900'
                  }`}>
                    {todo.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 mt-1">
                    {todo.priority && (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(todo.priority)}`}>
                        <Flag className="w-3 h-3" />
                        {todo.priority}
                      </span>
                    )}
                    
                    {todo.due_date && (
                      <span className={`inline-flex items-center gap-1 text-xs ${
                        isOverdue(todo.due_date) && !todo.completed
                          ? 'text-red-500 font-medium'
                          : 'text-gray-500'
                      }`}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(todo.due_date)}
                        {isOverdue(todo.due_date) && !todo.completed && ' (Overdue)'}
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {todos.length > 0 && (
        <div className="card bg-amethyst/5 border-amethyst/20">
          <div className="text-sm text-gray-600 text-center">
            {todos.filter(t => t.completed).length} of {todos.length} tasks completed
            {todos.filter(t => !t.completed && t.due_date && isOverdue(t.due_date)).length > 0 && (
              <span className="text-red-500 ml-2">
                • {todos.filter(t => !t.completed && t.due_date && isOverdue(t.due_date)).length} overdue
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TodoList