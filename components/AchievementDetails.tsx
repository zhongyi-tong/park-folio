
import React from 'react';
import { motion } from 'framer-motion';
import { Badge, NationalPark, UserParkHistory } from '../types';
import { Icon } from '../icons';

interface AchievementDetailsProps {
  badge: Badge & { isUnlocked: boolean };
  parks: NationalPark[];
  visits: UserParkHistory[];
  onClose: () => void;
}

const AchievementDetails: React.FC<AchievementDetailsProps> = ({ badge, parks, visits, onClose }) => {
  // Determine progress logic
  let checklist: { park: NationalPark; visited: boolean }[] = [];
  let progressText = "";
  
  // 1. If relevant parks are defined, use them for the checklist
  if (badge.relevantParkIds && badge.relevantParkIds.length > 0) {
      checklist = badge.relevantParkIds.map(id => {
          const park = parks.find(p => p.id === id);
          if (!park) return null;
          const visited = visits.some(v => v.parkId === id && v.visits.length > 0);
          return { park, visited };
      }).filter((item): item is { park: NationalPark; visited: boolean } => item !== null);
      
      const visitedCount = checklist.filter(c => c.visited).length;
      progressText = `${visitedCount} / ${checklist.length} Parks`;
  } else {
     // 2. Generic Quantity Badges (e.g. Visit 20 parks)
     const totalVisited = visits.filter(v => v.visits.length > 0).length;
     // Rough heuristic for display based on description numbers, though logic is in condition function
     const target = parseInt(badge.description.match(/\d+/)?.[0] || "0"); 
     progressText = target > 0 ? `${Math.min(totalVisited, target)} / ${target} Parks` : `${totalVisited} Visited`;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
      />
      
      {/* Dialog Box Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
      >
        <div className="bg-[#FAF9F6] dark:bg-[#2f2824] w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col relative border border-black/5 dark:border-white/10">
            
            {/* Absolute Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 z-50 bg-white/60 dark:bg-white/10 hover:bg-white/95 dark:hover:bg-white/20 border border border-white/40 dark:border-white/10 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] text-gray-700 dark:text-gray-300 transition-colors w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl backdrop-saturate-150"
            >
                <Icon name="x" className="w-5 h-5" />
            </button>

            {/* Split Content Body */}
            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                
                {/* LEFT: Identity */}
                <div className="flex-1 p-8 md:p-12 md:overflow-y-auto bg-[#F9F8F6] dark:bg-[#362e29]/50 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/10 flex flex-col items-center text-center">
                     
                     {/* Badge Stamp */}
                     <div className="relative mb-8 group mt-4">
                         <div className={`w-40 h-40 rounded-[2.5rem] flex items-center justify-center border border-black/5 dark:border-white/10 shadow-sm transition-transform duration-300
                            ${badge.isUnlocked ? 'bg-white dark:bg-[#362e29] rotate-[-2deg]' : 'bg-gray-50 dark:bg-[#2f2824]/50 rotate-0'}
                         `}>
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${badge.isUnlocked ? badge.color : 'text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-white/5'}`}>
                                 <Icon name={badge.icon} className="w-16 h-16 stroke-[2]" />
                            </div>
                         </div>
                         {badge.isUnlocked && (
                            <div className="absolute -bottom-2 -right-4 bg-brand-orange text-white font-medium text-sm px-4 py-1.5 rounded-full shadow-sm rotate-3 border-2 border-white dark:border-[#2a2420]">
                                Unlocked!
                            </div>
                         )}
                     </div>

                     <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-gray-100 mb-6 leading-tight">
                        {badge.name}
                     </h2>

                     {/* Description Bubble */}
                     <div className="w-full">
                         <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                             {badge.description}
                         </p>
                     </div>
                </div>

                {/* RIGHT: Requirements Checklist */}
                <div className="flex-1 p-8 md:p-12 md:overflow-y-auto bg-white dark:bg-[#2f2824] relative">
                     <div className="max-w-md mx-auto">
                        <div className="mb-10 pr-12">
                            <h3 className="text-2xl font-serif text-gray-900 dark:text-gray-100 mb-2">Requirements</h3>
                            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                {progressText}
                            </span>
                        </div>

                        {checklist.length > 0 ? (
                             <div className="space-y-4">
                                {checklist.map((item) => (
                                    <div key={item.park.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all
                                        ${item.visited ? 'bg-white dark:bg-[#362e29] border-brand-orange/20 dark:border-brand-orange/40 shadow-sm' : 'bg-gray-50 dark:bg-white/5 border-transparent opacity-60'}
                                    `}>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2
                                            ${item.visited ? 'bg-brand-orange text-white border-brand-orange' : 'bg-transparent border-gray-200 dark:border-white/10 text-transparent'}
                                        `}>
                                            <Icon name="check" className="w-5 h-5 stroke-[3]" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-serif text-lg text-gray-900 dark:text-gray-100 truncate leading-tight mb-1">{item.park.name}</div>
                                            <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{item.park.state}</div>
                                        </div>
                                        <div className="text-3xl shrink-0">{item.park.emoji}</div>
                                    </div>
                                ))}
                             </div>
                        ) : (
                             <div className="py-16 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/10">
                                 <div className="w-16 h-16 bg-white dark:bg-[#362e29] rounded-full flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600 shadow-sm border border-black/5 dark:border-white/10">
                                     <Icon name="trophy" className="w-8 h-8" />
                                 </div>
                                 <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg mb-2">Quantity Challenge</h4>
                                 <p className="max-w-[200px]">Keep visiting parks to unlock this badge!</p>
                             </div>
                        )}
                     </div>
                </div>

            </div>
        </div>
      </motion.div>
    </>
  );
};

export default AchievementDetails;
