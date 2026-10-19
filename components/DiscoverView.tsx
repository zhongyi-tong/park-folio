import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NationalPark, UserParkHistory, Region, Season, Popularity } from '../types';
import { Icon } from '../icons';

interface DiscoverViewProps {
  parks: NationalPark[];
  visits: UserParkHistory[];
  onParkSelect: (id: string) => void;
}

const REGIONS: Region[] = ['Alaska', 'West Coast', 'Rockies', 'Southwest', 'Midwest', 'East Coast', 'Tropical'];
const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];
const POPULARITY: Popularity[] = ['High', 'Medium', 'Low'];
type VisitStatus = 'all' | 'unvisited' | 'visited';

const DiscoverView: React.FC<DiscoverViewProps> = ({ parks, visits, onParkSelect }) => {
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([]);
  const [selectedPopularity, setSelectedPopularity] = useState<Popularity[]>([]);
  const [visitStatus, setVisitStatus] = useState<VisitStatus>('all');

  const [isSpinning, setIsSpinning] = useState(false);
  const [resultPark, setResultPark] = useState<NationalPark | null>(null);
  const [displayedParks, setDisplayedParks] = useState<NationalPark[]>([]);
  
  // Filter Logic
  const toggleFilter = <T extends string>(
    item: T, 
    current: T[], 
    setter: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };

  const getFilteredParks = () => {
    const visitedIds = new Set(visits.filter(v => v.visits.length > 0).map(v => v.parkId));
    
    return parks.filter(park => {
        const isVisited = visitedIds.has(park.id);
        if (visitStatus === 'unvisited' && isVisited) return false;
        if (visitStatus === 'visited' && !isVisited) return false;

        const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(park.region);
        const seasonMatch = selectedSeasons.length === 0 || park.bestSeasons.some(s => selectedSeasons.includes(s));
        const popMatch = selectedPopularity.length === 0 || selectedPopularity.includes(park.popularity);

        return regionMatch && seasonMatch && popMatch;
    });
  };

  const filteredParks = getFilteredParks();

  useEffect(() => {
    if (filteredParks.length > 0 && !resultPark && !isSpinning) {
      setResultPark(filteredParks[Math.floor(Math.random() * filteredParks.length)]);
    } else if (filteredParks.length === 0 && !isSpinning) {
      setResultPark(null);
    }
  }, [filteredParks.length, isSpinning, resultPark]);

  const spin = () => {
    if (isSpinning || filteredParks.length === 0) return;
    setIsSpinning(true);
    setResultPark(null);

    const sequence: NationalPark[] = [];
    let lastPark = currentDisplay;
    for (let i = 0; i < 10; i++) {
      let nextPark = filteredParks[Math.floor(Math.random() * filteredParks.length)];
      while (nextPark.id === lastPark?.id && filteredParks.length > 1) {
        nextPark = filteredParks[Math.floor(Math.random() * filteredParks.length)];
      }
      sequence.push(nextPark);
      lastPark = nextPark;
    }
    
    let winner = filteredParks[Math.floor(Math.random() * filteredParks.length)];
    while (winner.id === lastPark?.id && filteredParks.length > 1) {
      winner = filteredParks[Math.floor(Math.random() * filteredParks.length)];
    }
    sequence.push(winner);
    let currentIndex = 0;
    
    const nextFrame = () => {
      setDisplayedParks([sequence[currentIndex]]);
      currentIndex++;
      
      if (currentIndex >= sequence.length) {
        setIsSpinning(false);
        setResultPark(winner);
      } else {
        const remaining = sequence.length - currentIndex;
        const delay = 30 + (10 - remaining) * 20;
        setTimeout(nextFrame, Math.min(delay, 400));
      }
    };

    nextFrame();
  };

  const currentDisplay = resultPark || (displayedParks.length > 0 ? displayedParks[0] : null);

  const getFilterButtonClass = (selected: boolean) => `
    relative px-4 py-2 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] border
    ${selected 
       ? 'bg-brand-orange text-white border-brand-orange' 
       : 'bg-gray-50 dark:bg-white/10 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/20 border-black/5 dark:border-white/5'}
    ${isSpinning ? 'opacity-50 pointer-events-none' : ''}
  `;

  return (
    <div className="max-w-6xl w-full mx-auto px-4 md:px-8 min-h-full flex flex-col py-24">
      <div className="flex justify-center w-full my-auto">
        
        <div className="relative w-full max-w-[420px] lg:max-w-[900px]">
            {/* The Lever (Clickable) - Attached to the main console now */}
            <div 
                className="hidden md:block absolute -right-8 top-24 h-48 w-16 cursor-pointer group z-0" 
                onClick={spin}
            >
               {/* Stick */}
               <div className={`w-4 h-32 bg-gradient-to-b from-gray-200 to-gray-400 dark:from-gray-600 dark:to-gray-800 absolute left-4 transition-all duration-300 origin-bottom ${isSpinning ? 'rotate-[60deg] scale-y-75 translate-y-10' : '-rotate-12'} rounded-t-full shadow-lg border border-white/20 dark:border-black/20`}>
                  {/* Knob */}
                  <div className={`w-12 h-12 bg-brand-orange rounded-full absolute -top-10 -left-4 shadow-lg border-b-4 border-black/10 group-hover:brightness-110 group-hover:scale-105 transition-all ${isSpinning ? 'brightness-90 scale-95' : ''}`} />
               </div>
               {/* Base */}
               <div className="w-10 h-20 bg-white dark:bg-[#362e29] absolute bottom-0 left-1 rounded-r-2xl border-l-4 border-gray-100 dark:border-white/5 shadow-md border border-black/5 dark:border-white/10" />
            </div>

            {/* Main Unified Console */}
            <div className="bg-white/70 dark:bg-black/40 backdrop-blur-3xl backdrop-saturate-200 p-6 md:p-10 rounded-[3rem] shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] shadow-2xl border border-white/50 dark:border-white/10 w-full flex flex-col lg:flex-row gap-10 lg:gap-0 relative z-10">
                
                {/* Left Column: Filters */}
                <div className="w-full lg:w-1/2 flex flex-col flex-1 border-b lg:border-b-0 lg:border-r border-black/5 dark:border-white/10 pb-10 lg:pb-0 lg:pr-10">
                    <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/10 mb-6">
                        <h3 className="font-bold uppercase tracking-widest text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Icon name="search" className="w-4 h-4 text-brand-orange" />
                            Filters
                        </h3>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#2f2824] px-3 py-1 rounded-lg border border-black/5 dark:border-white/5">
                        {filteredParks.length} {filteredParks.length === 1 ? 'MATCH' : 'MATCHES'}
                        </span>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Visit Status */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Icon name="user" className="w-4 h-4" />
                                Visit Status
                            </h4>
                            <div className="flex flex-wrap gap-x-2 gap-y-3">
                                {(['all', 'unvisited', 'visited'] as VisitStatus[]).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setVisitStatus(status)}
                                        disabled={isSpinning}
                                        className={getFilterButtonClass(visitStatus === status) + ' flex-1 text-center justify-center'}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Regions */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Icon name="map" className="w-4 h-4" />
                                Regions
                            </h4>
                            <div className="flex flex-wrap gap-x-2 gap-y-3">
                                {REGIONS.map(region => (
                                    <button
                                        key={region}
                                        onClick={() => toggleFilter(region, selectedRegions, setSelectedRegions)}
                                        className={getFilterButtonClass(selectedRegions.includes(region))}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Seasons */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Icon name="calendar" className="w-4 h-4" />
                                Seasons
                            </h4>
                            <div className="flex flex-wrap gap-x-2 gap-y-3">
                                {SEASONS.map(season => (
                                    <button
                                        key={season}
                                        onClick={() => toggleFilter(season, selectedSeasons, setSelectedSeasons)}
                                        className={getFilterButtonClass(selectedSeasons.includes(season))}
                                    >
                                        {season}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Popularity */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Icon name="star" className="w-4 h-4" />
                                Popularity
                            </h4>
                            <div className="flex flex-wrap gap-x-2 gap-y-3">
                                {POPULARITY.map(pop => (
                                    <button
                                        key={pop}
                                        onClick={() => toggleFilter(pop, selectedPopularity, setSelectedPopularity)}
                                        className={getFilterButtonClass(selectedPopularity.includes(pop))}
                                    >
                                        {pop}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Slot Machine Engine */}
                <div className="w-full lg:w-1/2 flex flex-col lg:pl-10">
                    
                    {/* Top Decoration */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-full py-2 px-6 flex justify-center gap-4 items-center mb-6 shadow-inner border border-black/5 dark:border-white/5">
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-300 uppercase tracking-widest">Discovery Engine</span>
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    </div>

                    {/* Screen Container */}
                    <div className="bg-transparent rounded-[2.5rem] p-4 md:p-5 shadow-inner border border-black/5 dark:border-white/5 relative mb-6 flex-1 flex flex-col">
                        
                        {/* The Screen */}
                        <div className="bg-white dark:bg-[#362e29] rounded-2xl h-64 lg:h-full min-h-[16rem] overflow-hidden relative shadow-sm border border-black/5 dark:border-white/10 flex items-stretch justify-center flex-1">
                            
                            {/* Glass glare */}
                            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 dark:from-white/5 to-transparent pointer-events-none z-20"></div>

                            <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
                                <AnimatePresence mode="popLayout">
                                {currentDisplay ? (
                                    <motion.div
                                    key={currentDisplay.id}
                                    initial={isSpinning ? { y: -150, opacity: 0.5 } : { opacity: 0, scale: 0.8 }}
                                    animate={isSpinning ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1 }}
                                    exit={isSpinning ? { y: 150, opacity: 0.5 } : { opacity: 0, scale: 0.8 }}
                                    transition={{ duration: isSpinning ? 0.08 : 0.4, ease: "linear" }}
                                    className="flex flex-col items-center justify-center text-center p-4 w-full h-full absolute inset-0"
                                    >
                                    <div className="text-[6rem] md:text-[8rem] leading-none mb-4">
                                        {currentDisplay.emoji}
                                    </div>
                                    
                                    {!isSpinning && resultPark && (
                                        <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="w-full flex flex-col items-center"
                                        >
                                        <h3 className="text-xl md:text-2xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight line-clamp-1 px-4">
                                            {currentDisplay.name}
                                        </h3>
                                        <p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                            {currentDisplay.state} • {currentDisplay.region}
                                        </p>
                                        </motion.div>
                                    )}
                                    </motion.div>
                                ) : filteredParks.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center text-center p-6 w-full h-full absolute inset-0 text-gray-400 dark:text-gray-500"
                                    >
                                        <Icon name="search" className="w-12 h-12 mb-4 opacity-50" />
                                        <p className="font-bold text-lg mb-1 uppercase tracking-wider">No Matches</p>
                                    </motion.div>
                                ) : null}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Result Actions */}
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={spin}
                            disabled={isSpinning || filteredParks.length === 0}
                            className={`w-full py-4 rounded-2xl font-bold text-lg uppercase tracking-widest transition-all
                            ${(isSpinning || filteredParks.length === 0) 
                                ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 shadow-none translate-y-[4px]' 
                                : 'bg-brand-orange text-white shadow-[0_4px_0_0_#9a462a] hover:brightness-110 active:translate-y-[4px] active:shadow-none'
                            }
                            `}
                        >
                            {isSpinning ? 'Generating...' : 'Spin to Discover'}
                        </button>

                        <button
                            onClick={() => resultPark && onParkSelect(resultPark.id)}
                            disabled={isSpinning || !resultPark}
                            className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 border border-black/5 dark:border-white/10
                            ${(isSpinning || !resultPark)
                                ? 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 shadow-none cursor-not-allowed'
                                : 'bg-white dark:bg-white/10 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/20 shadow-sm active:scale-[0.98]'
                            }
                            `}
                        >
                            <span>View Park Details</span>
                            <Icon name="arrowRight" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverView;
