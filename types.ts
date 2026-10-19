

export interface Coordinates {
  lat: number;
  lng: number;
}

export type Region = 'Alaska' | 'West Coast' | 'Rockies' | 'Southwest' | 'Midwest' | 'East Coast' | 'Tropical';
export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type Popularity = 'High' | 'Medium' | 'Low';

export interface NationalPark {
  id: string;
  name: string;
  state: string;
  emoji: string;
  coordinates: Coordinates;
  description: string;
  established: string;
  funFact: string;
  region: Region;
  bestSeasons: Season[];
  popularity: Popularity;
}

export type RatingValue = 0 | 1 | 2 | 3;

export interface VisitLog {
  date: string;
  notes: string;
  igPostIds?: string[];
}

export interface UserParkHistory {
  parkId: string;
  rating?: RatingValue;
  visits: VisitLog[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (history: UserParkHistory[], parks: NationalPark[]) => boolean;
  color: string;
  relevantParkIds?: string[]; // Optional list of parks that contribute to this badge
}

export type ViewState = 'MAP' | 'DISCOVER' | 'BADGES' | 'LOGS';
