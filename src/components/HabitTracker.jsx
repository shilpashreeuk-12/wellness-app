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

const Target = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const Trash2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Edit = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Flame = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 1-4 4-4 1.657 0 3 .895 3 2 0 1-1 2-1 2 1 0 2 1 2 2z" />
  </svg>
)

const HabitTracker = () => {
  const { user } = useAuth()
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [newHabit, setNewHabit] = useState({ name: '', description: '' })
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    if (user) {
      fetchHabits()
      fetchHabitLogs()
    }
  }, [user])

  const fetchHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setHabits(data || [])
    } catch (error) {
      console.error('Error fetching habits:', error)
    }
  }

  const fetchHabitLogs = async () => {
    try {
      // Get logs for the last 100 days for the heatmap
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 100)

      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      if (error) throw error
      setHabitLogs(data || [])
    } catch (error) {
      console.error('Error fetching habit logs:', error)
    }
    setLoading(false)
  }

  const addHabit = async (e) => {
    e.preventDefault()
    if (!newHabit.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: newHabit.name.trim(),
          description: newHabit.description.trim()
        })
        .select()
        .single()

      if (error) throw error
      
      setHabits(prev => [...prev, data])
      setNewHabit({ name: '', description: '' })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding habit:', error)
      alert('Error adding habit. Please try again.')
    }
  }

  const updateHabit = async (e) => {
    e.preventDefault()
    if (!editingHabit || !newHabit.name.trim()) return

    try {
      const { data, error } = await supabase
        .from('habits')
        .update({
          name: newHabit.name.trim(),
          description: newHabit.description.trim()
        })
        .eq('id', editingHabit.id)
        .select()
        .single()

      if (error) throw error
      
      setHabits(prev => prev.map(h => h.id === editingHabit.id ? data : h))
      setEditingHabit(null)
      setNewHabit({ name: '', description: '' })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error updating habit:', error)
      alert('Error updating habit. Please try again.')
    }
  }

  const deleteHabit = async (habitId) => {
    if (!confirm('Are you sure you want to delete this habit? This will also remove all associated logs.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)

      if (error) throw error
      
      setHabits(prev => prev.filter(h => h.id !== habitId))
      setHabitLogs(prev => prev.filter(log => log.habit_id !== habitId))
    } catch (error) {
      console.error('Error deleting habit:', error)
      alert('Error deleting habit. Please try again.')
    }
  }

  const toggleHabitLog = async (habitId, date) => {
    const dateStr = date.toISOString().split('T')[0]
    const existingLog = habitLogs.find(log => 
      log.habit_id === habitId && log.date === dateStr
    )

    try {
      if (existingLog) {
        // Remove the log
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existingLog.id)

        if (error) throw error
        
        setHabitLogs(prev => prev.filter(log => log.id !== existingLog.id))
      } else {
        // Add the log
        const { data, error } = await supabase
          .from('habit_logs')
          .insert({
            user_id: user.id,
            habit_id: habitId,
            date: dateStr,
            completed: true
          })
          .select()
          .single()

        if (error) throw error
        
        setHabitLogs(prev => [...prev, data])
      }
    } catch (error) {
      console.error('Error toggling habit log:', error)
      alert('Error updating habit. Please try again.')
    }
  }

  const getStreakForHabit = (habitId) => {
    const today = new Date()
    let streak = 0
    let currentDate = new Date(today)

    // Count backwards from today until we find a day without a log
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const hasLog = habitLogs.some(log => 
        log.habit_id === habitId && log.date === dateStr && log.completed
      )
      
      if (hasLog) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const isHabitCompletedOnDate = (habitId, date) => {
    const dateStr = date.toISOString().split('T')[0]
    return habitLogs.some(log => 
      log.habit_id === habitId && log.date === dateStr && log.completed
    )
  }

  const getTodaysLogs = () => {
    const today = new Date().toISOString().split('T')[0]
    return habitLogs.filter(log => log.date === today)
  }

  const openEditModal = (habit) => {
    setEditingHabit(habit)
    setNewHabit({ name: habit.name, description: habit.description || '' })
    setShowAddModal(true)
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingHabit(null)
    setNewHabit({ name: '', description: '' })
  }

  // Generate dates for the mini heatmap (last 30 days)
  const generateHeatmapDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(date)
    }
    return dates
  }

  const heatmapDates = generateHeatmapDates()
  const todaysLogs = getTodaysLogs()

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
        <h2 className="text-2xl font-heading font-semibold">Habit Tracker</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </button>
      </div>

      {/* Today's Progress */}
      <div className="card bg-gradient-purple">
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-5 h-5 text-amethyst" />
          <h3 className="font-semibold">Today's Progress</h3>
        </div>
        <p className="text-gray-600">
          {todaysLogs.length} of {habits.length} habits completed
        </p>
        {habits.length > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-amethyst h-2 rounded-full transition-all duration-300"
                style={{ width: `${habits.length ? (todaysLogs.length / habits.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="card text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
          <p className="text-gray-600 mb-4">
            Start building healthy habits to improve your wellness journey
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map(habit => {
            const streak = getStreakForHabit(habit.id)
            const isCompletedToday = isHabitCompletedOnDate(habit.id, new Date())
            
            return (
              <div key={habit.id} className="card">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleHabitLog(habit.id, new Date())}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isCompletedToday
                        ? 'bg-amethyst border-amethyst text-white'
                        : 'border-gray-300 hover:border-amethyst'
                    }`}
                  >
                    {isCompletedToday && <Check className="w-4 h-4" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-sm text-gray-600 mt-1">{habit.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {streak > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="font-medium text-orange-600">{streak}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(habit)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteHabit(habit.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mini heatmap for this habit */}
                    <div className="mt-3 flex gap-1 overflow-x-auto">
                      {heatmapDates.map((date, index) => {
                        const isCompleted = isHabitCompletedOnDate(habit.id, date)
                        const isToday = date.toDateString() === new Date().toDateString()
                        
                        return (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-sm flex-shrink-0 ${
                              isCompleted 
                                ? 'bg-amethyst' 
                                : 'bg-gray-200'
                            } ${isToday ? 'ring-1 ring-gray-400' : ''}`}
                            title={`${date.toLocaleDateString()} - ${isCompleted ? 'Completed' : 'Not completed'}`}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingHabit ? 'Edit Habit' : 'Add New Habit'}
            </h3>

            <form onSubmit={editingHabit ? updateHabit : addHabit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  placeholder="e.g., Drink 8 glasses of water"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
                  placeholder="Why is this habit important to you?"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingHabit ? 'Update Habit' : 'Add Habit'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HabitTracker