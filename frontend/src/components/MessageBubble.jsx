import ReactMarkdown from 'react-markdown';
import { Bot, User, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = (textContent) => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    const renderMarkdown = (textStr) => (
      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl">
        <ReactMarkdown
          components={{
            pre({ node, ...props }) {
              return <pre {...props} className="overflow-x-auto p-4 rounded-lg bg-gray-900 my-4 border border-gray-700 scrollbar-custom text-sm" />
            },
            code({ node, inline, className, children, ...props }) {
              return !inline ? (
                <code className={className} {...props}>
                  {children}
                </code>
              ) : (
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-blue-300 font-mono" {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {textStr}
        </ReactMarkdown>
      </div>
    );

    if (Array.isArray(message.content)) {
      return (
        <div className="flex flex-col gap-3">
          {message.content.map((item, idx) => {
            if (item.type === 'text') {
               return isUser ? <div key={idx} className="whitespace-pre-wrap">{item.text}</div> : renderMarkdown(item.text);
            }
            if (item.type === 'image_url') {
               return <img key={idx} src={item.image_url.url} alt="Uploaded content" className="w-auto h-auto max-w-[200px] md:max-w-[250px] rounded-xl object-contain shadow-sm border border-gray-700 animate-fade-in" />;
            }
            return null;
          })}
        </div>
      );
    }
    
    // Fallback for normal string content
    return isUser ? (
      <div className="whitespace-pre-wrap">{message.content}</div>
    ) : renderMarkdown(message.content);
  };

  // Get raw string for copy
  const getRawText = () => {
    if (Array.isArray(message.content)) {
      return message.content.filter(i => i.type === 'text').map(i => i.text).join('\n');
    }
    return message.content;
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-4 max-w-[85%] md:max-w-[80%] lg:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white shadow-sm">
              <User size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 shadow-sm">
              <Bot size={16} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Bubble content */}
        <div className={`group relative flex flex-col max-w-[calc(100%-3rem)] ${isUser ? 'items-end' : 'items-start'}`}>
          <div 
            className={`w-full px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
              isUser 
                ? 'bg-userMsg text-white rounded-tr-sm' 
                : 'bg-aiMsg border border-gray-800 rounded-tl-sm text-gray-100'
            }`}
          >
            {renderContent()}
          </div>
          
          {/* Message Actions */}
          {!isUser && (
            <div className="mt-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleCopy(getRawText())}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                title="Copy message"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
