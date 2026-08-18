import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// Simple SVG icon replacements
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

const Droplets = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3 3-3" />
  </svg>
)

const Plus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const PeriodTracker = () => {
  const { user, profile } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [periodLogs, setPeriodLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLogModal, setShowLogModal] = useState(false)
  const [logData, setLogData] = useState({
    flow_intensity: '',
    mood: '',
    symptoms: [],
    notes: '',
    is_period_start: false,
    is_period_end: false
  })

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'irritated', emoji: '😤', label: 'Irritated' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'energetic', emoji: '🤗', label: 'Energetic' }
  ]

  const symptoms = [
    'Cramps', 'Headache', 'Fatigue', 'Bloating', 'Nausea', 
    'Back Pain', 'Tender Breasts', 'Acne', 'Cravings', 'Insomnia'
  ]

  useEffect(() => {
    if (user) {
      fetchPeriodLogs()
    }
  }, [user, currentDate])

  const fetchPeriodLogs = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const { data, error } = await supabase
        .from('period_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])

      if (error) throw error
      setPeriodLogs(data || [])
    } catch (error) {
      console.error('Error fetching period logs:', error)
    }
    setLoading(false)
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    const existingLog = periodLogs.find(log => 
      new Date(log.date).toDateString() === date.toDateString()
    )
    
    if (existingLog) {
      setLogData({
        flow_intensity: existingLog.flow_intensity || '',
        mood: existingLog.mood || '',
        symptoms: existingLog.symptoms || [],
        notes: existingLog.notes || '',
        is_period_start: existingLog.is_period_start || false,
        is_period_end: existingLog.is_period_end || false
      })
    } else {
      setLogData({
        flow_intensity: '',
        mood: '',
        symptoms: [],
        notes: '',
        is_period_start: false,
        is_period_end: false
      })
    }
    setShowLogModal(true)
  }

  const saveLog = async () => {
    if (!selectedDate) return

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('period_logs')
        .upsert({
          user_id: user.id,
          date: dateStr,
          ...logData
        })
        .select()

      if (error) throw error
      
      await fetchPeriodLogs()
      setShowLogModal(false)
      setSelectedDate(null)
    } catch (error) {
      console.error('Error saving log:', error)
      alert('Error saving log. Please try again.')
    }
  }

  const deleteLog = async () => {
    if (!selectedDate) return

    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      const { error } = await supabase
        .from('period_logs')
        .delete()
        .eq('user_id', user.id)
        .eq('date', dateStr)

      if (error) throw error
      
      await fetchPeriodLogs()
      setShowLogModal(false)
      setSelectedDate(null)
    } catch (error) {
      console.error('Error deleting log:', error)
      alert('Error deleting log. Please try again.')
    }
  }

  const toggleSymptom = (symptom) => {
    setLogData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }))
  }

  const getLogForDate = (date) => {
    return periodLogs.find(log => 
      new Date(log.date).toDateString() === date.toDateString()
    )
  }

  const getDayClass = (date) => {
    const log = getLogForDate(date)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    let classes = 'w-10 h-10 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all duration-200 '
    
    if (isToday) {
      classes += 'ring-2 ring-amethyst '
    }
    
    if (log) {
      if (log.is_period_start || log.is_period_end || log.flow_intensity) {
        classes += 'bg-red-100 text-red-700 hover:bg-red-200 '
      } else {
        classes += 'bg-amethyst text-white hover:bg-opacity-80 '
      }
    } else {
      classes += 'hover:bg-gray-100 '
    }
    
    return classes
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const predictNextPeriod = () => {
    if (!profile?.cycle_length || !profile?.last_period_date) return null
    
    const lastPeriod = new Date(profile.last_period_date)
    const cycleLength = profile.cycle_length
    const nextPeriod = new Date(lastPeriod)
    nextPeriod.setDate(lastPeriod.getDate() + cycleLength)
    
    const today = new Date()
    const daysUntil = Math.ceil((nextPeriod - today) / (1000 * 60 * 60 * 24))
    
    return { date: nextPeriod, daysUntil }
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const prediction = predictNextPeriod()

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
        <h2 className="text-2xl font-heading font-semibold">Period Tracker</h2>
        <Calendar className="w-6 h-6 text-amethyst" />
      </div>

      {/* Prediction Card */}
      {prediction && (
        <div className="card bg-gradient-purple">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-5 h-5 text-amethyst" />
            <h3 className="font-semibold">Next Period Prediction</h3>
          </div>
          <p className="text-gray-600">
            {prediction.daysUntil > 0 
              ? `Expected in ${prediction.daysUntil} days (${prediction.date.toLocaleDateString()})`
              : prediction.daysUntil === 0 
                ? 'Expected today'
                : `${Math.abs(prediction.daysUntil)} days overdue`
            }
          </p>
        </div>
      )}

      {/* Calendar Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar().map((date, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              className={getDayClass(date)}
              disabled={date.getMonth() !== currentDate.getMonth()}
            >
              {date.getDate()}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 rounded-full"></div>
              <span>Period Days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amethyst rounded-full"></div>
              <span>Logged Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Log for {selectedDate?.toLocaleDateString()}
            </h3>

            <div className="space-y-4">
              {/* Period Start/End */}
              <div>
                <label className="block text-sm font-medium mb-2">Period Status</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={logData.is_period_start}
                      onChange={(e) => setLogData({...logData, is_period_start: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Period started</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={logData.is_period_end}
                      onChange={(e) => setLogData({...logData, is_period_end: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Period ended</span>
                  </label>
                </div>
              </div>

              {/* Flow Intensity */}
              <div>
                <label className="block text-sm font-medium mb-2">Flow Intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  {['light', 'medium', 'heavy'].map(intensity => (
                    <button
                      key={intensity}
                      onClick={() => setLogData({...logData, flow_intensity: intensity})}
                      className={`py-2 px-3 text-xs rounded-lg border transition-colors capitalize ${
                        logData.flow_intensity === intensity
                          ? 'bg-amethyst text-white border-amethyst'
                          : 'bg-white border-gray-200 hover:border-amethyst'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium mb-2">Mood</label>
                <div className="grid grid-cols-3 gap-2">
                  {moods.map(mood => (
                    <button
                      key={mood.value}
                      onClick={() => setLogData({...logData, mood: mood.value})}
                      className={`py-2 px-3 text-xs rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                        logData.mood === mood.value
                          ? 'bg-amethyst text-white border-amethyst'
                          : 'bg-white border-gray-200 hover:border-amethyst'
                      }`}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium mb-2">Symptoms</label>
                <div className="grid grid-cols-2 gap-2">
                  {symptoms.map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`py-2 px-3 text-xs rounded-lg border transition-colors ${
                        logData.symptoms.includes(symptom)
                          ? 'bg-amethyst text-white border-amethyst'
                          : 'bg-white border-gray-200 hover:border-amethyst'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={logData.notes}
                  onChange={(e) => setLogData({...logData, notes: e.target.value})}
                  placeholder="How are you feeling today?"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={saveLog}
                className="flex-1 btn-primary"
              >
                Save Log
              </button>
              {getLogForDate(selectedDate) && (
                <button
                  onClick={deleteLog}
                  className="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => setShowLogModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PeriodTracker