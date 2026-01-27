import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Tag } from 'lucide-react';

const CategoryModal = ({ 
  categories, 
  channels,
  onClose, 
  onAddCategory, 
  onUpdateCategory, 
  onDeleteCategory,
  editingCategory,
  setEditingCategory,
  theme 
}) => {
  const [newCategoryName, setNewCategoryName] = useState(editingCategory?.name || '');
  const [newCategoryIcon, setNewCategoryIcon] = useState(editingCategory?.icon || '📁');
  const [selectedChannels, setSelectedChannels] = useState(editingCategory?.channelIds || []);

  const isDark = theme === 'dark';
  const bgSecondary = isDark ? 'bg-zinc-900' : 'bg-white';
  const bgTertiary = isDark ? 'bg-zinc-800' : 'bg-gray-100';
  const border = isDark ? 'border-zinc-800' : 'border-gray-200';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const hover = isDark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      if (editingCategory) {
        onUpdateCategory(editingCategory.id, { 
          name: newCategoryName, 
          icon: newCategoryIcon,
          channelIds: selectedChannels
        });
      } else {
        onAddCategory(newCategoryName, newCategoryIcon, selectedChannels);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    setEditingCategory(null);
    setNewCategoryName('');
    setNewCategoryIcon('📁');
    setSelectedChannels([]);
  };

  const toggleChannel = (channelId) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${bgSecondary} rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border ${border}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${text}`}>
            {editingCategory ? 'Edit Category' : 'Create Category'}
          </h2>
          <button
            onClick={handleClose}
            className={`${textSecondary} ${hover} p-2 rounded-lg`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className={`flex-1 ${bgTertiary} ${text} px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-red-500`}
              required
            />
            <input
              type="text"
              placeholder="Icon"
              value={newCategoryIcon}
              onChange={(e) => setNewCategoryIcon(e.target.value)}
              maxLength={2}
              className={`w-20 ${bgTertiary} ${text} px-4 py-3 rounded-lg outline-none focus:ring-2 focus:ring-red-500 text-center`}
            />
          </div>

          <div>
            <h3 className={`text-lg font-semibold ${text} mb-3`}>Select Channels</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {channels.map(channel => (
                <label
                  key={channel.id}
                  className={`${bgTertiary} rounded-lg p-3 flex items-center gap-3 cursor-pointer ${hover}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes(channel.id)}
                    onChange={() => toggleChannel(channel.id)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-white">
                      {channel.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${text} truncate`}>{channel.name}</p>
                    <p className={`text-sm ${textSecondary}`}>
                      {channel.videos.length} video{channel.videos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className={`flex-1 ${bgTertiary} ${text} px-6 py-3 rounded-lg font-semibold ${hover}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

        {!editingCategory && categories.length > 0 && (
          <>
            <div className={`border-t ${border} my-6`}></div>
            <div>
              <h3 className={`text-lg font-semibold ${text} mb-3`}>Existing Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className={`${bgTertiary} rounded-lg p-4 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className={`font-semibold ${text}`}>{cat.name}</p>
                        <p className={`text-sm ${textSecondary}`}>
                          {cat.channelIds.length} channel{cat.channelIds.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setNewCategoryName(cat.name);
                          setNewCategoryIcon(cat.icon);
                          setSelectedChannels(cat.channelIds);
                        }}
                        className={`${hover} p-2 rounded-lg ${textSecondary}`}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(cat.id)}
                        className="hover:bg-red-500/10 text-red-500 p-2 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {categories.length === 0 && !editingCategory && (
          <div className={`text-center py-8 ${textSecondary} mt-6`}>
            <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No categories yet. Create one above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryModal;
