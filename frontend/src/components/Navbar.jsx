import { Menu, Settings, User } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  return (
    <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-primary sticky top-0 z-10 w-full">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
        >
          <Menu size={20} />
        </button>
        <div className="font-semibold text-lg tracking-tight">ChatAI</div>
      </div>
      
      <div className="flex items-center gap-4 text-gray-400">
        <button className="hover:text-white transition-colors">
          <Settings size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white">
          <User size={16} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
