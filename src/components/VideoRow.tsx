"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import HorizontalThumbnail from "./HorizontalThumbnail";
import { Video } from "../../types/custom_types";

interface VideoRowProps {
  title: string;
  videos: Video[];
  onViewAll?: () => void;
}

const VideoRow = ({ title, videos, onViewAll }: VideoRowProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftChevron, setShowLeftChevron] = useState(false);
  const [showRightChevron, setShowRightChevron] = useState(true);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const mouseMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const preventClickRef = useRef(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftChevron(scrollLeft > 0);
      setShowRightChevron(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      checkScrollPosition();
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      // Check on resize
      window.addEventListener("resize", checkScrollPosition);
      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
        // Clean up timeout on unmount
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
      };
    }
  }, [videos]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't interfere with button clicks
    if ((e.target as HTMLElement).closest("button")) return;
    
    // Prevent default drag behavior on images and links
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG" || target.closest("a") || target.closest("img")) {
      e.preventDefault();
    }
    
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const rect = container.getBoundingClientRect();
    startXRef.current = e.clientX - rect.left;
    scrollLeftRef.current = container.scrollLeft;
    isDraggingRef.current = true;
    hasMovedRef.current = false;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !scrollContainerRef.current) return;
      
      e.preventDefault(); // Prevent default drag behavior
      
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      
      // Capture clientX before RAF to avoid stale values
      const clientX = e.clientX;
      
      rafIdRef.current = requestAnimationFrame(() => {
        if (!isDraggingRef.current || !scrollContainerRef.current) return;
        
        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();
        const currentX = clientX - rect.left;
        const walk = (currentX - startXRef.current); // Direct scroll for smoother feel
        
        // Only start dragging if mouse moved more than 3px (prevents accidental drag on click)
        if (Math.abs(walk) > 3) {
          hasMovedRef.current = true;
          container.style.cursor = "grabbing";
          container.style.userSelect = "none";
          container.scrollLeft = scrollLeftRef.current - walk;
        }
      });
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      // Cancel any pending animation frame
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      
      // If we dragged, set flag to prevent click events on links
      if (hasMovedRef.current) {
        preventClickRef.current = true;
        // Clear the flag after a short delay to allow click event to be prevented
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
        clickTimeoutRef.current = setTimeout(() => {
          preventClickRef.current = false;
        }, 300);
      }
      
      isDraggingRef.current = false;
      hasMovedRef.current = false;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = "grab";
        scrollContainerRef.current.style.userSelect = "";
      }
      
      if (mouseMoveHandlerRef.current) {
        document.removeEventListener("mousemove", mouseMoveHandlerRef.current);
        mouseMoveHandlerRef.current = null;
      }
      if (mouseUpHandlerRef.current) {
        document.removeEventListener("mouseup", mouseUpHandlerRef.current);
        mouseUpHandlerRef.current = null;
      }
    };

    mouseMoveHandlerRef.current = handleGlobalMouseMove;
    mouseUpHandlerRef.current = handleGlobalMouseUp;
    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);
  };

  const handleMouseLeave = () => {
    if (!scrollContainerRef.current) return;
    
    // Cancel any pending animation frame
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // If we were dragging, prevent clicks
    if (hasMovedRef.current) {
      preventClickRef.current = true;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      clickTimeoutRef.current = setTimeout(() => {
        preventClickRef.current = false;
      }, 300);
    }
    
    isDraggingRef.current = false;
    hasMovedRef.current = false;
    scrollContainerRef.current.style.cursor = "grab";
    scrollContainerRef.current.style.userSelect = "";
    
    // Clean up event listeners if mouse leaves while dragging
    if (mouseMoveHandlerRef.current) {
      document.removeEventListener("mousemove", mouseMoveHandlerRef.current);
      mouseMoveHandlerRef.current = null;
    }
    if (mouseUpHandlerRef.current) {
      document.removeEventListener("mouseup", mouseUpHandlerRef.current);
      mouseUpHandlerRef.current = null;
    }
  };

  // Handle click events to prevent navigation after drag
  const handleClick = (e: React.MouseEvent) => {
    if (preventClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      const link = (e.target as HTMLElement).closest("a");
      if (link) {
        link.style.pointerEvents = "none";
        setTimeout(() => {
          link.style.pointerEvents = "";
        }, 100);
      }
      return false;
    }
  };

  // Add global click handler to prevent link navigation after drag
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (preventClickRef.current) {
        const target = e.target as HTMLElement;
        const link = target.closest("a");
        if (link && scrollContainerRef.current?.contains(link)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }
      }
    };

    // Use capture phase to intercept clicks early
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Approximate width of one video card + gap
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="mb-8">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <Button
          variant="ghost"
          className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
          onClick={onViewAll}
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Horizontal Scrollable Row */}
      <div className="relative px-2">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide pb-4 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onDragStart={(e) => e.preventDefault()}
        >
          <div className="flex gap-4">
            {videos.map((video) => (
              <HorizontalThumbnail key={video.id} video={video} />
            ))}
          </div>
        </div>
        
        {/* Fade effect on the left side */}
        {showLeftChevron && (
          <div className="absolute left-2 top-0 bottom-4 w-32 pointer-events-none z-10 bg-gradient-to-r from-[#111111] via-[#111111]/60 to-transparent dark:from-[#111111] dark:via-[#111111]/60" />
        )}
        
        {/* Fade effect on the right side */}
        {showRightChevron && (
          <div className="absolute right-2 top-0 bottom-4 w-32 pointer-events-none z-10 bg-gradient-to-l from-[#111111] via-[#111111]/60 to-transparent dark:from-[#111111] dark:via-[#111111]/60" />
        )}
        
        {/* Left Chevron Button */}
        {showLeftChevron && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background/90 dark:bg-background/80 dark:hover:bg-background/90 rounded-full p-2 shadow-lg transition-all backdrop-blur-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}
        
        {/* Right Chevron Button */}
        {showRightChevron && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-background/80 hover:bg-background/90 dark:bg-background/80 dark:hover:bg-background/90 rounded-full p-2 shadow-lg transition-all backdrop-blur-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoRow;
