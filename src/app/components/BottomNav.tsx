import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Download, User, MessageSquare } from 'lucide-react';
import { cn } from './ui/utils';

export const BottomNav = () => {
  const location = useLocation();
  const isBuzzBoxActive = location.pathname === '/buzzbox';

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-2 border-t transition-all z-40",
      isBuzzBoxActive ? "bg-[#000000] border-white/20" : "bg-[#000000] border-gray-800"
    )}>
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn("flex flex-col items-center justify-center space-y-1 transition-colors", 
          isActive ? "text-[var(--primary)]" : "text-gray-400")
        }
      >
        <Home size={24} />
        <span className="text-[10px]">Home</span>
      </NavLink>

      <NavLink
        to="/ai-chat"
        className={({ isActive }) =>
          cn("flex flex-col items-center justify-center space-y-1 transition-colors relative", 
          isActive ? "text-cyan-400" : "text-gray-400")
        }
      >
        {/* HOT Badge */}
        <div className="absolute -top-1 -right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
          HOT
        </div>
        <MessageSquare size={24} />
        <span className="text-[10px]">AI Chat</span>
      </NavLink>

      <NavLink to="/buzzbox" className="relative -top-4">
        <div 
          className="w-14 h-14 rounded-full flex items-center justify-center border-4 border-black overflow-hidden shadow-lg relative"
          style={{
            background: 'conic-gradient(from 0deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3, #FF0000)',
          }}
        >
          <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
            <div className="text-[9px] font-black text-white text-center leading-tight">
              <div>BUZZ</div>
              <div>BOX</div>
            </div>
          </div>
        </div>
      </NavLink>

      <NavLink
        to="/downloads"
        className={({ isActive }) =>
          cn("flex flex-col items-center justify-center space-y-1 transition-colors", 
          isActive ? "text-[var(--primary)]" : "text-gray-400")
        }
      >
        <Download size={24} />
        <span className="text-[10px]">Downloads</span>
      </NavLink>

      <NavLink
        to="/me"
        className={({ isActive }) =>
          cn("flex flex-col items-center justify-center space-y-1 transition-colors", 
          isActive ? "text-[var(--primary)]" : "text-gray-400")
        }
      >
        <User size={24} />
        <span className="text-[10px]">Me</span>
      </NavLink>
    </nav>
  );
};