// This will our main app file.

// ---- Library --- //

// Declare global window property for SSR state
declare global {
  interface Window {
    __SSR_STATE__?: any[];
  }
}

// Resource cache for Suspense
const resourceCache = new Map();

// Track pending promises for parallel loading
const pendingPromises = new Map();

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// createResource function that throws promises for Suspense
export const createResource = (promise, key) => {
  // Check if we have the resource in cache (use hasOwnProperty to check for existence)
  if (resourceCache.hasOwnProperty(key)) {
    return resourceCache[key];
  }
  
  // For SSR, we need synchronous rendering
  if (!isBrowser) {
    // On server, we'll use a placeholder or pre-fetched data
    // In a real app, you'd pre-fetch this data before rendering
    const placeholderValue = `placeholder-${key}`;
    resourceCache[key] = placeholderValue;
    return placeholderValue;
  }
  
  // Check if promise is already pending
  if (pendingPromises.has(key)) {
    throw { promise: pendingPromises.get(key), key };
  }
  
  // Create and store the promise
  const newPromise = promise();
  pendingPromises.set(key, newPromise);
  
  // If not in cache, throw the promise
  throw { promise: newPromise, key };
};

// Helper function to collect all thrown promises
const collectPromises = (fn, props, children) => {
  const promises = [];
  const fetchingKeys = new Set(); // Track which keys we're fetching
  let result;
  let keepTrying = true;
  
  while (keepTrying) {
    try {
      result = fn(props, ...children);
      keepTrying = false;
    } catch (suspender) {
      if (suspender && suspender.promise && suspender.key) {
        // Only add to promises if we haven't seen this key yet
        if (!fetchingKeys.has(suspender.key)) {
          promises.push(suspender);
          fetchingKeys.add(suspender.key);
          // Mark this resource as being fetched with a special marker
          resourceCache[suspender.key] = null; // Use null instead of undefined
        }
      } else {
        throw suspender; // Re-throw if it's not a Suspense error
      }
    }
  }
  
  return { result, promises };
};

// Modified React.createElement to handle Suspense with parallel loading
export const React = {
    createElement: (tag, props, ...children) => {
      if (typeof tag === 'function') {
        const { result, promises } = collectPromises(tag, props, children);
        
        if (promises.length > 0) {
          // Handle all promises in parallel
          if (isBrowser) {
            Promise.all(
              promises.map(({ promise, key }) => 
                promise.then(value => {
                  resourceCache[key] = value;
                  pendingPromises.delete(key);
                })
              )
            ).then(() => {
              // Only re-render once when all promises are resolved
              initializeApp();
            });
          }
          
          // Return fallback UI
          return { 
            tag: 'div', 
            props: null, 
            children: [
              { tag: 'h2', props: null, children: ['Loading resources...'] },
              { tag: 'p', props: null, children: [`Loading ${promises.length} item(s)`] }
            ]
          };
        }
        
        return result;
      }
      const el = {
        tag,
        props,
        children,
      };
      return el;
    },
  };

// Server-side rendering function (similar to ReactDOMServer.renderToString)
export const renderToString = (el) => {
  // Handle text nodes
  if (typeof el === 'string' || typeof el === 'number') {
    return String(el);
  }
  
  // Handle arrays
  if (Array.isArray(el)) {
    return el.map(child => renderToString(child)).join('');
  }
  
  // Handle null/undefined
  if (!el) {
    return '';
  }
  
  // Build HTML string
  let html = `<${el.tag}`;
  
  // Add props as attributes
  if (el.props) {
    Object.entries(el.props).forEach(([key, value]) => {
      // Skip event handlers for SSR
      if (key.startsWith('on')) return;
      
      // Handle special attributes
      if (key === 'className') {
        html += ` class="${value}"`;
      } else if (key === 'htmlFor') {
        html += ` for="${value}"`;
      } else if (typeof value === 'boolean') {
        if (value) html += ` ${key}`;
      } else if (value != null) {
        html += ` ${key}="${String(value)}"`;
      }
    });
  }
  
  // Self-closing tags
  const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta'];
  if (selfClosingTags.includes(el.tag)) {
    html += ' />';
    return html;
  }
  
  html += '>';
  
  // Render children
  if (el.children && el.children.length > 0) {
    el.children.forEach(child => {
      html += renderToString(child);
    });
  }
  
  html += `</${el.tag}>`;
  
  return html;
};

// Hydration function - attaches event handlers to existing DOM
const hydrate = (el, domEl) => {
  // Handle text nodes
  if (typeof el === 'string' || typeof el === 'number') {
    return;
  }
  
  // Attach event handlers
  if (el.props) {
    Object.entries(el.props).forEach(([key, value]) => {
      if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.substring(2).toLowerCase();
        domEl.addEventListener(eventName, value);
      }
    });
  }
  
  // Hydrate children
  if (el.children && el.children.length > 0 && domEl.childNodes) {
    let childIndex = 0;
    el.children.forEach((child, index) => {
      // Skip text nodes that are just whitespace
      while (childIndex < domEl.childNodes.length && 
             domEl.childNodes[childIndex].nodeType === Node.TEXT_NODE &&
             domEl.childNodes[childIndex].textContent.trim() === '') {
        childIndex++;
      }
      
      if (childIndex < domEl.childNodes.length) {
        hydrate(child, domEl.childNodes[childIndex]);
        childIndex++;
      }
    });
  }
};
  
// ---- Library --- //
export const render = (el, container, isHydrating = false) => {
  // If hydrating and container has content, use hydration
  if (isHydrating && container.innerHTML.trim() !== '') {
    hydrate(el, container.firstChild);
    return;
  }
  
  // Otherwise, do regular render
  let domEl;
  // 0. Check the type of el
  //    if string we need to handle it like text node.
  if (typeof el === 'string') {
    // create an actual Text Node
    domEl = document.createTextNode(String(el));
    container.appendChild(domEl);
    // No children for text node so we return.
    return;
  }
  // 1. First create the document node corresponding el
  domEl = document.createElement(el.tag);
  // 2. Set the props on domEl
  let elProps = el.props ? Object.keys(el.props) : null;
  if (elProps && elProps.length > 0) {
    elProps.forEach((prop) => (domEl[prop] = el.props[prop]));
  }
  // 3. Handle creating the Children.
  if (el.children && el.children.length > 0) {
    // When child is rendered, the container will be
    // the domEl we created here.
    el.children.forEach((node) => render(node, domEl));
  }
  // 4. append the DOM node to the container.
  container.appendChild(domEl);
};

export const currentstates = []
export let currentStateIndex = 0;

// Function to reset state (useful for SSR)
export const resetState = () => {
  currentstates.length = 0;
  currentStateIndex = 0;
};

export const useState = (initialValue) => {
    // check before setting AppState to initialValue
    const currentStateCursor = currentStateIndex;
    currentstates[currentStateIndex] = currentstates[currentStateIndex] || initialValue;
    console.log('useState', currentstates[currentStateCursor], currentStateCursor, currentstates);
    const setState = (value) => {
      currentstates[currentStateCursor] = value;
      console.log('setState', currentstates[currentStateCursor], currentStateIndex, currentstates);
      initializeApp(); // Call the main rendering function
    };
    currentStateIndex++;
    console.log('states Dump', currentStateIndex, currentstates);
    return [currentstates[currentStateCursor], setState];
  };

  // Mock async function to fetch an image with different delays
  const getMyAwesomePic = (delay = 2000) => {
    // For SSR, return a placeholder immediately
    if (!isBrowser) {
      return Promise.resolve(`https://picsum.photos/200/300?random=ssr`);
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomId = Math.floor(Math.random() * 1000);
        resolve(`https://picsum.photos/200/300?random=${randomId}`);
      }, delay);
    });
  };

  // Import router and pages
  import { Router, Route, Link } from './router';
  import { Home } from './Pages/Home';
  import { About } from './Pages/About';
  import { Articles } from './Pages/Articles';
  import { styled, createGlobalStyle } from './styled';
  
  // Global styles
  const GlobalStyle = createGlobalStyle`
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f6fa;
    }
    
    * {
      box-sizing: border-box;
    }
  `;
  
  // Navigation styles
  const Nav = styled.nav`
    background: #2c3e50;
    padding: 1rem 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  `;
  
  const NavContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 30px;
  `;
  
  const Logo = styled.h1`
    color: white;
    font-size: 1.5rem;
    margin: 0;
    margin-right: auto;
  `;
  
  const NavLink = styled.a`
    color: white;
    text-decoration: none;
    font-size: 1.1rem;
    padding: 8px 16px;
    border-radius: 4px;
    transition: background 0.2s;
    
    &:hover {
      background: rgba(255,255,255,0.1);
    }
  `;
  
  // ---- Application --- //
  export const App = () => {
    // Render global styles
    GlobalStyle();
    
    return React.createElement(Router, null,
      React.createElement(Nav, null,
        React.createElement(NavContainer, null,
          React.createElement(Logo, null, 'Custom React'),
          React.createElement(Link, { to: '/', component: NavLink }, 'Home'),
          React.createElement(Link, { to: '/about', component: NavLink }, 'About'),
          React.createElement(Link, { to: '/articles', component: NavLink }, 'Articles')
        )
      ),
      
      React.createElement(Route, { path: '/', element: React.createElement(Home, null) }),
      React.createElement(Route, { path: '/about', element: React.createElement(About, null) }),
      React.createElement(Route, { path: '/articles', element: React.createElement(Articles, null) })
    );
  };
  
  // Export a function that handles rendering
  export function initializeApp(shouldHydrate = false) {
      console.log('initializeApp called, hydrating:', shouldHydrate);
      const app = document.getElementById('myapp');
      if (app) {
          console.log('Found myapp element');
          
          // Check if we should hydrate (SSR content exists)
          const hasSSRContent = shouldHydrate || (app.innerHTML.trim() !== '' && typeof window !== 'undefined' && !!window.__SSR_STATE__);
          
          if (!hasSSRContent) {
              app.innerHTML = '';
          }
          
          currentStateIndex = 0;
          try {
              const vdom = React.createElement(App, null);
              console.log('VirtualDOM created:', vdom);
              render(vdom, app, hasSSRContent);
              console.log(hasSSRContent ? 'Hydration complete' : 'Render complete');
          } catch (error) {
              console.error('Error during render:', error);
              app.innerHTML = '<h1>Error: ' + error.message + '</h1>';
          }
      } else {
          console.error('Could not find myapp element');
      }
  }
  