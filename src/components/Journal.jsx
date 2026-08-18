import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// Simple SVG icon replacements
const BookOpen = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const Plus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

const Journal = () => {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [saving, setSaving] = useState(false)
  const [entryData, setEntryData] = useState({
    content: '',
    mood: '',
    date: new Date().toISOString().split('T')[0]
  })

  const moods = [
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'peaceful', emoji: '😌', label: 'Peaceful' },
    { value: 'excited', emoji: '🤩', label: 'Excited' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'tired', emoji: '😴', label: 'Tired' },
    { value: 'stressed', emoji: '😰', label: 'Stressed' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
    { value: 'anxious', emoji: '😨', label: 'Anxious' }
  ]

  const journalPrompts = [
    "What am I most grateful for today?",
    "How am I feeling in my body right now?",
    "What brought me joy today?",
    "What challenged me today and how did I handle it?",
    "What would make tomorrow even better?",
    "How can I show myself more compassion?",
    "What pattern am I noticing in my cycle/mood?",
    "What boundary do I need to set?",
    "What am I learning about myself?",
    "How can I honor my needs right now?"
  ]

  useEffect(() => {
    if (user) {
      fetchEntries()
    }
  }, [user])

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    }
    setLoading(false)
  }

  const saveEntry = async (e) => {
    e.preventDefault()
    if (!entryData.content.trim()) return

    setSaving(true)
    try {
      const entryToSave = {
        user_id: user.id,
        date: entryData.date,
        content: entryData.content.trim(),
        mood: entryData.mood || null
      }

      if (editingEntry) {
        // Update existing entry
        const { data, error } = await supabase
          .from('journal_entries')
          .update(entryToSave)
          .eq('id', editingEntry.id)
          .select()
          .single()

        if (error) throw error
        setEntries(prev => prev.map(entry => entry.id === editingEntry.id ? data : entry))
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('journal_entries')
          .upsert(entryToSave)
          .select()
          .single()

        if (error) throw error
        setEntries(prev => {
          const filtered = prev.filter(entry => entry.date !== data.date)
          return [data, ...filtered].sort((a, b) => new Date(b.date) - new Date(a.date))
        })
      }

      closeModal()
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Error saving entry. Please try again.')
    }
    setSaving(false)
  }

  const deleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to delete this journal entry?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      setEntries(prev => prev.filter(entry => entry.id !== entryId))
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Error deleting entry. Please try again.')
    }
  }

  const openWriteModal = (date = new Date().toISOString().split('T')[0]) => {
    const existingEntry = entries.find(entry => entry.date === date)
    
    if (existingEntry) {
      setEditingEntry(existingEntry)
      setEntryData({
        content: existingEntry.content,
        mood: existingEntry.mood || '',
        date: existingEntry.date
      })
    } else {
      setEditingEntry(null)
      setEntryData({
        content: '',
        mood: '',
        date: date
      })
    }
    setShowWriteModal(true)
  }

  const openEditModal = (entry) => {
    setEditingEntry(entry)
    setEntryData({
      content: entry.content,
      mood: entry.mood || '',
      date: entry.date
    })
    setShowWriteModal(true)
  }

  const closeModal = () => {
    setShowWriteModal(false)
    setEditingEntry(null)
    setEntryData({ content: '', mood: '', date: new Date().toISOString().split('T')[0] })
  }

  const insertPrompt = (prompt) => {
    const newContent = entryData.content ? `${entryData.content}\n\n${prompt}\n` : `${prompt}\n`
    setEntryData({ ...entryData, content: newContent })
  }

  const filteredEntries = entries.filter(entry => 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  const getMoodEmoji = (moodValue) => {
    const mood = moods.find(m => m.value === moodValue)
    return mood ? mood.emoji : ''
  }

  const getWordCount = (text) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0
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
        <h2 className="text-2xl font-heading font-semibold">Journal</h2>
        <button
          onClick={() => openWriteModal()}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </div>

      {/* Today's Entry Card */}
      <div className="card bg-gradient-purple">
        <div className="flex items-center gap-3 mb-3">
          <Heart className="w-5 h-5 text-amethyst" />
          <h3 className="font-semibold">Today's Reflection</h3>
        </div>
        
        {entries.some(entry => entry.date === new Date().toISOString().split('T')[0]) ? (
          <div>
            <p className="text-gray-600 text-sm mb-3">
              You've already written today! Great job staying consistent. 🌸
            </p>
            <button
              onClick={() => openWriteModal()}
              className="btn-secondary text-sm px-4 py-2"
            >
              Edit Today's Entry
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 text-sm mb-3">
              Take a moment to check in with yourself. How are you feeling today?
            </p>
            <button
              onClick={() => openWriteModal()}
              className="btn-secondary text-sm px-4 py-2"
            >
              Write Today's Entry
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search your entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchTerm ? 'No entries found' : 'Your Journal Awaits'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? `No entries match "${searchTerm}". Try different keywords.`
              : 'Start your wellness journey by writing your first entry. This is your safe space for reflection and growth.'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => openWriteModal()}
              className="btn-primary"
            >
              Write Your First Entry
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map(entry => (
            <div key={entry.id} className="card group hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {formatDate(entry.date)}
                  </h3>
                  {entry.mood && (
                    <span className="text-lg" title={entry.mood}>
                      {getMoodEmoji(entry.mood)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEditModal(entry)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-3 line-clamp-3">
                {entry.content}
              </p>
              
              <div className="text-xs text-gray-500">
                {getWordCount(entry.content)} words • {new Date(entry.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write/Edit Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingEntry ? 'Edit Entry' : 'New Entry'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <input
                  type="date"
                  value={entryData.date}
                  onChange={(e) => setEntryData({...entryData, date: e.target.value})}
                  className="text-sm border border-gray-200 rounded px-2 py-1"
                />
              </div>
            </div>

            <form onSubmit={saveEntry} className="space-y-4">
              {/* Mood Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">How are you feeling?</label>
                <div className="grid grid-cols-5 gap-2">
                  {moods.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setEntryData({...entryData, mood: mood.value})}
                      className={`p-2 text-center rounded-lg border transition-colors ${
                        entryData.mood === mood.value
                          ? 'bg-amethyst text-white border-amethyst'
                          : 'bg-white border-gray-200 hover:border-amethyst'
                      }`}
                      title={mood.label}
                    >
                      <div className="text-lg">{mood.emoji}</div>
                      <div className="text-xs">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Prompts */}
              <div>
                <label className="block text-sm font-medium mb-2">Need inspiration?</label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {journalPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => insertPrompt(prompt)}
                      className="block w-full text-left text-xs text-gray-600 hover:text-amethyst transition-colors p-1 rounded hover:bg-gray-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your thoughts ({getWordCount(entryData.content)} words)
                </label>
                <textarea
                  value={entryData.content}
                  onChange={(e) => setEntryData({...entryData, content: e.target.value})}
                  placeholder="Write freely... This is your safe space."
                  rows={8}
                  className="input-field resize-none"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !entryData.content.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Entry'}
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

export default Journal