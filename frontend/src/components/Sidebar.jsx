import { MessageSquare, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useState } from 'react';

const Sidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onRenameChat, onDeleteChat, isOpen, setIsOpen }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      onRenameChat(id, editTitle);
      setEditingId(null);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <div className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-dark border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="p-4 flex items-center justify-between">
        <button 
          onClick={onNewChat}
          className="flex-1 flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          New Chat
        </button>
        <button 
          className="md:hidden ml-2 p-2 rounded-lg hover:bg-gray-800 text-gray-400"
          onClick={() => setIsOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-custom p-3 space-y-1">
        {chats.map(chat => (
          <div 
            key={chat.id} 
            className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'}`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare size={16} className="text-gray-400 flex-shrink-0" />
              {editingId === chat.id ? (
                <input 
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => handleEditKeyDown(e, chat.id)}
                  onBlur={() => {
                    onRenameChat(chat.id, editTitle);
                    setEditingId(null);
                  }}
                  autoFocus
                  className="bg-transparent border-none outline-none text-sm text-gray-100 w-full"
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="text-sm truncate text-gray-200">
                  {chat.title}
                </span>
              )}
            </div>

            {activeChatId === chat.id && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(chat.id);
                    setEditTitle(chat.title);
                  }}
                  className="p-1 text-gray-400 hover:text-white rounded"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-400 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
