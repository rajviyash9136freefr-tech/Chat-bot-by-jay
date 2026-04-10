import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChatWindow from './components/ChatWindow';

function App() {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Fetch all conversations on load
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/conversations');
        if (!response.ok) throw new Error('Failed to fetch conversations');
        const data = await response.json();
        
        if (data.length > 0) {
          // Map backend conversations to frontend state format
          const formattedChats = data.map(c => ({
            id: c.id.toString(),
            title: c.title,
            messages: [] // Will fetch messages when selected
          }));
          setChats(formattedChats);
          setActiveChatId(formattedChats[0].id);
        } else {
          // Start with an empty chat if no history
          const initialChat = { id: 'temp-' + Date.now(), title: 'New Chat', messages: [] };
          setChats([initialChat]);
          setActiveChatId(initialChat.id);
        }
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages for the active chat if they haven't been loaded yet
  useEffect(() => {
    if (!activeChatId || activeChatId.startsWith('temp-')) return;

    const currentChat = chats.find(c => c.id === activeChatId);
    if (currentChat && currentChat.messages.length === 0) {
      const fetchHistory = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/conversations/${activeChatId}`);
          if (!response.ok) throw new Error('Failed to fetch history');
          const data = await response.json();
          
          setChats(prevChats => prevChats.map(c => 
            c.id === activeChatId ? { ...c, messages: data } : c
          ));
        } catch (err) {
          console.error('Error fetching history:', err);
        }
      };
      fetchHistory();
    }
  }, [activeChatId, chats]);

  const activeChat = chats.find(c => c.id === activeChatId) || { messages: [] };

  const handleNewChat = () => {
    const newChat = {
      id: 'temp-' + Date.now().toString(),
      title: 'New Chat',
      messages: []
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleRenameChat = (id, newTitle) => {
    setChats(chats.map(c => c.id === id ? { ...c, title: newTitle } : c));
    // Optional: Add backend API for renaming
  };

  const handleDeleteChat = (id) => {
    const updatedChats = chats.filter(c => c.id !== id);
    if (updatedChats.length === 0) {
      const newChat = { id: 'temp-' + Date.now(), title: 'New Chat', messages: [] };
      setChats([newChat]);
      setActiveChatId(newChat.id);
    } else {
      setChats(updatedChats);
      if (activeChatId === id) {
        setActiveChatId(updatedChats[0].id);
      }
    }
    // Optional: Add backend API for deleting
  };

  const handleSendMessage = async (content) => {
    const newMessage = { role: 'user', content };
    const updatedMessages = [...activeChat.messages, newMessage];
    
    let currentChatId = activeChatId;

    // Update state to show user message immediately
    setChats(prevChats => prevChats.map(c => {
        if (c.id === currentChatId) {
            let title = c.title;
            if (c.messages.length === 0 && (title === 'New Chat' || title === '')) {
                const textContent = Array.isArray(content) 
                  ? content.find(i => i.type === 'text')?.text || 'Image Upload'
                  : content;
                title = textContent.slice(0, 30) + (textContent.length > 30 ? '...' : '');
            }
            return { ...c, title, messages: updatedMessages };
        }
        return c;
    }));
    setIsTyping(true);

    try {
      const isTemp = currentChatId.startsWith('temp-');
      const payload = {
        messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        conversationId: isTemp ? null : currentChatId
      };

      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const aiMessage = { 
        role: 'assistant', 
        content: data.choices[0]?.message?.content || 'Sorry, I could not respond.'
      };

      // If it was a temp chat, it now has a real ID
      const newDbId = data.conversationId.toString();

      setChats(prevChats => prevChats.map(c => {
        if (c.id === currentChatId) {
          return { 
            ...c, 
            id: newDbId, // Update temp ID to real ID
            messages: [...c.messages, aiMessage] 
          };
        }
        return c;
      }));

      if (isTemp) {
        setActiveChatId(newDbId);
      }

    } catch (error) {
      console.error(error);
      const errorMessage = { role: 'assistant', content: 'There was an error communicating with the server.' };
      setChats(prevChats => prevChats.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, errorMessage] } : c));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-primary text-gray-100 font-sans overflow-hidden">
      <Sidebar 
        chats={chats} 
        activeChatId={activeChatId} 
        onSelectChat={(id) => {
          setActiveChatId(id);
          if (window.innerWidth < 768) setIsSidebarOpen(false);
        }}
        onNewChat={handleNewChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <ChatWindow 
          messages={activeChat.messages} 
          isTyping={isTyping} 
          onSendMessage={handleSendMessage} 
        />
        
        {/* Mobile overlay for sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
}

export default App;
