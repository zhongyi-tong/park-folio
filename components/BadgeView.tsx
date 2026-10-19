
import React, { useState, useMemo } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { BADGES } from '../constants';
import { UserParkHistory, NationalPark, Badge } from '../types';
import { Icon } from '../icons';
import AchievementDetails from './AchievementDetails';

interface BadgeViewProps {
  visits: UserParkHistory[];
  parks: NationalPark[];
  onParkSelect: (id: string) => void;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", bounce: 0.4 }
  }
};

interface TimelineEntry {
  date: string;
  parks: NationalPark[];
  timestamp: number;
}

const DraggableScroll = ({ children }: { children: React.ReactNode }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div 
      ref={scrollRef}
      className={`relative w-full overflow-x-auto pb-6 pt-6 hide-scrollbar select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="flex items-start w-max min-w-full">
         {children}
      </div>
    </div>
  );
};

const TimelineNode = ({ entry, onParkSelect }: { entry: TimelineEntry, onParkSelect: (id: string) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMulti = entry.parks.length > 1;

  return (
    <div 
      className="relative flex flex-col items-center group shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: '160px', zIndex: isHovered ? 50 : 1 }}
    >
      {/* Icons Container */}
      <div className="relative flex justify-center items-end h-36 w-full mb-6">
        {entry.parks.map((park, index) => {
           const center = (entry.parks.length - 1) / 2;
           const rotation = isMulti ? (index - center) * 12 : 0;
           
           const spreadOffset = 65; // Spread distance on hover
           const stackOffset = 10; // Stack distance when not hovered
           const xOffset = isMulti ? (index - center) * (isHovered ? spreadOffset : stackOffset) : 0;
           const hoverRotation = isMulti ? (index - center) * 4 : 0; 
           const rot = isHovered ? hoverRotation : rotation;
           
           return (
             <div 
               key={park.id}
               className="absolute origin-bottom transition-all duration-300 ease-out flex items-end cursor-pointer"
               style={{ 
                 transform: `translateX(${xOffset}px) rotate(${rot}deg) translateY(${isHovered ? -16 : 0}px)`,
                 zIndex: isHovered ? 50 + index : index
               }}
               onClick={() => onParkSelect(park.id)}
               title={park.name}
             >
               <div className="w-24 h-24 bg-white/70 dark:bg-black/40 backdrop-blur-3xl backdrop-saturate-200 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 dark:border-white/10 rounded-[2rem] flex items-center justify-center text-5xl hover:ring-2 hover:ring-brand-orange hover:ring-offset-2 hover:ring-offset-brand-cream dark:hover:ring-offset-[#2a2420] transition-shadow">
                 {park.emoji}
               </div>
             </div>
           );
        })}
      </div>
      
      {/* Timeline Bar & Dot */}
      <div className="w-full flex items-center justify-center relative">
         <div className="absolute w-full h-[2px] bg-black/5 dark:bg-white/10" />
         <div className="w-4 h-4 rounded-full border-[3px] border-white dark:border-[#2a2420] bg-brand-orange relative z-10 transition-all duration-300 group-hover:scale-150 group-hover:shadow-[0_0_15px_rgba(224,106,65,0.6)]" />
      </div>
      
      {/* Labels */}
      <div className="mt-5 text-center relative z-20">
        <div className="text-xs font-bold text-brand-orange dark:text-brand-orange uppercase tracking-widest mb-2">
           {(() => {
             const [year, month] = entry.date.split('-');
             return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
           })()}
        </div>
        <div className="flex flex-col gap-1.5 items-center">
           {entry.parks.map((park) => (
             <div 
                key={park.id} 
                onClick={() => onParkSelect(park.id)}
                className="text-sm font-serif font-semibold leading-tight cursor-pointer hover:text-brand-orange transition-colors text-gray-900 dark:text-gray-100 whitespace-nowrap"
             >
               {park.name}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const BadgeView: React.FC<BadgeViewProps> = ({ visits, parks, onParkSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<(Badge & { isUnlocked: boolean }) | null>(null);

  // 1. Process Visited Parks
  const visitedParkIds = new Set(visits.filter(v => v.visits.length > 0).map(v => v.parkId));
  const visitedParksList = parks.filter(p => visitedParkIds.has(p.id));
  
  // Sort by name for the collection
  visitedParksList.sort((a, b) => a.name.localeCompare(b.name));

  const INITIAL_LIMIT = 8; // Limit initially displayed
  const visibleParks = isExpanded ? visitedParksList : visitedParksList.slice(0, INITIAL_LIMIT);

  // 2. Process Achievements
  const achievementsList = BADGES.map(badge => ({
    ...badge,
    isUnlocked: badge.condition(visits, parks)
  })).sort((a, b) => {
    // Sort unlocked first
    if (a.isUnlocked === b.isUnlocked) return 0;
    return a.isUnlocked ? -1 : 1;
  });

  const visitedCount = visitedParksList.length;
  const totalParks = parks.length;
  const percentage = Math.round((visitedCount / totalParks) * 100);

  const timelineData = useMemo(() => {
    const data: TimelineEntry[] = [];
    const visitsMap = new Map<string, Set<NationalPark>>();

    visits.forEach(history => {
      const park = parks.find(p => p.id === history.parkId);
      if (park) {
        history.visits.forEach(log => {
          // Group by Year-Month to stack visits "near the same time"
          const dateObj = new Date(log.date);
          const monthYearKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
          
          if (!visitsMap.has(monthYearKey)) {
            visitsMap.set(monthYearKey, new Set());
          }
          visitsMap.get(monthYearKey)!.add(park);
        });
      }
    });

    visitsMap.forEach((parkSet, monthYearStr) => {
      // Reconstruct a date for sorting and display
      const [year, month] = monthYearStr.split('-');
      const timestamp = new Date(parseInt(year), parseInt(month) - 1).getTime();
      
      data.push({
        date: monthYearStr,
        parks: Array.from(parkSet),
        timestamp
      });
    });

    data.sort((a, b) => b.timestamp - a.timestamp);
    return data;
  }, [visits, parks]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-40 pb-32">
      
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-gray-100 leading-tight tracking-tight mb-2">Collections</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Your journey in stamps & badges</p>
        </div>
        <div className="flex flex-col w-full md:w-auto md:min-w-[360px]">
          <div className="flex justify-between items-end w-full mb-3">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2 h-4">
                <Icon name="map-pin" className="w-4 h-4 text-brand-orange" />
                Parks Explored
              </span>
              <span className="font-serif font-bold text-gray-900 dark:text-gray-100 text-xl">
                {visitedCount} <span className="text-gray-400 text-sm">/ {totalParks}</span>
              </span>
          </div>

          <div className="w-full relative mt-1">
            {/* Background Track - Flat & Clean */}
            <div className="h-5 w-full bg-gray-100 dark:bg-white/10 rounded-full p-1 flex items-center shadow-inner relative">
               
               {/* Progress Fill */}
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: visitedCount === 0 ? '0%' : `${Math.max(percentage, 3)}%` }} 
                 transition={{ duration: 1.5, type: "spring", bounce: 0.2 }}
                 className="h-full bg-brand-orange rounded-full relative z-10 shadow-sm"
               />

               {/* Gamified Milestones (Flat Style) */}
               <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    {[25, 50, 75].map((milestone) => {
                        const reached = percentage >= milestone;
                        return (
                            <div 
                                key={milestone} 
                                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full transition-colors duration-500 delay-500 ${reached ? 'bg-white/80' : 'bg-black/10 dark:bg-white/20'}`}
                                style={{ left: `${milestone}%` }} 
                            />
                        );
                    })}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: TIMELINE */}
      {timelineData.length > 0 && (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-gray-100">Timeline</h3>
            </div>
            
            {/* Timeline Slider */}
            <div className="-mx-4 md:-mx-8">
              <DraggableScroll>
                  <div className="w-12 md:w-16 shrink-0" />
                  {timelineData.map((entry, idx) => (
                      <div key={entry.date} className="h-full">
                          <TimelineNode entry={entry} onParkSelect={onParkSelect} />
                      </div>
                  ))}
                  <div className="w-12 md:w-16 shrink-0" />
              </DraggableScroll>
            </div>
        </div>
      )}

      {/* SECTION 2: VISITED PARKS (STAMPS) */}
      <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                   <h3 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-gray-100">Passport Stamps</h3>
               </div>
               
               {visitedParksList.length > INITIAL_LIMIT && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-500 dark:text-gray-400 font-medium text-sm hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                        {isExpanded ? 'Show Less' : `Show All (${visitedParksList.length})`}
                    </button>
               )}
          </div>

          {visitedParksList.length === 0 ? (
               <div className="py-20 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                         <Icon name="map" className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No stamps yet!</p>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">Visit a park to start your collection.</p>
               </div>
          ) : (
              <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-6 justify-items-center"
              >
                 <AnimatePresence mode="popLayout">
                    {visibleParks.map((park) => (
                        <motion.div
                            key={park.id}
                            layout
                            variants={itemVariants}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => onParkSelect(park.id)}
                            className="flex flex-col items-center gap-4 w-full max-w-[200px] cursor-pointer group"
                        >
                             <div className="group-hover:-translate-y-1 transition-transform duration-300 relative">
                                  {/* Stamp Body */}
                                  <div className="w-32 h-32 md:w-36 md:h-36 bg-white/70 dark:bg-black/40 backdrop-blur-3xl backdrop-saturate-200 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 dark:border-white/10 rounded-[2rem] flex items-center justify-center text-5xl md:text-6xl rotate-[-2deg] group-hover:rotate-0 transition-all duration-300">
                                     {park.emoji}
                                  </div>
                                  
                                  {/* Verified Check */}
                                  <div className="absolute -bottom-2 -right-2 bg-brand-orange text-white rounded-full p-1.5 border-4 border-white dark:border-[#2a2420] shadow-sm z-10">
                                      <Icon name="check" className="w-4 h-4 stroke-[3]" />
                                  </div>
                             </div>
                             
                             <div className="text-center px-2 mt-2">
                                 <h4 className="font-serif text-gray-900 dark:text-gray-100 text-lg mb-1 group-hover:text-brand-orange transition-colors leading-tight">{park.name}</h4>
                                 <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{park.state}</span>
                             </div>
                        </motion.div>
                    ))}
                 </AnimatePresence>
              </motion.div>
          )}
      </div>

      {/* SECTION 3: ACHIEVEMENTS - STAMP STYLE */}
      <div>
          <div className="flex items-center gap-3 mb-6">
                <h3 className="text-2xl md:text-3xl font-serif text-gray-900 dark:text-gray-100">Achievements</h3>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-6 justify-items-center"
          >
            {achievementsList.map((badge) => (
              <motion.div
                key={badge.id}
                variants={itemVariants}
                onClick={() => setSelectedBadge(badge)}
                className={`flex flex-col items-center gap-4 w-full max-w-[200px] cursor-pointer group
                   ${badge.isUnlocked ? '' : 'opacity-50 grayscale'}
                `}
              >
                   <div className="relative">
                        {/* Stamp Body */}
                        <div className={`
                           w-32 h-32 md:w-36 md:h-36 rounded-[2rem] flex items-center justify-center rotate-[-2deg] group-hover:rotate-0 group-hover:-translate-y-1 transition-all duration-300
                           ${badge.isUnlocked ? 'bg-white/70 dark:bg-black/40 backdrop-blur-3xl backdrop-saturate-200 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]' : 'bg-transparent dark:bg-transparent border border-black/5 dark:border-white/5 shadow-sm'}
                        `}>
                             {/* Badge Icon circle - Larger and using direct colors without swap/opacity */}
                             <div className={`w-24 h-24 rounded-full flex items-center justify-center
                                ${badge.isUnlocked 
                                   ? badge.color // Direct application: e.g. "bg-green-100 text-green-800"
                                   : 'text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-white/5'}
                             `}>
                                 <Icon name={badge.icon} className="w-12 h-12 stroke-[2]" />
                             </div>
                        </div>

                        {/* Status Check / Lock */}
                        <div className={`absolute -bottom-2 -right-2 text-white rounded-full p-1.5 border-4 border-white dark:border-[#2a2420] shadow-sm z-10
                            ${badge.isUnlocked ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-white/10'}
                        `}>
                             {badge.isUnlocked 
                                ? <Icon name="star" className="w-4 h-4 text-white fill-white" />
                                : <div className="w-4 h-4 bg-gray-300 dark:bg-white/20 rounded-full" />
                             }
                        </div>
                   </div>
                  
                   {/* Name Line */}
                   <div className="text-center px-2 mt-2">
                         <h4 className="font-serif text-gray-900 dark:text-gray-100 leading-tight text-lg mb-1">{badge.name}</h4>
                         {!badge.isUnlocked && (
                             <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">Locked</span>
                         )}
                   </div>
              </motion.div>
            ))}
          </motion.div>
      </div>

      {/* Achievement Details Modal */}
      <AnimatePresence>
        {selectedBadge && (
            <AchievementDetails 
                badge={selectedBadge}
                visits={visits}
                parks={parks}
                onClose={() => setSelectedBadge(null)}
            />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BadgeView;
