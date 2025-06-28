// Simple Router implementation for our custom React

import { React, useState, initializeApp } from './app';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Route context to share current route
let currentRoute = isBrowser ? window.location.pathname : '/';
let routeListeners: Array<() => void> = [];

// Function to notify all route listeners
const notifyRouteChange = () => {
  routeListeners.forEach(listener => listener());
};

// Navigation function
export const navigate = (path: string) => {
  if (!isBrowser) return;
  
  if (currentRoute !== path) {
    currentRoute = path;
    window.history.pushState({}, '', path);
    notifyRouteChange();
    initializeApp();
  }
};

// Handle browser back/forward buttons
if (isBrowser) {
  window.addEventListener('popstate', () => {
    currentRoute = window.location.pathname;
    notifyRouteChange();
    initializeApp();
  });
}

// useRoute hook to get current route
export const useRoute = () => {
  const [route, setRoute] = useState(currentRoute);
  
  // Define a stable listener function
  const listener = () => setRoute(currentRoute);
  
  // Subscribe to route changes
  if (isBrowser && !routeListeners.includes(listener)) {
    routeListeners.push(listener);
  }
  
  return route;
};

// Router component
export const Router = ({ children }: { children: any }) => {
  return children;
};

// Route component
export const Route = ({ path, element }: { path: string; element: any }) => {
  const currentPath = useRoute();
  
  // Simple path matching (exact match for now)
  if (currentPath === path) {
    return element;
  }
  
  return null;
};

// Link component
export const Link = ({ to, children, component, ...props }: { to: string; children: any; component?: any; [key: string]: any }) => {
  const handleClick = (e: Event) => {
    e.preventDefault();
    navigate(to);
  };
  
  // Use custom component if provided, otherwise default 'a'
  const Component = component || 'a';
  
  // If it's a custom component, we need to pass props differently
  if (component) {
    return React.createElement(Component, { 
      href: to, 
      onclick: handleClick,
      ...props 
    }, children);
  }
  
  return React.createElement('a', { 
    href: to, 
    onclick: handleClick,
    ...props 
  }, children);
};

// StaticRouter for SSR
export const StaticRouter = ({ location, children }: { location: string; children: any }) => {
  currentRoute = location;
  return children;
}; 