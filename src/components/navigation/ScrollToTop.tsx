import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  excludePaths?: string[];
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ excludePaths = [] }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Check if current path should be excluded from scroll behavior
    const shouldExclude = excludePaths.some(path => 
      pathname === path || pathname.startsWith(path)
    );
    
    if (!shouldExclude) {
      window.scrollTo(0, 0);
    }
  }, [pathname, excludePaths]);

  return null;
};

export default ScrollToTop;