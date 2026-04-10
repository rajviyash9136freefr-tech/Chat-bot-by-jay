import { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Paperclip, X, Image as ImageIcon } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    // Reset file input so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = (files) => {
    const validFiles = files.filter(file => 
      file.type === 'image/png' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg' || 
      file.type === 'image/webp'
    );

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Str = e.target.result;
        setPreviewUrls(prev => [...prev, base64Str]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreview = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const isTextEmpty = !input.trim();
    const hasImages = previewUrls.length > 0;

    if ((isTextEmpty && !hasImages) || disabled) return;

    if (!hasImages) {
      // Normal text-only message
      onSendMessage(input.trim());
    } else {
      // Image + Text message
      const content = [];
      if (!isTextEmpty) {
        content.push({ type: 'text', text: input.trim() });
      }
      previewUrls.forEach(url => {
        content.push({ type: 'image_url', image_url: { url } });
      });
      onSendMessage(content);
    }

    setInput('');
    setPreviewUrls([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary via-primary pt-6 pb-4 md:pb-6 px-4">
      <div className="max-w-3xl mx-auto relative">
        <div 
          className={`relative bg-gray-800 border ${isDragging ? 'border-blue-500 bg-gray-800/80 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-gray-700'} rounded-xl shadow-lg transition-all focus-within:ring-1 focus-within:ring-gray-500`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Image Previews */}
          {previewUrls.length > 0 && (
            <div className="flex gap-2 p-3 overflow-x-auto border-b border-gray-700 scrollbar-custom animate-fade-in">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="relative group flex-shrink-0">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-900 border border-gray-700">
                    <img src={url} alt="upload preview" className="w-full h-full object-cover zoom-hover" />
                  </div>
                  <button
                    onClick={() => removePreview(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end relative">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="absolute left-3 bottom-3 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Attach File"
            >
              <Paperclip size={20} />
            </button>

            <textarea
              ref={textareaRef}
              tabIndex={0}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isDragging ? "Drop images here..." : "Send a message..."}
              className="flex-1 max-h-[200px] w-full resize-none bg-transparent py-4 pl-12 pr-12 text-white placeholder-gray-400 border-0 focus:ring-0 scrollbar-custom outline-none"
              disabled={disabled}
              style={{ minHeight: '56px' }}
            />
            
            <button
              onClick={handleSubmit}
              disabled={(!input.trim() && previewUrls.length === 0) || disabled}
              className="absolute right-3 bottom-3 p-1.5 rounded-lg text-white bg-userMsg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-userMsg transition-colors"
            >
              <SendHorizontal size={18} />
            </button>
          </div>
        </div>
        <div className="text-center text-xs text-gray-500 mt-2">
          AI can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
