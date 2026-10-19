
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NationalPark, UserParkHistory, ViewState } from './types';
import { Icon } from './icons';

// Component Imports
import MapView from './components/MapView';
import BadgeView from './components/BadgeView';
import LogsView from './components/LogsView';
import ParkDetails from './components/ParkDetails';
import DiscoverView from './components/DiscoverView';

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>('MAP');
  const [selectedParkId, setSelectedParkId] = useState<string | null>(null);
  
  // Data State
  const [parks, setParks] = useState<NationalPark[]>([]);
  const [userLogs, setUserLogs] = useState<UserParkHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [parksRes, logsRes] = await Promise.all([
          fetch('/api/parks'),
          fetch('/api/user-parks')
        ]);
        
        if (!parksRes.ok || !logsRes.ok) {
          let errMsg = 'Failed to fetch data from backend.';
          try {
            if (!parksRes.ok) {
              const err = await parksRes.json();
              if (err.error) errMsg = `Parks API Error: ${err.error}`;
            } else if (!logsRes.ok) {
              const err = await logsRes.json();
              if (err.error) errMsg = `User Logs API Error: ${err.error}`;
            }
          } catch (e) {}
          throw new Error(errMsg);
        }

        const fetchedParks = await parksRes.json();
        const fetchedLogs = await logsRes.json();
        
        setParks(fetchedParks);
        setUserLogs(fetchedLogs);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    let themeColor = '#F4F1EA'; // Default light mode color
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      themeColor = '#2A2420'; // Dark mode cream color (rgb(42, 36, 32))
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update theme-color meta tag dynamically for Chrome and Safari browser interfaces
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);
  }, [isDarkMode]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Mobile Detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchActive && 
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchActive(false);
        setSearchQuery('');
        setIsHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchActive]);

  const selectedPark = useMemo(() => 
    parks.find(p => p.id === selectedParkId) || null, 
  [selectedParkId, parks]);

  const userVisit = useMemo(() => 
    userLogs.find(v => v.parkId === selectedParkId), 
  [selectedParkId, userLogs]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return parks.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [searchQuery, parks]);

  const navItems = [
    { id: 'MAP', icon: 'map', label: 'Map' },
    { id: 'DISCOVER', icon: 'dice', label: 'Discover' },
    { id: 'BADGES', icon: 'medal', label: 'Collections' },
    { id: 'LOGS', icon: 'journal', label: 'Logs' },
  ];

  return (
    <div className="relative flex flex-col h-[100dvh] w-full max-w-[100dvw] overflow-hidden font-sans text-brand-brown bg-brand-cream">
      {isLoading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-brand-cream">
          <div className="text-xl font-bold animate-pulse text-brand-brown">Loading your parks...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-brand-cream">
          <div className="text-xl font-bold text-red-500">Error: {error}</div>
        </div>
      )}
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-6 pb-2 flex items-center justify-between pointer-events-none w-full max-w-7xl mx-auto gap-4">
        
        {/* Merged Logo & Search Chip */}
        <motion.div 
            ref={searchContainerRef}
            layout
            className={`
                pointer-events-auto rounded-full p-1.5 md:p-2 shadow-md border
                flex items-center gap-1.5 md:gap-2 transition-all duration-300 relative z-50 h-14 md:h-16 box-border overflow-visible cursor-pointer
                ${isSearchActive 
                    ? 'bg-white/60 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 border border-black/5 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] cursor-text scale-[1.02]' 
                    : 'bg-white/50 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 border border-black/5 dark:border-white/10 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-white/60 dark:hover:bg-white/20'}
            `}
            onHoverStart={() => !isSearchActive && setIsHovered(true)}
            onHoverEnd={() => !isSearchActive && setIsHovered(false)}
            onClick={() => {
                if (!isSearchActive) {
                    setIsSearchActive(true);
                    setIsHovered(false);
                }
            }}
            animate={{
                width: isSearchActive ? (isMobile ? '100%' : 360) : 'auto'
            }}
            transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
            }}
        >
           <AnimatePresence mode="wait">
               {/* Icon Section: Swaps between Logo and Search Icon */}
               {(isHovered || isSearchActive) ? (
                    <motion.div
                        key="search-icon"
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-transparent flex items-center justify-center shrink-0"
                    >
                        <Icon name="search" className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
                    </motion.div>
               ) : (
                    <motion.div
                        key="logo-img"
                        initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-brand-orange overflow-hidden shadow-inner border-2 border-brand-navBorder shrink-0"
                    >
                        <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA3mVNFOLWoB-Od1SoeZPaPvwhrjccv7Ku_Q_ZUQORtw&s=10" 
                        alt="Logo" 
                        className="w-full h-full object-cover"
                        />
                    </motion.div>
               )}
           </AnimatePresence>

           <AnimatePresence mode="wait">
               {/* Content Section: Swaps between Title, Hover Text, and Input */}
               {isSearchActive ? (
                   <motion.div
                        key="input-field"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex items-center min-w-0 pr-2 h-full"
                   >
                        <input 
                            ref={(el) => {
                                searchInputRef.current = el;
                                if (el) {
                                    setTimeout(() => el.focus(), 50);
                                }
                            }}
                            autoFocus
                            type="text"
                            placeholder="Find a park..."
                            className="bg-transparent border-none outline-none p-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 font-serif text-base md:text-lg w-full h-full min-w-0"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsSearchActive(false);
                                setSearchQuery('');
                            }}
                            className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-black/5 transition-all shrink-0"
                        >
                            <Icon name="x" className="w-5 h-5" />
                        </button>
                   </motion.div>
               ) : (isHovered && !isMobile) ? (
                    <motion.div
                        key="hover-text"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="pr-4 whitespace-nowrap overflow-hidden flex items-center text-left w-full h-full"
                    >
                        <span className="font-serif text-gray-500 dark:text-gray-400 text-base md:text-lg w-full">Find a park...</span>
                    </motion.div>
               ) : (
                   <motion.div 
                        key="brand-text"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="hidden md:flex flex-col justify-center items-start pr-4 whitespace-nowrap overflow-hidden text-left w-full h-full"
                   >
                        <h1 className="font-serif font-semibold text-lg md:text-xl text-gray-900 dark:text-gray-100 tracking-wide leading-none">
                        ParkFolio
                        </h1>
                        <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 uppercase tracking-widest leading-none mt-1">
                        Travel Tracker
                        </span>
                   </motion.div>
               )}
           </AnimatePresence>

            {/* Results Dropdown - Attached to this component now */}
            <AnimatePresence>
                {isSearchActive && searchResults.length > 0 && searchQuery && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 20, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 w-full bg-white/95 dark:bg-[#2f2824]/95 backdrop-blur-md rounded-3xl shadow-xl border border-black/5 dark:border-white/10 overflow-hidden py-2 z-50 min-w-[280px]"
                     >
                         {searchResults.map(park => (
                             <button
                                key={park.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedParkId(park.id);
                                    setSearchQuery('');
                                    setIsSearchActive(false);
                                }}
                                className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors group/item"
                             >
                                 <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-xl shadow-sm border border-black/5 dark:border-white/10 group-hover/item:-translate-y-0.5 transition-transform">
                                    {park.emoji}
                                 </div>
                                 <div>
                                     <div className="font-serif text-gray-900 dark:text-gray-100 leading-none">{park.name}</div>
                                     <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500 mt-1">{park.state}</div>
                                 </div>
                             </button>
                         ))}
                     </motion.div>
                )}
            </AnimatePresence>
        </motion.div>

        {/* Spacer to push Nav Dock to the right (Hidden on mobile search) */}
        <div className={`flex-1 ${isSearchActive && isMobile ? 'hidden' : 'block'}`} />

        {/* Nav Dock (Hidden on mobile search) */}
        <nav className={`pointer-events-auto bg-white/50 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-full p-1.5 md:p-2 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-black/5 dark:border-white/10 flex items-center gap-1 md:gap-2 shrink-0 h-14 md:h-16 box-border z-40 transition-all duration-300 hover:bg-white/60 dark:hover:bg-white/20 ${isSearchActive && isMobile ? 'hidden' : 'flex'}`}>
            {navItems.map((item) => {
                const isActive = currentView === item.id;
                
                return (
                    <motion.button
                        key={item.id}
                        layout
                        onClick={() => setCurrentView(item.id as ViewState)}
                        className={`
                        relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300
                        ${isActive 
                            ? 'bg-brand-orange text-white shadow-md scale-105' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-white/20 hover:text-brand-orange '}
                        `}
                        title={item.label}
                    >
                        <div className="flex items-center justify-center shrink-0">
                            <Icon 
                                name={item.icon} 
                                className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5px]" 
                            />
                        </div>
                    </motion.button>
                );
            })}
        </nav>
      </header>

      {/* Map View - Rendered behind everything to span full screen */}
      <AnimatePresence>
        {currentView === 'MAP' && (
            <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-0"
            >
            <MapView 
                parks={parks} 
                visits={userLogs} 
                onParkSelect={setSelectedParkId} 
            />
            </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area - Full screen, no frame */}
      <main className={`flex-1 relative overflow-hidden w-full ${currentView === 'MAP' ? 'pointer-events-none' : ''}`}>
            <AnimatePresence mode="wait">
            {currentView === 'DISCOVER' && (
                <motion.div
                key="discover"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full h-full overflow-y-auto"
                >
                <DiscoverView 
                    parks={parks} 
                    visits={userLogs} 
                    onParkSelect={setSelectedParkId} 
                />
                </motion.div>
            )}

            {currentView === 'BADGES' && (
                <motion.div
                key="badges"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full h-full overflow-y-auto"
                >
                <BadgeView 
                    visits={userLogs} 
                    parks={parks} 
                    onParkSelect={setSelectedParkId}
                />
                </motion.div>
            )}

            {currentView === 'LOGS' && (
                <motion.div
                key="logs"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="w-full h-full overflow-y-auto"
                >
                <LogsView 
                    parks={parks} 
                    visits={userLogs} 
                    onParkSelect={setSelectedParkId} 
                />
                </motion.div>
            )}
            </AnimatePresence>
      </main>

      {/* Theme Toggle */}
      <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-end px-4 md:px-8 max-w-7xl mx-auto w-full">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="pointer-events-auto bg-white/50 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 rounded-2xl p-3 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-black/5 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-white/60 dark:hover:bg-white/20 transition-all"
        >
          <Icon name={isDarkMode ? 'sun' : 'moon'} className="w-5 h-5 md:w-6 md:h-6 stroke-[2.5px]" />
        </button>
      </div>

      {/* Park Details Modal Overlay */}
      <AnimatePresence>
        {selectedPark && (
          <ParkDetails 
            park={selectedPark} 
            visit={userVisit} 
            onClose={() => setSelectedParkId(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
