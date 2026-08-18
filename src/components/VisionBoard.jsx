import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// Simple SVG icon replacements
const Plus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const ImageIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

const Upload = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const Heart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const VisionBoard = () => {
  const { user } = useAuth()
  const [visionItems, setVisionItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageFile: null
  })

  useEffect(() => {
    if (user) {
      fetchVisionItems()
    }
  }, [user])

  const fetchVisionItems = async () => {
    try {
      const { data, error } = await supabase
        .from('vision_board_items')
        .select('*')
        .eq('user_id', user.id)
        .order('position_index', { ascending: true })

      if (error) throw error
      setVisionItems(data || [])
    } catch (error) {
      console.error('Error fetching vision items:', error)
    }
    setLoading(false)
  }

  const uploadImage = async (file) => {
    try {
      console.log('🔄 Attempting cloud storage upload...')
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      // Try uploading to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('vision-board')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.log('❌ Storage upload failed:', uploadError.message)
        console.log('📝 Using local storage fallback')
        // Fallback to local storage
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('vision-board')
        .getPublicUrl(fileName)

      console.log('✅ Cloud storage upload successful!')
      return urlData.publicUrl
      
    } catch (error) {
      console.log('❌ Storage error:', error.message)
      console.log('📝 Using local storage fallback')
      // Fallback to local storage
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    }
  }

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      setFormData({ ...formData, imageFile: file })
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => setSelectedImage(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const saveVisionItem = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setUploading(true)
    try {
      let imageUrl = editingItem?.image_url

      // Upload new image if selected
      if (formData.imageFile) {
        imageUrl = await uploadImage(formData.imageFile)
      }

      const itemData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        image_url: imageUrl,
        position_index: editingItem ? editingItem.position_index : visionItems.length
      }

      if (editingItem) {
        // Update existing item
        const { data, error } = await supabase
          .from('vision_board_items')
          .update(itemData)
          .eq('id', editingItem.id)
          .select()
          .single()

        if (error) throw error
        setVisionItems(prev => prev.map(item => item.id === editingItem.id ? data : item))
      } else {
        // Create new item
        const { data, error } = await supabase
          .from('vision_board_items')
          .insert(itemData)
          .select()
          .single()

        if (error) throw error
        setVisionItems(prev => [...prev, data])
      }

      closeModal()
    } catch (error) {
      console.error('Error saving vision item:', error)
      alert('Error saving item. Please try again.')
    }
    setUploading(false)
  }

  const deleteVisionItem = async (itemId, imageUrl) => {
    if (!confirm('Are you sure you want to delete this vision board item?')) {
      return
    }

    try {
      // Delete from database
      const { error } = await supabase
        .from('vision_board_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      // Delete image from storage if it exists and it's not a data URL (local storage)
      if (imageUrl && !imageUrl.startsWith('data:')) {
        try {
          const fileName = imageUrl.split('/').pop()
          const filePath = `${user.id}/${fileName}`
          await supabase.storage
            .from('vision-board')
            .remove([filePath])
        } catch (storageError) {
          console.log('📝 Could not delete from storage (might be using local fallback):', storageError.message)
        }
      }

      setVisionItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error) {
      console.error('Error deleting vision item:', error)
      alert('Error deleting item. Please try again.')
    }
  }

  const openEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      imageFile: null
    })
    setSelectedImage(item.image_url)
    setShowAddModal(true)
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingItem(null)
    setFormData({ title: '', description: '', imageFile: null })
    setSelectedImage(null)
    // Reset file input
    const fileInput = document.getElementById('image-upload')
    if (fileInput) fileInput.value = ''
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
        <h2 className="text-2xl font-heading font-semibold">Vision Board</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Vision
        </button>
      </div>

      {/* Inspiration Message */}
      <div className="card bg-gradient-purple text-center">
        <Heart className="w-6 h-6 text-amethyst mx-auto mb-2" />
        <h3 className="font-semibold mb-2">Visualize Your Dreams</h3>
        <p className="text-gray-600 text-sm">
          Create a visual representation of your goals and aspirations. 
          What you focus on grows! ✨
        </p>
      </div>

      {/* Vision Board Grid */}
      {visionItems.length === 0 ? (
        <div className="card text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your Vision Board Awaits</h3>
          <p className="text-gray-600 mb-6">
            Start by adding images and goals that inspire you. 
            Your future self will thank you!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            Add Your First Vision
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {visionItems.map(item => (
            <div key={item.id} className="card group hover:shadow-md transition-shadow duration-200">
              {/* Image */}
              {item.image_url && (
                <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteVisionItem(item.id, item.image_url)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Vision' : 'Add New Vision'}
            </h3>

            <form onSubmit={saveVisionItem} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Image</label>
                <div className="space-y-3">
                  {/* File Input */}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      {selectedImage ? (
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload image</p>
                          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {selectedImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null)
                        setFormData({ ...formData, imageFile: null })
                        const fileInput = document.getElementById('image-upload')
                        if (fileInput) fileInput.value = ''
                      }}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Dream Home, Career Goal, Travel Destination"
                  className="input-field"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your vision and why it inspires you..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={uploading || !formData.title.trim()}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading 
                    ? 'Saving...' 
                    : editingItem 
                      ? 'Update Vision' 
                      : 'Add Vision'
                  }
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={uploading}
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

export default VisionBoard