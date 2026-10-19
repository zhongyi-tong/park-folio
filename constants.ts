import { NationalPark, UserParkHistory, Badge } from './types';

// Badge Logic - Updated for nested history structure
export const BADGES: Badge[] = [
  // 1. QUANTITY
  {
    id: 'ranger-rookie',
    name: 'Ranger Rookie',
    description: 'Visit your first National Park.',
    icon: 'compass',
    color: 'bg-green-100 text-green-800', // Fixed standard color
    condition: (history) => history.some(h => h.visits.length > 0)
  },
  {
    id: 'seasoned-explorer',
    name: 'Seasoned Explorer',
    description: 'Visit 5 or more unique National Parks.',
    icon: 'map',
    color: 'bg-stone-200 text-stone-800', // Fixed standard color
    condition: (history) => history.filter(h => h.visits.length > 0).length >= 5
  },
  {
    id: 'junior-ranger',
    name: 'Junior Ranger',
    description: 'Collect stamps from 10 unique parks.',
    icon: 'medal',
    color: 'bg-yellow-200 text-yellow-800',
    condition: (history) => history.filter(h => h.visits.length > 0).length >= 10
  },
  {
    id: 'grand-tour',
    name: 'Grand Tour',
    description: 'Visit 20 unique parks.',
    icon: 'anchor',
    color: 'bg-cyan-200 text-cyan-900',
    condition: (history) => history.filter(h => h.visits.length > 0).length >= 20
  },
  {
    id: 'halfway-there',
    name: 'Halfway There',
    description: 'Visit 31 parks (approx. 50% of all parks).',
    icon: 'star',
    color: 'bg-purple-200 text-purple-800',
    condition: (history) => history.filter(h => h.visits.length > 0).length >= 31
  },

  // 2. GEOGRAPHIC / FEATURES
  {
    id: 'canyon-conqueror',
    name: 'Canyon Conqueror',
    description: 'Visit Grand Canyon, Zion, or Bryce.',
    icon: 'mountain',
    color: 'bg-orange-600 text-white', // Fixed standard color, high contrast
    condition: (history) => history.some(h => h.visits.length > 0 && ['grand-canyon', 'zion', 'bryce-canyon', 'canyonlands'].includes(h.parkId)),
    relevantParkIds: ['grand-canyon', 'zion', 'bryce-canyon', 'canyonlands']
  },
  {
    id: 'coastal-wandering',
    name: 'Coastal Wanderer',
    description: 'Visit a park on the coast (e.g. Acadia, Olympic).',
    icon: 'waves',
    color: 'bg-teal-100 text-teal-800',
    condition: (history) => history.some(h => h.visits.length > 0 && ['acadia', 'olympic', 'everglades', 'biscayne', 'channel-islands'].includes(h.parkId)),
    relevantParkIds: ['acadia', 'olympic', 'everglades', 'biscayne', 'channel-islands']
  },
  {
    id: 'high-altitude',
    name: 'High Altitude',
    description: 'Visit a high elevation park (e.g. Rocky Mountain).',
    icon: 'cloud',
    color: 'bg-stone-200 text-stone-800',
    condition: (history) => history.some(h => h.visits.length > 0 && ['rocky-mountain', 'glacier', 'denali', 'mount-rainier', 'grand-teton'].includes(h.parkId)),
    relevantParkIds: ['rocky-mountain', 'glacier', 'denali', 'mount-rainier', 'grand-teton']
  },
  {
    id: 'island-hopper',
    name: 'Island Hopper',
    description: 'Visit a park outside the contiguous US.',
    icon: 'sun',
    color: 'bg-orange-100 text-orange-800',
    condition: (history) => history.some(h => h.visits.length > 0 && ['denali', 'hawaii-volcanoes', 'haleakala', 'virgin-islands', 'american-samoa', 'gates-of-the-arctic'].includes(h.parkId)),
    relevantParkIds: ['denali', 'hawaii-volcanoes', 'haleakala', 'virgin-islands', 'american-samoa', 'gates-of-the-arctic']
  },
  
  // 3. THEMATIC
  {
    id: 'tree-hugger',
    name: 'Tree Hugger',
    description: 'Visit a park famous for its trees (Redwood, Sequoia).',
    icon: 'leaf',
    color: 'bg-green-100 text-green-800',
    condition: (history) => history.some(h => h.visits.length > 0 && ['redwood', 'sequoia', 'kings-canyon', 'congaree', 'olympic'].includes(h.parkId)),
    relevantParkIds: ['redwood', 'sequoia', 'kings-canyon', 'congaree', 'olympic']
  },
  {
    id: 'lava-chaser',
    name: 'Lava Chaser',
    description: 'Visit a volcanic park (Hawaii, Lassen, Crater Lake).',
    icon: 'fire',
    color: 'bg-red-100 text-red-800',
    condition: (history) => history.some(h => h.visits.length > 0 && ['hawaii-volcanoes', 'haleakala', 'lassen-volcanic', 'crater-lake', 'mount-rainier'].includes(h.parkId)),
    relevantParkIds: ['hawaii-volcanoes', 'haleakala', 'lassen-volcanic', 'crater-lake', 'mount-rainier']
  },
  {
    id: 'ice-age',
    name: 'Ice Age',
    description: 'Visit a park with glaciers (Glacier, Kenai Fjords).',
    icon: 'snowflake',
    color: 'bg-cyan-100 text-cyan-800',
    condition: (history) => history.some(h => h.visits.length > 0 && ['glacier', 'glacier-bay', 'kenai-fjords', 'north-cascades', 'wrangell-st-elias'].includes(h.parkId)),
    relevantParkIds: ['glacier', 'glacier-bay', 'kenai-fjords', 'north-cascades', 'wrangell-st-elias']
  },
  {
    id: 'heat-wave',
    name: 'Heat Wave',
    description: 'Brave the heat in a desert park.',
    icon: 'cactus',
    color: 'bg-yellow-200 text-orange-800',
    condition: (history) => history.some(h => h.visits.length > 0 && ['death-valley', 'joshua-tree', 'saguaro', 'big-bend', 'white-sands'].includes(h.parkId)),
    relevantParkIds: ['death-valley', 'joshua-tree', 'saguaro', 'big-bend', 'white-sands']
  },
  {
    id: 'spelunker',
    name: 'Spelunker',
    description: 'Go underground in a cave park.',
    icon: 'flashlight',
    color: 'bg-gray-800 text-white',
    condition: (history) => history.some(h => h.visits.length > 0 && ['mammoth-cave', 'carlsbad-caverns', 'wind-cave', 'pinnacles'].includes(h.parkId)),
    relevantParkIds: ['mammoth-cave', 'carlsbad-caverns', 'wind-cave', 'pinnacles']
  },
  {
    id: 'wildlife-watcher',
    name: 'Wildlife Watcher',
    description: 'Visit a park known for wildlife (Katmai, Everglades).',
    icon: 'camera',
    color: 'bg-emerald-100 text-emerald-800',
    condition: (history) => history.some(h => h.visits.length > 0 && ['katmai', 'everglades', 'yellowstone', 'theodore-roosevelt', 'isle-royale'].includes(h.parkId)),
    relevantParkIds: ['katmai', 'everglades', 'yellowstone', 'theodore-roosevelt', 'isle-royale']
  },
  {
    id: 'history-buff',
    name: 'History Buff',
    description: 'Visit Yellowstone (the 1st park) or Mesa Verde.',
    icon: 'scroll',
    color: 'bg-amber-100 text-amber-900',
    condition: (history) => history.some(h => h.visits.length > 0 && ['yellowstone', 'mesa-verde', 'hot-springs'].includes(h.parkId)),
    relevantParkIds: ['yellowstone', 'mesa-verde', 'hot-springs']
  },
  {
    id: 'super-fan',
    name: 'Super Fan',
    description: 'Visit the same park 3 or more times.',
    icon: 'heart', 
    color: 'bg-pink-100 text-pink-800',
    condition: (history) => history.some(h => h.visits.length >= 3)
  },
  {
    id: 'fresh-air',
    name: 'New Recruit',
    description: 'Visit one of the newest parks (Post-2019).',
    icon: 'pineCone',
    color: 'bg-lime-100 text-lime-800',
    condition: (history) => history.some(h => h.visits.length > 0 && ['new-river-gorge', 'white-sands', 'indiana-dunes'].includes(h.parkId)),
    relevantParkIds: ['new-river-gorge', 'white-sands', 'indiana-dunes']
  },

  // 4. ELITE / HARD CHALLENGES
  {
    id: 'national-treasure',
    name: 'National Treasure',
    description: 'Visit all 63 US National Parks.',
    icon: 'crown',
    color: 'bg-yellow-300 text-yellow-900 border-yellow-500',
    condition: (history) => history.filter(h => h.visits.length > 0).length >= 63
  },
  {
    id: 'elite-explorer',
    name: 'Elite Explorer',
    description: 'Visit 50 unique National Parks.',
    icon: 'trophy',
    color: 'bg-indigo-100 text-indigo-900',
    condition: (history) => history.filter(h => h.visits.length > 0).length >= 50
  },
  {
    id: 'the-last-frontier',
    name: 'The Last Frontier',
    description: 'Visit all 8 National Parks in Alaska.',
    icon: 'snowflake',
    color: 'bg-sky-200 text-sky-900',
    condition: (history) => {
        const alaska = ['denali', 'gates-of-the-arctic', 'glacier-bay', 'katmai', 'kenai-fjords', 'kobuk-valley', 'lake-clark', 'wrangell-st-elias'];
        return alaska.every(id => history.some(h => h.parkId === id && h.visits.length > 0));
    },
    relevantParkIds: ['denali', 'gates-of-the-arctic', 'glacier-bay', 'katmai', 'kenai-fjords', 'kobuk-valley', 'lake-clark', 'wrangell-st-elias']
  },
  {
    id: 'golden-state-warrior',
    name: 'Golden State Warrior',
    description: 'Visit all 9 National Parks in California.',
    icon: 'star',
    color: 'bg-orange-200 text-orange-900',
    condition: (history) => {
        const ca = ['channel-islands', 'death-valley', 'joshua-tree', 'kings-canyon', 'lassen-volcanic', 'pinnacles', 'redwood', 'sequoia', 'yosemite'];
        return ca.every(id => history.some(h => h.parkId === id && h.visits.length > 0));
    },
    relevantParkIds: ['channel-islands', 'death-valley', 'joshua-tree', 'kings-canyon', 'lassen-volcanic', 'pinnacles', 'redwood', 'sequoia', 'yosemite']
  },
  {
    id: 'red-rock-royalty',
    name: 'Red Rock Royalty',
    description: 'Visit the "Mighty 5" parks in Utah.',
    icon: 'sun',
    color: 'bg-red-200 text-red-900',
    condition: (history) => {
        const utah = ['arches', 'bryce-canyon', 'canyonlands', 'capitol-reef', 'zion'];
        return utah.every(id => history.some(h => h.parkId === id && h.visits.length > 0));
    },
    relevantParkIds: ['arches', 'bryce-canyon', 'canyonlands', 'capitol-reef', 'zion']
  },
  {
    id: 'remote-ranger',
    name: 'Remote Ranger',
    description: 'Visit 3 hard-to-reach parks (Samoa, Dry Tortugas, Isle Royale, Kobuk).',
    icon: 'plane',
    color: 'bg-slate-200 text-slate-900',
    condition: (history) => {
        const remote = ['american-samoa', 'dry-tortugas', 'isle-royale', 'kobuk-valley', 'gates-of-the-arctic'];
        const visited = remote.filter(id => history.some(h => h.parkId === id && h.visits.length > 0));
        return visited.length >= 3;
    },
    relevantParkIds: ['american-samoa', 'dry-tortugas', 'isle-royale', 'kobuk-valley', 'gates-of-the-arctic']
  },
  {
    id: 'true-grit',
    name: 'True Grit',
    description: 'Visit the hottest (Death Valley) and coldest (Gates of Arctic) parks.',
    icon: 'skull',
    color: 'bg-stone-300 text-stone-900',
    condition: (history) => {
         return history.some(h => h.parkId === 'death-valley' && h.visits.length > 0) &&
                history.some(h => h.parkId === 'gates-of-the-arctic' && h.visits.length > 0);
    },
    relevantParkIds: ['death-valley', 'gates-of-the-arctic']
  },
  {
    id: 'hydro-homie',
    name: 'Hydro Homie',
    description: 'Visit 5 major water-based parks.',
    icon: 'anchor',
    color: 'bg-cyan-200 text-cyan-900',
    condition: (history) => {
        const water = ['biscayne', 'dry-tortugas', 'channel-islands', 'isle-royale', 'voyageurs', 'virgin-islands'];
        const visited = water.filter(id => history.some(h => h.parkId === id && h.visits.length > 0));
        return visited.length >= 5;
    },
    relevantParkIds: ['biscayne', 'dry-tortugas', 'channel-islands', 'isle-royale', 'voyageurs', 'virgin-islands']
  },
  {
    id: 'peak-performer',
    name: 'Peak Performer',
    description: 'Visit Denali, Rainier, and Rocky Mountain.',
    icon: 'mountain',
    color: 'bg-zinc-200 text-zinc-800',
    condition: (history) => {
         return history.some(h => h.parkId === 'denali' && h.visits.length > 0) &&
                history.some(h => h.parkId === 'mount-rainier' && h.visits.length > 0) &&
                history.some(h => h.parkId === 'rocky-mountain' && h.visits.length > 0);
    },
    relevantParkIds: ['denali', 'mount-rainier', 'rocky-mountain']
  },
  {
    id: 'subterranean-master',
    name: 'Cave Master',
    description: 'Visit Mammoth Cave, Carlsbad Caverns, and Wind Cave.',
    icon: 'diamond',
    color: 'bg-purple-300 text-purple-900',
    condition: (history) => {
         return history.some(h => h.parkId === 'mammoth-cave' && h.visits.length > 0) &&
                history.some(h => h.parkId === 'carlsbad-caverns' && h.visits.length > 0) &&
                history.some(h => h.parkId === 'wind-cave' && h.visits.length > 0);
    },
    relevantParkIds: ['mammoth-cave', 'carlsbad-caverns', 'wind-cave']
  },
  {
    id: 'atlantic-avenue',
    name: 'Atlantic Avenue',
    description: 'Visit Acadia, Shenandoah, Congaree, and Everglades.',
    icon: 'map',
    color: 'bg-emerald-200 text-emerald-900',
    condition: (history) => {
        const east = ['acadia', 'shenandoah', 'congaree', 'everglades'];
        return east.every(id => history.some(h => h.parkId === id && h.visits.length > 0));
    },
    relevantParkIds: ['acadia', 'shenandoah', 'congaree', 'everglades']
  },
  {
    id: 'ring-of-fire',
    name: 'Ring of Fire',
    description: 'Visit Hawaii Volcanoes, Haleakalā, Lassen, and Crater Lake.',
    icon: 'fire',
    color: 'bg-rose-200 text-rose-900',
    condition: (history) => {
        const vol = ['hawaii-volcanoes', 'haleakala', 'lassen-volcanic', 'crater-lake'];
        return vol.every(id => history.some(h => h.parkId === id && h.visits.length > 0));
    },
    relevantParkIds: ['hawaii-volcanoes', 'haleakala', 'lassen-volcanic', 'crater-lake']
  }
];
