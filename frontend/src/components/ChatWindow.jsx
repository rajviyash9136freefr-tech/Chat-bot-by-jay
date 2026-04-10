import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { Bot } from 'lucide-react';

const ChatWindow = ({ messages, isTyping, onSendMessage }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 flex flex-col w-full h-full relative">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Bot size={32} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
          <p className="text-gray-400 max-w-md">
            I'm a powerful AI assistant ready to help with writing, code, analysis, and much more.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-custom p-4 md:p-6 lg:px-24">
          <div className="max-w-3xl mx-auto space-y-6 pb-24">
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-aiMsg rounded-xl rounded-tl-sm px-6 py-4 max-w-[70%] flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
    </div>
  );
};

export default ChatWindow;
