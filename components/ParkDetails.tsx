import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { NationalPark, UserParkHistory, RatingValue } from '../types';
import { Icon } from '../icons';

const InstagramEmbed = ({ postId }: { postId: string }) => {
  useEffect(() => {
    if (!document.getElementById('instagram-embed-script')) {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).instgrm) {
      // Need a slight delay when rendering dynamically added embeds
      setTimeout(() => {
        if ((window as any).instgrm) {
          (window as any).instgrm.Embeds.process();
        }
      }, 100);
    }
  }, [postId]);

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-black/5 relative bg-white my-4">
      <style dangerouslySetInnerHTML={{__html: `
        iframe.instagram-media {
          min-width: 100% !important;
          width: 100% !important;
        }
      `}} />
      <div style={{ marginTop: '-58px', marginBottom: '-130px', marginLeft: '-2px', marginRight: '-2px' }}>
        <blockquote className="instagram-media" data-instgrm-permalink={`https://www.instagram.com/p/${postId}/?utm_source=ig_embed&amp;utm_campaign=loading`} data-instgrm-version="14" style={{ background: 'transparent', border: 0, margin: '0', maxWidth: '100%', padding: 0, width: '100%' } as any}>
          <div style={{ padding: '16px' }}>
            <a href={`https://www.instagram.com/p/${postId}/?utm_source=ig_embed&amp;utm_campaign=loading`} style={{ background: 'transparent', lineHeight: 0, padding: '0 0', textAlign: 'center', textDecoration: 'none', width: '100%' }} target="_blank" rel="noopener noreferrer">
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: '40px', marginRight: '14px', width: '40px' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
                  <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', marginBottom: '6px', width: '100px' }}></div>
                  <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', width: '60px' }}></div>
                </div>
              </div>
              <div style={{ padding: '19% 0' }}></div>
              <div style={{ display: 'block', height: '50px', margin: '0 auto 12px', width: '50px' }}>
                <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                  <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                      <g>
                        <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                      </g>
                    </g>
                  </g>
                </svg>
              </div>
              <div style={{ paddingTop: '8px' }}>
                <div style={{ color: '#3897f0', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 550, lineHeight: '18px' }}>View this post on Instagram</div>
              </div>
              <div style={{ padding: '12.5% 0' }}></div>
              <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '14px', alignItems: 'center' }}>
                <div>
                  <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', height: '12.5px', width: '12.5px', transform: 'translateX(0px) translateY(7px)' }}></div>
                  <div style={{ backgroundColor: '#F4F4F4', height: '12.5px', transform: 'rotate(-45deg) translateX(3px) translateY(1px)', width: '12.5px', flexGrow: 0, marginRight: '14px', marginLeft: '2px' }}></div>
                  <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', height: '12.5px', width: '12.5px', transform: 'translateX(9px) translateY(-18px)' }}></div>
                </div>
                <div style={{ marginLeft: '8px' }}>
                  <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: '20px', width: '20px' }}></div>
                  <div style={{ width: 0, height: 0, borderTop: '2px solid transparent', borderLeft: '6px solid #f4f4f4', borderBottom: '2px solid transparent', transform: 'translateX(16px) translateY(-4px) rotate(30deg)' }}></div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <div style={{ width: '0px', borderTop: '8px solid #F4F4F4', borderRight: '8px solid transparent', transform: 'translateY(16px)' }}></div>
                  <div style={{ backgroundColor: '#F4F4F4', flexGrow: 0, height: '12px', width: '16px', transform: 'translateY(-4px)' }}></div>
                  <div style={{ width: 0, height: 0, borderTop: '8px solid #F4F4F4', borderLeft: '8px solid transparent', transform: 'translateY(-4px) translateX(8px)' }}></div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', marginBottom: '6px', width: '224px' }}></div>
                <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', width: '144px' }}></div>
              </div>
            </a>
            <p style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', lineHeight: '17px', marginBottom: 0, marginTop: '8px', overflow: 'hidden', padding: '8px 0 7px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <a href={`https://www.instagram.com/p/${postId}/?utm_source=ig_embed&amp;utm_campaign=loading`} style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 'normal', lineHeight: '17px', textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">A post shared by Zhongyi Tong (@zhongyi.life)</a>
            </p>
          </div>
        </blockquote>
      </div>
    </div>
  );
};

interface ParkDetailsProps {
  park: NationalPark;
  visit?: UserParkHistory;
  onClose: () => void;
}

const RATING_LABELS: Record<number, string> = {
    1: "A pleasant stop",
    2: "Worth a detour",
    3: "Worth a dedicated trip"
};

const ParkDetails: React.FC<ParkDetailsProps> = ({ park, visit, onClose }) => {
  const hasVisits = visit && visit.visits.length > 0;
  const sortedVisits = hasVisits ? [...visit.visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];

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
        <div className="bg-white/95 dark:bg-[#2f2824]/90 backdrop-blur-3xl backdrop-saturate-200 border border-white/50 dark:border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] shadow-2xl pointer-events-auto flex flex-col relative">
            
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 z-50 bg-white/60 dark:bg-white/10 hover:bg-white/95 dark:hover:bg-white/20 border border border-white/40 dark:border-white/10 shadow-[inset_0_1px_0px_rgba(255,255,255,0.8),inset_0_-1px_0px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.4)] dark:shadow-[inset_0_1px_0px_rgba(255,255,255,0.2),inset_0_0_0_1px_rgba(255,255,255,0.05)] text-gray-700 dark:text-gray-300 transition-colors w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl backdrop-saturate-150"
            >
                <Icon name="x" className="w-5 h-5" />
            </button>

            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                
                {/* LEFT: Park Identity */}
                <div className="flex-1 p-8 md:p-12 md:overflow-y-auto bg-transparent border-b md:border-b-0 md:border-r border-black/5 dark:border-white/10">
                     <div className="flex flex-col max-w-md mx-auto">
                         
                         {/* Stamp/Sticker Icon */}
                         <div className="mb-8 group shrink-0 relative self-start">
                             <div className="w-24 h-24 bg-white dark:bg-[#362e29] rounded-2xl flex items-center justify-center text-5xl shadow-sm border border-black/5 dark:border-white/10 rotate-[-3deg] group-hover:rotate-0 transition-transform duration-300">
                                {park.emoji}
                             </div>
                             {/* State Tag */}
                             <div className="absolute -bottom-2 -right-4 bg-brand-orange text-white font-medium text-xs px-3 py-1 rounded-full shadow-sm rotate-3">
                                {park.state}
                             </div>
                         </div>

                         <h2 className="text-4xl md:text-5xl font-serif text-gray-900 dark:text-gray-100 mb-6 leading-tight tracking-tight">
                            {park.name}
                         </h2>

                         <div className="space-y-8">
                            <div className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                {park.description}
                            </div>

                            {/* Ranger Fact */}
                            <div className="pt-6 border-t border-black/5 dark:border-white/10 mt-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="text-brand-orange">
                                        <Icon name="leaf" className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wider">Ranger's Secret</h4>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {park.funFact}
                                </p>
                            </div>
                         </div>
                     </div>
                </div>

                {/* RIGHT: Visitor Log */}
                <div className="flex-1 p-8 md:p-12 md:overflow-y-auto bg-white/20 dark:bg-black/20 relative">
                     <div className="max-w-md mx-auto">
                        {/* Header Section */}
                        <div className="mb-10">
                            <h3 className="text-2xl font-serif text-gray-900 dark:text-gray-100 mb-2">Visits & Memories</h3>
                            {hasVisits ? (
                                <p className="text-gray-500 dark:text-gray-400">You've visited this park {visit.visits.length} time{visit.visits.length > 1 ? 's' : ''}.</p>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">You haven't logged any visits yet.</p>
                            )}

                            {/* Rating Row */}
                             {hasVisits && (
                                <div className="mt-6 flex items-center gap-4 border-t border-b border-black/5 dark:border-white/10 py-4">
                                    <div className="flex-1">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mb-1">Your Rating</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {visit?.rating ? RATING_LABELS[visit.rating] : "No Rating"}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(v => (
                                            <div key={v} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${v <= (visit?.rating || 0) ? 'bg-brand-orange text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-gray-600'}`}>
                                                <Icon name="thumbsUp" className="w-4 h-4" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )}
                        </div>

                        {hasVisits ? (
                             <div className="space-y-12">
                                {sortedVisits.map((log, idx) => (
                                    <div key={idx} className="flex flex-col">
                                         <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                                            {new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                         </h4>

                                         <div className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">
                                            {log.notes || <span className="text-gray-500 dark:text-gray-400 italic">No notes recorded for this expedition.</span>}
                                         </div>

                                         {log.igPostIds && log.igPostIds.length > 0 && (
                                             <div className="flex flex-col gap-4">
                                                 {log.igPostIds.map(postId => (
                                                     <InstagramEmbed key={postId} postId={postId} />
                                                 ))}
                                             </div>
                                         )}
                                    </div>
                                ))}
                             </div>
                        ) : (
                             <div className="py-12 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                                 <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                     <Icon name="hikingBoot" className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                 </div>
                                 <p className="max-w-[200px]">Mark this park as visited to start logging your memories.</p>
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

export default ParkDetails;
