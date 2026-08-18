import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// Simple SVG icon replacements
const Bell = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const Plus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const Heart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const Target = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
)

const Edit = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const Trash2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const Toggle = ({ className, enabled }) => (
  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    enabled ? 'bg-amethyst' : 'bg-gray-200'
  }`}>
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </div>
)

const Reminders = () => {
  const { user, profile } = useAuth()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notificationsSupported, setNotificationsSupported] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_type: 'custom',
    reminder_time: '09:00',
    reminder_days: [1, 2, 3, 4, 5] // Monday to Friday by default
  })

  const reminderTypes = [
    { value: 'custom', label: 'Custom Reminder', icon: Bell },
    { value: 'habit', label: 'Daily Habit Check-in', icon: Target },
    { value: 'period', label: 'Period Tracking', icon: Heart }
  ]

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const predefinedReminders = [
    { title: 'Morning Check-in', description: 'Take a moment to set your intention for the day 🌸', time: '09:00' },
    { title: 'Hydration Reminder', description: 'Time for a glass of water! Stay hydrated 💧', time: '14:00' },
    { title: 'Evening Reflection', description: 'How are you feeling? Consider writing in your journal ✨', time: '20:00' },
    { title: 'Skincare Routine', description: 'Don\'t forget your skincare routine! You deserve this care 💆‍♀️', time: '21:00' },
    { title: 'Gratitude Moment', description: 'What are you grateful for today? 🙏', time: '22:00' }
  ]

  useEffect(() => {
    if (user) {
      fetchReminders()
      checkNotificationSupport()
    }
  }, [user])

  const checkNotificationSupport = () => {
    if ('Notification' in window) {
      setNotificationsSupported(true)
      setNotificationPermission(Notification.permission)
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      return permission === 'granted'
    }
    return false
  }

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReminders(data || [])
    } catch (error) {
      console.error('Error fetching reminders:', error)
    }
    setLoading(false)
  }

  const saveReminder = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSaving(true)
    try {
      const reminderData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        reminder_type: formData.reminder_type,
        reminder_time: formData.reminder_time,
        reminder_days: formData.reminder_days,
        is_active: true
      }

      if (editingReminder) {
        const { data, error } = await supabase
          .from('reminders')
          .update(reminderData)
          .eq('id', editingReminder.id)
          .select()
          .single()

        if (error) throw error
        setReminders(prev => prev.map(r => r.id === editingReminder.id ? data : r))
      } else {
        const { data, error } = await supabase
          .from('reminders')
          .insert(reminderData)
          .select()
          .single()

        if (error) throw error
        setReminders(prev => [data, ...prev])
      }

      closeModal()
    } catch (error) {
      console.error('Error saving reminder:', error)
      alert('Error saving reminder. Please try again.')
    }
    setSaving(false)
  }

  const toggleReminder = async (reminderId, isActive) => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update({ is_active: !isActive })
        .eq('id', reminderId)
        .select()
        .single()

      if (error) throw error
      setReminders(prev => prev.map(r => r.id === reminderId ? data : r))
    } catch (error) {
      console.error('Error toggling reminder:', error)
      alert('Error updating reminder. Please try again.')
    }
  }

  const deleteReminder = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)

      if (error) throw error
      setReminders(prev => prev.filter(r => r.id !== reminderId))
    } catch (error) {
      console.error('Error deleting reminder:', error)
      alert('Error deleting reminder. Please try again.')
    }
  }

  const openEditModal = (reminder) => {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      reminder_type: reminder.reminder_type,
      reminder_time: reminder.reminder_time,
      reminder_days: reminder.reminder_days || [1, 2, 3, 4, 5]
    })
    setShowAddModal(true)
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingReminder(null)
    setFormData({
      title: '',
      description: '',
      reminder_type: 'custom',
      reminder_time: '09:00',
      reminder_days: [1, 2, 3, 4, 5]
    })
  }

  const toggleDay = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      reminder_days: prev.reminder_days.includes(dayIndex)
        ? prev.reminder_days.filter(d => d !== dayIndex)
        : [...prev.reminder_days, dayIndex]
    }))
  }

  const usePredefinedReminder = (predefined) => {
    setFormData(prev => ({
      ...prev,
      title: predefined.title,
      description: predefined.description,
      reminder_time: predefined.time
    }))
  }

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':')
    const hour12 = hours % 12 || 12
    const ampm = hours >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  const formatDays = (dayIndices) => {
    if (dayIndices.length === 7) return 'Every day'
    if (dayIndices.length === 0) return 'Never'
    
    const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return dayIndices.map(i => dayAbbrevs[i]).join(', ')
  }

  const getNextPeriodPrediction = () => {
    if (!profile?.cycle_length || !profile?.last_period_date) return null
    
    const lastPeriod = new Date(profile.last_period_date)
    const cycleLength = profile.cycle_length
    const nextPeriod = new Date(lastPeriod)
    nextPeriod.setDate(lastPeriod.getDate() + cycleLength)
    
    const today = new Date()
    const daysUntil = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24))
    
    return { date: nextPeriod, daysUntil }
  }

  const prediction = getNextPeriodPrediction()
  const activeReminders = reminders.filter(r => r.is_active).length

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
        <h2 className="text-2xl font-heading font-semibold">Reminders</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      </div>

      {/* Notification Permission */}
      {notificationsSupported && notificationPermission !== 'granted' && (
        <div className="card bg-gradient-purple">
          <div className="flex items-center gap-3 mb-3">
            <Bell className="w-5 h-5 text-amethyst" />
            <h3 className="font-semibold">Enable Notifications</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Allow notifications to receive gentle reminders for your wellness activities.
          </p>
          <button
            onClick={requestNotificationPermission}
            className="btn-secondary text-sm px-4 py-2"
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Smart Predictions */}
      {prediction && (
        <div className="card bg-gradient-purple">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5 text-amethyst" />
            <h3 className="font-semibold">Smart Predictions</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Your period is predicted {prediction.daysUntil > 0 
              ? `in ${prediction.daysUntil} days`
              : prediction.daysUntil === 0 
                ? 'today'
                : `${Math.abs(prediction.daysUntil)} days ago`
            }. We'll remind you 2 days before! 💜
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <Bell className="w-6 h-6 text-amethyst mx-auto mb-2" />
          <p className="text-lg font-semibold text-dolphin">{activeReminders}</p>
          <p className="text-sm text-gray-600">Active Reminders</p>
        </div>
        
        <div className="card text-center">
          <Clock className="w-6 h-6 text-amethyst mx-auto mb-2" />
          <p className="text-lg font-semibold text-dolphin">
            {reminders.length > 0 ? formatTime(reminders.find(r => r.is_active)?.reminder_time || '09:00') : '--'}
          </p>
          <p className="text-sm text-gray-600">Next Reminder</p>
        </div>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="card text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reminders Yet</h3>
          <p className="text-gray-600 mb-6">
            Set up gentle reminders to support your wellness journey. 
            Small consistent actions create lasting change! ✨
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Create Your First Reminder
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map(reminder => {
            const TypeIcon = reminderTypes.find(t => t.value === reminder.reminder_type)?.icon || Bell
            
            return (
              <div key={reminder.id} className="card">
                <div className="flex items-center gap-4">
                  <TypeIcon className="w-5 h-5 text-amethyst flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${reminder.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                        {reminder.title}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleReminder(reminder.id, reminder.is_active)}
                          className="p-1"
                        >
                          <Toggle enabled={reminder.is_active} />
                        </button>
                        
                        <button
                          onClick={() => openEditModal(reminder)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {reminder.description && (
                      <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(reminder.reminder_time)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDays(reminder.reminder_days)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingReminder ? 'Edit Reminder' : 'New Reminder'}
            </h3>

            <form onSubmit={saveReminder} className="space-y-4">
              {/* Predefined Options */}
              {!editingReminder && (
                <div>
                  <label className="block text-sm font-medium mb-2">Quick Setup</label>
                  <div className="space-y-2">
                    {predefinedReminders.map((predefined, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => usePredefinedReminder(predefined)}
                        className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-amethyst transition-colors"
                      >
                        <div className="font-medium text-sm">{predefined.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{predefined.description}</div>
                      </button>
                    ))}
                  </div>
                  <div className="text-center text-sm text-gray-500 my-4">or create custom</div>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={formData.reminder_type}
                  onChange={(e) => setFormData({...formData, reminder_type: e.target.value})}
                  className="input-field"
                >
                  {reminderTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Reminder Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Take vitamins"
                  className="input-field"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="A gentle reminder message..."
                  rows={2}
                  className="input-field resize-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={formData.reminder_time}
                  onChange={(e) => setFormData({...formData, reminder_time: e.target.value})}
                  className="input-field"
                />
              </div>

              {/* Days */}
              <div>
                <label className="block text-sm font-medium mb-2">Repeat On</label>
                <div className="grid grid-cols-4 gap-2">
                  {dayNames.map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        formData.reminder_days.includes(index)
                          ? 'bg-amethyst text-white border-amethyst'
                          : 'bg-white border-gray-200 hover:border-amethyst'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !formData.title.trim() || formData.reminder_days.length === 0}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving 
                    ? 'Saving...' 
                    : editingReminder 
                      ? 'Update Reminder' 
                      : 'Create Reminder'
                  }
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
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

export default Reminders