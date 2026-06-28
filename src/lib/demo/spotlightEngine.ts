'use client';

export interface Position {
  x: number;
  y: number;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface SpotlightBounds {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

export interface SpotlightState {
  activeTarget: string | null;
  bounds: SpotlightBounds | null;
  arrowPosition: Position | null;
}

export interface SpotlightTarget {
  id: string;
  selector: string;
  padding: number;
  glowColor?: string;
}

export function computeSpotlight(selector: string | null, padding: number = 8): SpotlightState {
  if (typeof window === 'undefined' || !selector) {
    return { activeTarget: null, bounds: null, arrowPosition: null };
  }
  
  const el = document.querySelector(selector);
  if (!el) {
    return { activeTarget: null, bounds: null, arrowPosition: null };
  }

  // Determine if scroll is needed
  const rect = el.getBoundingClientRect();
  const isInViewport = 
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth);

  if (!isInViewport) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }

  // Re-read rect (if scroll happens, the react component should use a requestAnimationFrame or scroll listener to re-compute)
  const currentRect = el.getBoundingClientRect();
  
  const bounds: SpotlightBounds = {
    top: currentRect.top - padding,
    left: currentRect.left - padding,
    width: currentRect.width + padding * 2,
    height: currentRect.height + padding * 2,
    bottom: currentRect.bottom + padding,
    right: currentRect.right + padding,
  };

  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  
  let placement: 'top' | 'bottom' | 'left' | 'right' | 'center' = 'bottom';
  
  if (isMobile) {
    placement = 'center';
  } else if (isTablet) {
    // Tablet: Center overlays (as per spec "Centered overlays")
    placement = 'center';
  } else {
    // Desktop: Dynamic positioning
    if (bounds.bottom + 350 < window.innerHeight) {
      placement = 'bottom';
    } else if (bounds.top - 350 > 0) {
      placement = 'top';
    } else if (bounds.right + 450 < window.innerWidth) {
      placement = 'right';
    } else if (bounds.left - 450 > 0) {
      placement = 'left';
    } else {
      placement = 'center';
    }
  }

  let arrowX = 0;
  let arrowY = 0;

  if (placement === 'bottom') {
    arrowX = bounds.left + bounds.width / 2;
    arrowY = bounds.bottom;
  } else if (placement === 'top') {
    arrowX = bounds.left + bounds.width / 2;
    arrowY = bounds.top;
  } else if (placement === 'right') {
    arrowX = bounds.right;
    arrowY = bounds.top + bounds.height / 2;
  } else if (placement === 'left') {
    arrowX = bounds.left;
    arrowY = bounds.top + bounds.height / 2;
  } else {
    // center placement doesn't use directional arrow logic usually
    arrowX = window.innerWidth / 2;
    arrowY = window.innerHeight / 2;
  }

  return {
    activeTarget: selector,
    bounds,
    arrowPosition: { x: arrowX, y: arrowY, placement }
  };
}
