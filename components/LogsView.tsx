
import React from 'react';
import { motion } from 'framer-motion';
import { NationalPark, UserParkHistory, RatingValue } from '../types';
import { Icon } from '../icons';

interface LogsViewProps {
  parks: NationalPark[];
  visits: UserParkHistory[];
  onParkSelect: (id: string) => void;
}

const RATING_TEXT: Record<RatingValue, string> = {
  3: "Worth a dedicated trip",
  2: "Worth a detour",
  1: "A pleasant stop",
  0: "A learning experience"
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const LogsView: React.FC<LogsViewProps> = ({ parks, visits, onParkSelect }) => {
  const flattenedLogs = visits
    .flatMap(history => 
        history.visits.map(visitLog => ({
            ...visitLog,
            parkRating: history.rating, 
            park: parks.find(p => p.id === history.parkId)!
        }))
    )
    .filter(item => item.park) 
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-40 pb-32">
       
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-gray-100 leading-tight tracking-tight mb-2">Travel Logs</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Notes and memories from the field</p>
        </div>
        <div className="flex items-baseline justify-between md:justify-end gap-3 w-full md:w-auto md:pb-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Field Notes
            </span>
            <span className="font-serif font-bold text-gray-900 dark:text-gray-100 text-2xl">
              {flattenedLogs.length}
            </span>
        </div>
      </div>

      {/* Grid Layout for Logs */}
      {flattenedLogs.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Icon name="journal" className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No logs found</p>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">Select a park on the map to add your first entry.</p>
            </div>
      ) : (
        <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
            {flattenedLogs.map(({ park, date, parkRating, notes, igPostIds }, index) => (
            <motion.div
                key={`${park.id}-${date}-${index}`}
                variants={item}
                onClick={() => onParkSelect(park.id)}
                className="group cursor-pointer flex flex-col"
            >
                {/* Clean Log Card */}
                <div className="bg-white/70 dark:bg-black/40 backdrop-blur-3xl backdrop-saturate-200 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] border border-white/50 dark:border-white/10 rounded-3xl p-6 hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                    
                    {/* Header: Icon + Name */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-black/5 dark:border-white/10 shrink-0 group-hover:-rotate-3 transition-transform duration-300">
                            {park.emoji}
                        </div>
                        <div>
                            <h3 className="font-serif text-xl text-gray-900 dark:text-gray-100 leading-tight group-hover:text-brand-orange transition-colors">
                                {park.name}
                            </h3>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1 block">
                                {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                            </span>
                        </div>
                    </div>

                    {/* Notes Area */}
                    <div className="flex-1 mb-6">
                        <p className={`text-base leading-relaxed line-clamp-4 ${notes ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400 italic'}`}>
                            {notes || "No notes written for this expedition."}
                        </p>
                    </div>

                    {/* Footer: Rating */}
                    {parkRating !== undefined && (
                        <div className="flex items-center gap-1 mt-auto pt-2">
                            {[1, 2, 3].map((val) => (
                                <Icon 
                                  key={val} 
                                  name="thumbsUp" 
                                  className={`w-4 h-4 ${val <= parkRating ? 'text-brand-orange' : 'text-gray-200 dark:text-white/20'}`} 
                                />
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
            ))}
        </motion.div>
      )}
    </div>
  );
};

export default LogsView;
