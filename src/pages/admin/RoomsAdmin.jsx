import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiUpload, FiTrash2 as FiRemove, FiImage } from 'react-icons/fi';
import { fetchRooms, createRoom, updateRoom, deleteRoom, getImageUrl } from '../../services/api';

function RoomsAdmin() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerNight: '',
    capacity: '',
    category: '',
    isAvailable: true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const res = await fetchRooms();
      setRooms(res.data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imageFiles.length > 5) {
      alert('You can upload up to 5 images');
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      description: '',
      pricePerNight: '',
      capacity: '',
      category: '',
      isAvailable: true
    });
    setImageFiles([]);
    setImagePreviews([]);
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      category: room.category || '',
      isAvailable: room.isAvailable
    });
    const previews = (room.images || []).map(img => getImageUrl(img));
    setImagePreviews(previews);
    setImageFiles([]); // new files only
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      if (editingRoom) {
        await updateRoom(editingRoom.id, formDataToSend);
      } else {
        await createRoom(formDataToSend);
      }
      loadRooms();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        await deleteRoom(id);
        loadRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  if (loading) return <div className="loading-spinner"></div>;

  return (
    <div className="admin-modern">
      <div className="admin-header-modern">
        <h1>Rooms Management</h1>
        <button className="btn-primary-modern" onClick={openAddModal}>
          <FiPlus /> Add New Room
        </button>
      </div>

      <div className="cards-grid">
        {rooms.map(room => (
          <motion.div
            key={room.id}
            className="admin-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            layout
          >
            <div className="card-image-strip">
              {room.images?.slice(0, 3).map((img, idx) => (
                <img key={idx} src={getImageUrl(img)} alt={room.name} className="strip-img" />
              ))}
              {room.images?.length > 3 && <span className="more-count">+{room.images.length-3}</span>}
              {!room.images?.length && <FiImage className="no-image-icon" />}
            </div>
            <div className="card-content">
              <h3>{room.name}</h3>
              <p className="category">{room.category || 'Uncategorized'}</p>
              <div className="details">
                <span>${room.pricePerNight}/night</span>
                <span>•</span>
                <span>{room.capacity} guests</span>
              </div>
              <div className="status">
                <span className={`badge ${room.isAvailable ? 'available' : 'unavailable'}`}>
                  {room.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="card-actions">
                <button onClick={() => openEditModal(room)} className="icon-btn edit">
                  <FiEdit2 />
                </button>
                <button onClick={() => handleDelete(room.id)} className="icon-btn delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="fab" onClick={openAddModal}>
        <FiPlus />
      </button>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="modal-overlay-modern"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              className="modal-modern"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header-modern">
                <h2>{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
                <button className="modal-close-modern" onClick={() => setModalOpen(false)}>
                  <FiX />
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body-modern">
                  <div className="form-section">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={3}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Price per Night ($)</label>
                        <input
                          type="number"
                          name="pricePerNight"
                          value={formData.pricePerNight}
                          onChange={handleInputChange}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="form-group">
                        <label>Capacity</label>
                        <input
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          required
                          min="1"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Suite">Suite</option>
                        <option value="Standard">Standard</option>
                        <option value="Family">Family</option>
                        <option value="Penthouse">Penthouse</option>
                      </select>
                    </div>
                    <div className="form-group checkbox">
                      <label>
                        <input
                          type="checkbox"
                          name="isAvailable"
                          checked={formData.isAvailable}
                          onChange={handleInputChange}
                        />
                        Available for booking
                      </label>
                    </div>
                  </div>
                  <div className="image-section">
                    <label className="upload-area">
                      <FiUpload className="upload-icon" />
                      <span>Click to upload images (max 5)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImagesChange}
                        hidden
                      />
                    </label>
                    <div className="preview-grid">
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} className="preview-item">
                          <img src={preview} alt={`preview-${idx}`} />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="remove-btn"
                          >
                            <FiRemove />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer-modern">
                  <button
                    type="button"
                    className="btn-secondary-modern"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary-modern">
                    {editingRoom ? 'Update' : 'Create'} Room
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RoomsAdmin;