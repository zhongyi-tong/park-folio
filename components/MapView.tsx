
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { AnimatePresence, motion } from 'framer-motion';
import { NationalPark, UserParkHistory } from '../types';
import { Icon } from '../icons';

interface MapViewProps {
  parks: NationalPark[];
  visits: UserParkHistory[];
  onParkSelect: (id: string) => void;
}

const FIPS_TO_ABBR: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE",
  "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
  "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ", "35": "NM",
  "36": "NY", "37": "NC", "38": "ND", "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY"
};

const MapView: React.FC<MapViewProps> = ({ parks, visits, onParkSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [geoData, setGeoData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredPark, setHoveredPark] = useState<string | null>(null);
  
  // Calculate which states have all their parks visited
  const completedStates = useMemo(() => {
    const parksByState: Record<string, string[]> = {};
    parks.forEach(p => {
        if (!parksByState[p.state]) parksByState[p.state] = [];
        parksByState[p.state].push(p.id);
    });

    const completed = new Set<string>();
    const visitedIds = new Set(visits.flatMap(v => v.visits.length > 0 ? [v.parkId] : []));

    Object.entries(parksByState).forEach(([state, parkIds]) => {
        if (parkIds.length > 0 && parkIds.every(id => visitedIds.has(id))) {
            completed.add(state);
        }
    });
    return completed;
  }, [parks, visits]);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(response => response.json())
      .then(data => {
        setGeoData(data);
      });

    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const { width, height } = dimensions;

    const isMobile = width < 768;
    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2 + (isMobile ? 0 : 30)])
      .scale(isMobile ? width * 1.4 : Math.min(width, height) * 1.75);

    const projectableParks = parks.filter(p => projection([p.coordinates.lng, p.coordinates.lat]) !== null);

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[-width, -height], [width * 2, height * 2]])
      .on("zoom", (event) => {
        const k = event.transform.k;
        g.attr("transform", event.transform);
        
        const baseMobileScale = isMobile ? 0.7 : 1.0;

        // Collision logic
        const MIN_DIST = 36;
        const DOT_HIDE_DIST = 26;
        
        const coordsCache = new Map<string, [number, number]>();
        for (const p of projectableParks) {
            const c = projection([p.coordinates.lng, p.coordinates.lat]);
            if (c) coordsCache.set(p.id, c as [number, number]);
        }

        const visibleEmojis = new Set<string>();
        const visibleDots = new Set<string>();
        
        const visitedParksData = projectableParks.filter(p => visits.find(v => v.parkId === p.id && v.visits.length > 0));
        
        for (const p of visitedParksData) {
            const coordsP = coordsCache.get(p.id);
            if (!coordsP) continue;
            let overlap = false;
            for (const vId of visibleEmojis) {
                const coordsV = coordsCache.get(vId);
                if (!coordsV) continue;
                const dist = Math.hypot(coordsP[0] - coordsV[0], coordsP[1] - coordsV[1]) * k;
                if (dist < MIN_DIST) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) {
                visibleEmojis.add(p.id);
            }
        }

        for (const p of projectableParks) {
            if (visibleEmojis.has(p.id)) continue;
            const coordsP = coordsCache.get(p.id);
            if (!coordsP) continue;
            let dotOverlap = false;
            for (const eId of visibleEmojis) {
                const coordsE = coordsCache.get(eId);
                if (!coordsE) continue;
                const dist = Math.hypot(coordsP[0] - coordsE[0], coordsP[1] - coordsE[1]) * k;
                if (dist < DOT_HIDE_DIST) {
                    dotOverlap = true;
                    break;
                }
            }
            if (!dotOverlap) {
                visibleDots.add(p.id);
            }
        }

        // Scale markers
        g.selectAll(".marker-group")
          .attr("transform", function() {
            // Check if this element is currently being hovered (scaled up)
            const isHovered = d3.select(this).classed("is-hovered");
            const apparentScale = Math.min(1, 0.65 + (k - 1) * 0.15) * baseMobileScale; // Smaller when zoomed out, and smaller on mobile
            const scale = isHovered ? (1.5 * apparentScale / k) : (apparentScale / k);
            return `scale(${scale})`;
          })
          .each(function(d: any) {
              const isVisited = visits.find(v => v.parkId === d.id && v.visits.length > 0);
              const group = d3.select(this);
              let visible = false;
              if (isVisited) {
                  const showEmoji = visibleEmojis.has(d.id);
                  const showDot = visibleDots.has(d.id);
                  visible = showEmoji || showDot;
                  group.select(".emoji-marker")
                      .style("opacity", showEmoji ? 1 : 0)
                      .style("pointer-events", showEmoji ? "auto" : "none");
                  group.select(".glass-dot")
                      .style("opacity", showDot ? 1 : 0);
              } else {
                  const showDot = visibleDots.has(d.id);
                  visible = showDot;
                  group.select(".unvisited-dot")
                      .style("opacity", showDot ? 1 : 0);
              }
              group.style("pointer-events", visible ? "auto" : "none");
          });
        
        // Scale and toggle Park Labels (Show > 2.5x zoom)
        const showLabels = k > 2.5;
        g.selectAll(".park-label")
            .style("opacity", function(d: any) {
                if (!showLabels) return 0;
                const isVisited = visits.find(v => v.parkId === d.id && v.visits.length > 0);
                if (isVisited) {
                    return (visibleEmojis.has(d.id) || visibleDots.has(d.id)) ? 1 : 0;
                } else {
                    return visibleDots.has(d.id) ? 1 : 0;
                }
            })
            .attr("transform", `scale(${1/k})`);
        
        // Scale State Labels
        g.selectAll(".state-label")
            .attr("transform", function() {
                const sel = d3.select(this);
                const x = parseFloat(sel.attr("data-x"));
                const y = parseFloat(sel.attr("data-y"));
                return `translate(${x}, ${y}) scale(${1 / k})`;
            });
      });

    svg.call(zoom as any);

    const pathGenerator = d3.geoPath().projection(projection);
    const states = topojson.feature(geoData, geoData.objects.states);

    g.selectAll("*").remove();

    // 1. Water Outline
    g.append("g")
      .selectAll("path")
      .data((states as any).features)
      .enter()
      .append("path")
      .attr("d", pathGenerator as any)
      .attr("fill", "none")
      .attr("stroke", "rgb(var(--brand-teal) / 0.2)") 
      .attr("stroke-width", 10)
      .attr("stroke-linejoin", "round")
      .attr("stroke-opacity", 0.2);

    // 2. Land Layer
    const landGroup = g.append("g");
    const labelGroup = g.append("g").style("pointer-events", "none");

    landGroup.selectAll("path")
      .data((states as any).features)
      .enter()
      .append("path")
      .attr("d", pathGenerator as any)
      .attr("fill", (d: any) => {
          const fips = typeof d.id === 'number' ? d.id.toString().padStart(2, '0') : d.id;
          const abbr = FIPS_TO_ABBR[fips];
          if (completedStates.has(abbr)) return "rgb(var(--map-visited))";
          return "rgb(var(--map-unvisited))";
      }) 
      .attr("stroke", "rgb(var(--brand-navBorder))")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("class", (d: any) => {
          const fips = typeof d.id === 'number' ? d.id.toString().padStart(2, '0') : d.id;
          const abbr = FIPS_TO_ABBR[fips];
          const isCompleted = completedStates.has(abbr);
          // Using Tailwind for hover states doesn't work perfectly with dynamic rgb variables in SVG without extending theme, 
          // but we can just use inline styles or leave it since hover state is controlled via class
          return isCompleted 
            ? "transition-colors duration-200 hover:opacity-80" 
            : "transition-colors duration-200 hover:opacity-80";
      })
      .on("mouseenter", (event, d: any) => {
          const centroid = pathGenerator.centroid(d);
          const fips = typeof d.id === 'number' ? d.id.toString().padStart(2, '0') : d.id;
          const abbr = FIPS_TO_ABBR[fips];
          labelGroup.selectAll("*").remove();

          if (abbr && centroid) {
              const currentK = d3.zoomTransform(svgRef.current!).k;
              labelGroup.append("text")
                .attr("class", "state-label")
                .attr("data-x", centroid[0])
                .attr("data-y", centroid[1])
                .text(abbr)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .attr("fill", "rgb(var(--brand-brown))")
                .attr("font-weight", "bold")
                .attr("opacity", 0.6)
                .style("font-size", "0.875rem")
                .attr("transform", `translate(${centroid[0]}, ${centroid[1]}) scale(${1 / currentK})`);
          }
      })
      .on("mouseleave", () => {
          labelGroup.selectAll("*").remove();
      });

    // 4. Parks
    const parkGroups = g.append("g")
      .selectAll("g")
      .data(projectableParks)
      .enter()
      .append("g")
      .attr("class", "cursor-pointer")
      .attr("transform", (d) => {
        const coords = projection([d.coordinates.lng, d.coordinates.lat]);
        return `translate(${coords![0]}, ${coords![1]})`;
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        onParkSelect(d.id);
      });

    parkGroups.each(function(d) {
      const group = d3.select(this);
      const parkHistory = visits.find(v => v.parkId === d.id);
      const isVisited = parkHistory && parkHistory.visits.length > 0;
      
      const currentK = svgRef.current ? d3.zoomTransform(svgRef.current).k : 1;
      const isMobile = dimensions.width < 768;
      const baseMobileScale = isMobile ? 0.7 : 1.0;
      const apparentScale = Math.min(1, 0.65 + (currentK - 1) * 0.15) * baseMobileScale;

      const marker = group.append("g")
        .attr("class", "marker-group")
        .attr("transform", `scale(${apparentScale / currentK})`);
      
      // Floating animation container
      const animatedContent = marker.append("g")
        .attr("class", "animate-float")
        .style("animation-delay", () => `${Math.random() * 2}s`);

      // Hit area (invisible)
      animatedContent.append("circle")
        .attr("r", 20)
        .attr("fill", "transparent");

      if (isVisited) {
        const fo = animatedContent.append("foreignObject")
            .attr("class", "emoji-marker")
            .attr("x", -18)
            .attr("y", -18)
            .attr("width", 36)
            .attr("height", 36)
            .style("overflow", "visible");
            
        fo.append("xhtml:div")
            .attr("class", "w-9 h-9 rounded-full flex items-center justify-center bg-white/50 dark:bg-white/20 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 text-[24px]")
            .text(d.emoji || "🌲");

        animatedContent.append("circle")
            .attr("class", "glass-dot")
            .attr("r", 6)
            .attr("fill", "rgba(255, 255, 255, 0.8)")
            .attr("stroke", "rgba(255, 255, 255, 1)")
            .attr("stroke-width", 2)
            .style("opacity", 0) // Hidden by default, shown by zoom handler if overlapping
            .style("pointer-events", "none");
      } else {
        const fo = animatedContent.append("foreignObject")
            .attr("class", "unvisited-dot")
            .attr("x", -10)
            .attr("y", -10)
            .attr("width", 20)
            .attr("height", 20)
            .style("overflow", "visible");
            
        fo.append("xhtml:div")
            .attr("class", "w-5 h-5 rounded-full flex items-center justify-center bg-white/50 dark:bg-white/20 backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-brand-orange/40 dark:border-brand-orange/60")
            .append("xhtml:div")
            .attr("class", "w-2 h-2 rounded-full bg-brand-orange");
      }

      // Park Name Label (Hidden by default)
      const textLabel = group.append("text")
        .attr("class", "park-label")
        .attr("text-anchor", "middle")
        .attr("y", 34) // Position below marker (increased space)
        .attr("fill", "rgb(var(--brand-brown))")
        .attr("stroke", "rgb(var(--brand-navBtn))")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("paint-order", "stroke")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("opacity", 0) // Start hidden
        .style("transition", "opacity 0.2s ease")
        .style("pointer-events", "none");

      // Handle multi-line for long names with max width constraint
      const words = d.name.split(' ');
      const lines = [];
      let currentLine = words[0];
      for (let i = 1; i < words.length; i++) {
          if (currentLine.length + words[i].length + 1 <= 14) {
              currentLine += " " + words[i];
          } else {
              lines.push(currentLine);
              currentLine = words[i];
          }
      }
      lines.push(currentLine);

      if (lines.length > 1) {
          lines.forEach((line, i) => {
              textLabel.append("tspan")
                  .attr("x", 0)
                  .attr("dy", i === 0 ? 0 : "1.1em")
                  .text(line);
          });
      } else {
          textLabel.text(d.name);
      }
    });

    // Handle Hover "Bounce" Effect via D3
    parkGroups
      .on("mouseenter", function(event, d) {
          setHoveredPark(d.id);
          const currentK = d3.zoomTransform(svgRef.current!).k;
          const isMobile = dimensions.width < 768;
          const baseMobileScale = isMobile ? 0.7 : 1.0;
          const apparentScale = Math.min(1, 0.65 + (currentK - 1) * 0.15) * baseMobileScale;
          
          // Select the specific marker group inside this park group
          d3.select(this).select(".marker-group")
            .classed("is-hovered", true)
            .transition()
            .duration(300)
            .ease(d3.easeElasticOut)
            .attr("transform", `scale(${1.5 * apparentScale / currentK})`); // Scale up 1.5x relative to apparent size
      })
      .on("mouseleave", function() {
          setHoveredPark(null);
          const currentK = d3.zoomTransform(svgRef.current!).k;
          const isMobile = dimensions.width < 768;
          const baseMobileScale = isMobile ? 0.7 : 1.0;
          const apparentScale = Math.min(1, 0.65 + (currentK - 1) * 0.15) * baseMobileScale;

          d3.select(this).select(".marker-group")
            .classed("is-hovered", false)
            .transition()
            .duration(200)
            .ease(d3.easeQuadOut)
            .attr("transform", `scale(${apparentScale / currentK})`); // Return to normal apparent size
      });

    if (isMobile) {
      const westCoastCoords = projection([-114, 38]);
      if (westCoastCoords) {
        const zoomScale = 2.1;
        const tx = width * 0.45 - westCoastCoords[0] * zoomScale;
        const ty = height * 0.5 - westCoastCoords[1] * zoomScale;
        const initialTransform = d3.zoomIdentity.translate(tx, ty).scale(zoomScale);
        svg.call(zoom.transform as any, initialTransform);
      }
    } else {
      svg.call(zoom.transform as any, d3.zoomIdentity);
    }

  }, [geoData, dimensions, parks, visits, onParkSelect, completedStates]);

  return (
    <div 
        ref={containerRef}
        className="w-full h-full relative pattern-map-dots overflow-hidden"
    >
      {!geoData && (
         <div className="absolute inset-0 flex items-center justify-center text-brand-tealDark bg-white/50 dark:bg-black/20 z-10 rounded-3xl m-12 backdrop-blur-xl backdrop-saturate-150 border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <span className="font-bold text-xl tracking-widest text-brand-brown/60">Loading Map...</span>
         </div>
      )}

      {/* Floating Clouds Layer */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-40">
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                initial={{ x: -200, y: Math.random() * 400 }}
                animate={{ x: ['110vw'], y: [Math.random() * 400, Math.random() * 400 + 50] }}
                transition={{ 
                    duration: 40 + Math.random() * 40, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: i * 10
                }}
                className="absolute text-white"
            >
                <Icon name="cloud" className={`w-${32 + i * 8} h-${32 + i * 8}`} />
            </motion.div>
        ))}
      </div>

      <svg ref={svgRef} width="100%" height="100%" className="block relative z-0">
        <g ref={gRef} />
      </svg>
      
      {/* Tooltip */}
      <div className="absolute bottom-6 left-0 right-0 z-30 pointer-events-none flex justify-start px-4 md:px-8 max-w-7xl mx-auto w-full">
        <AnimatePresence>
          {hoveredPark && (
             <motion.div 
                initial={{ scale: 0, rotate: -5, y: 20 }}
                animate={{ scale: 1, rotate: 0, y: 0 }}
                exit={{ scale: 0, rotate: 5, y: 10, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="bg-white/50 dark:bg-white/10 backdrop-blur-xl backdrop-saturate-150 p-1.5 pr-4 md:p-2 md:pr-5 rounded-2xl shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border border-white/40 dark:border-white/10 max-w-sm"
             >
               <div className="flex items-center gap-2.5 md:gap-3">
                   <div className="bg-brand-orange w-8 h-8 md:w-10 md:h-10 rounded-[10px] md:rounded-xl flex items-center justify-center border border-white/40 dark:border-white/10 shadow-sm shrink-0">
                      <span className="font-bold text-white text-[10px] md:text-xs">
                         {parks.find(p => p.id === hoveredPark)?.state}
                      </span>
                   </div>
                   
                   <div>
                       <h3 className="font-serif text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100 leading-none drop-shadow-sm">
                         {parks.find(p => p.id === hoveredPark)?.name}
                       </h3>
                   </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapView;
