// src/components/PropertyCard.jsx
import React, { useEffect, useState } from 'react';

function PropertyCard({ property, onViewDetails, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState(property);
  const [saving, setSaving] = useState(false);

  // keep local edited state in sync if property prop changes
  useEffect(() => {
    setEditedProperty(property || {});
  }, [property]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProperty(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editedProperty) return;
    try {
      setSaving(true);
      // ensure id never changes
      const payload = { ...editedProperty, id: property.id };

      if (typeof onSave === 'function') {
        // onSave may be async
        await onSave(payload);
      } else {
        console.warn('PropertyCard.onSave not provided — changes will not persist.');
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save property — see console.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProperty(property);
    setIsEditing(false);
  };

  // auto-detect state/district
  let detectedState = property.state || property.district || '';
  if (property.title) {
    const parts = property.title.split(',');
    if (parts.length > 1) detectedState = parts[parts.length - 1].trim();
  }

  // Handle MongoDB _id vs id
  const propertyId = property._id || property.id;
  const ownerName = property.owner || property.ownerName || 'N/A';
  const propertyDate = property.date || property.createdAt || new Date().toISOString().split('T')[0];

  // Handle image plural vs singular
  const displayImage = property.image || (property.images && property.images.length > 0 ? property.images[0] : null);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col h-full">
      <div className="h-52 w-full overflow-hidden">
        <img src={displayImage} alt={property.title} className="w-full h-full object-cover" />
      </div>

      <div className="p-6 flex flex-col flex-grow text-gray-900 dark:text-gray-100">
        {isEditing ? (
          <>
            <label className="block mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Title</span>
              <input
                type="text"
                name="title"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                value={editedProperty.title || ''}
                onChange={handleChange}
              />
            </label>

            <label className="block mb-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Description</span>
              <textarea
                name="description"
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                value={editedProperty.description || ''}
                onChange={handleChange}
              />
            </label>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <label className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-300">House ID</span>
                <input
                  name="id"
                  value={property.id}
                  readOnly
                  disabled
                  className="mt-1 rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed shadow-sm"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-300">Owner Name</span>
                <input
                  name="owner"
                  value={editedProperty.owner || ''}
                  onChange={handleChange}
                  className="mt-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-300">District</span>
                <input
                  name="district"
                  value={editedProperty.district || ''}
                  onChange={handleChange}
                  className="mt-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                />
              </label>

              <label className="flex flex-col">
                <span className="text-gray-500 dark:text-gray-300">Date</span>
                <input
                  type="date"
                  name="date"
                  value={editedProperty.date || ''}
                  onChange={handleChange}
                  className="mt-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                />
              </label>
            </div>

            <div className="flex space-x-3 mt-auto">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100 rounded-md text-sm hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{property.title}</h2>

            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{property.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <span className="text-gray-500 dark:text-gray-300">House ID</span>
                <p className="font-semibold text-xs">{propertyId}</p>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-300">Owner Name</span>
                <p className="font-semibold">{ownerName}</p>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-300">State</span>
                <p className="font-semibold">{detectedState}</p>
              </div>

              <div>
                <span className="text-gray-500 dark:text-gray-300">Date</span>
                <p className="font-semibold">{propertyDate}</p>
              </div>
            </div>

            <div className="flex space-x-3 mt-auto">
              <button
                onClick={() => typeof onViewDetails === 'function' ? onViewDetails(property) : null}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
              >
                View Details
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Edit
              </button>

              <button
                onClick={() => typeof onDelete === 'function' ? onDelete(property.id) : null}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-md hover:bg-red-100 dark:hover:bg-red-900/40"
              >
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PropertyCard;
