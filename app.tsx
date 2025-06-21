// This will our main app file.

// ---- Library --- //

// Resource cache for Suspense
const resourceCache = {};

// Track pending promises for parallel loading
const pendingPromises = new Map();

// createResource function that throws promises for Suspense
export const createResource = (promise, key) => {
  // Check if we have the resource in cache (use hasOwnProperty to check for existence)
  if (resourceCache.hasOwnProperty(key)) {
    return resourceCache[key];
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
  
  // ---- Library --- //
  export const render = (el, container) => {
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const randomId = Math.floor(Math.random() * 1000);
        resolve(`https://picsum.photos/200/300?random=${randomId}`);
      }, delay);
    });
  };

  // ---- Application --- //
  export const App = () => {  
    const [world, setWorld] = useState('TSX');
    const [count, setCount] = useState(0);
    
    // Using createResource to load multiple images in parallel
    const photo1 = createResource(() => getMyAwesomePic(2000), 'photo1');
    const photo2 = createResource(() => getMyAwesomePic(3000), 'photo2');
    const photo3 = createResource(() => getMyAwesomePic(1500), 'photo3');
    
    return (
      <div draggable>
        <h2>Hello {world}!</h2>
        <p>I am a paragraph</p>
        <input type="text" value={world} onchange={(e) => setWorld(e.target.value)} />
        <h2> Counter: {count.toString()}</h2>
        <button onclick={() => setCount(count + 1)}>Increment</button>
        <button onclick={() => setCount(count - 1)}>Decrement</button>
        <h2>Our Photo Album</h2>
        <div>
          <img src={photo1} alt="Photo 1" width="200" height="300" />
          <img src={photo2} alt="Photo 2" width="200" height="300" />
          <img src={photo3} alt="Photo 3" width="200" height="300" />
        </div>
      </div>
    );
  };
  
  // Export a function that handles rendering
  export function initializeApp() {
      console.log('initializeApp called');
      const app = document.getElementById('myapp');
      if (app) {
          console.log('Found myapp element');
          app.innerHTML = '';
          currentStateIndex = 0;
          try {
              const vdom = React.createElement(App, null);
              console.log('VirtualDOM created:', vdom);
              render(vdom, app);
              console.log('reRender complete');
          } catch (error) {
              console.error('Error during render:', error);
              app.innerHTML = '<h1>Error: ' + error.message + '</h1>';
          }
      } else {
          console.error('Could not find myapp element');
      }
  }
  