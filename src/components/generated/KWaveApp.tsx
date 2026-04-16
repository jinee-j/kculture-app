import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { ContentFeed } from './ContentFeed';
type KWaveAppProps = {
  onBack?: () => void;
  initialArticleId?: string;
};
export const KWaveApp = ({
  onBack,
  initialArticleId
}: KWaveAppProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return <div className="flex flex-col min-h-screen bg-[#f7f7f8]" style={{
    overscrollBehavior: 'contain'
  }}>
      {/* Back bar — only shown when launched from Yahoo portal */}
      <AnimatePresence>
        {onBack && <motion.div initial={{
        opacity: 0,
        y: -8
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -8
      }} transition={{
        duration: 0.2
      }} className="shrink-0 bg-gradient-to-r from-pink-500 to-violet-600 px-4 pt-3 pb-3 flex items-center gap-2 shadow-md z-10">
            <button onClick={onBack} className="flex items-center gap-1.5 text-white hover:text-white/80 transition-colors">
              <ChevronLeft size={16} />
              <span className="text-[12px] font-bold tracking-wide">Yahoo! JAPAN に戻る</span>
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-[12px] font-black text-white tracking-wide">K·WAVE</span>
              <span className="text-[13px]">🌊</span>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* Main app content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-contain">
        <ContentFeed initialArticleId={initialArticleId} scrollContainerRef={scrollContainerRef} />
      </div>
    </div>;
};