import { transformJsxToReactCreateElement } from './parser';

// -- Library Code --

// Resource cache for Suspense
const resourceCache_TS = {};

// Track pending promises for parallel loading
const pendingPromises_TS = new Map();

// createResource function for Suspense in TS version
export const createResource_TS = (promise, key) => {
    // Check if we have the resource in cache
    if (resourceCache_TS.hasOwnProperty(key)) {
        return resourceCache_TS[key];
    }
    
    // Check if promise is already pending
    if (pendingPromises_TS.has(key)) {
        throw { promise: pendingPromises_TS.get(key), key };
    }
    
    // Create and store the promise
    const newPromise = promise();
    pendingPromises_TS.set(key, newPromise);
    
    // Throw the promise for Suspense
    throw { promise: newPromise, key };
};

// Helper function to collect all thrown promises
const collectPromises_TS = (fn, props) => {
    const promises = [];
    const fetchingKeys = new Set();
    let result;
    let keepTrying = true;
    
    while (keepTrying) {
        try {
            result = fn(props);
            keepTrying = false;
        } catch (suspender) {
            if (suspender && suspender.promise && suspender.key) {
                if (!fetchingKeys.has(suspender.key)) {
                    promises.push(suspender);
                    fetchingKeys.add(suspender.key);
                    resourceCache_TS[suspender.key] = null; // Mark as fetching
                }
            } else {
                throw suspender;
            }
        }
    }
    
    return { result, promises };
};

export const React_TS = {
    createElement: (tag, props, ...children) => {
        // Handle functional components with Suspense
        if (typeof tag === 'function') {
            const { result, promises } = collectPromises_TS(tag, props);
            
            if (promises.length > 0) {
                // Handle all promises in parallel
                Promise.all(
                    promises.map(({ promise, key }) => 
                        promise.then(value => {
                            resourceCache_TS[key] = value;
                            pendingPromises_TS.delete(key);
                        })
                    )
                ).then(() => {
                    // Re-render once all promises are resolved
                    initializeApp_TS();
                });
                
                // Return fallback UI
                const fallback = document.createElement('div');
                const heading = document.createElement('h2');
                heading.textContent = 'Loading resources...';
                const para = document.createElement('p');
                para.textContent = `Loading ${promises.length} item(s)`;
                fallback.appendChild(heading);
                fallback.appendChild(para);
                return fallback;
            }
            
            return result;
        }

        const element = document.createElement(tag);

        for (const key in props) {
            if (key.startsWith('on') && typeof props[key] === 'function') {
                element.addEventListener(key.toLowerCase().substring(2), props[key]);
            } else {
                element.setAttribute(key, props[key]);
            }
        }

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(String(child)));
            } else if (child) {
                element.appendChild(child);
            }
        });

        return element;
    }
}

export const currentstates_TS = [];
export let currentStateIndex_TS = 0;

export const useState_TS = (initialValue) => {
    const currentStateCursor = currentStateIndex_TS;
    currentstates_TS[currentStateIndex_TS] = currentstates_TS[currentStateIndex_TS] || initialValue;
    console.log('useState_TS', currentstates_TS[currentStateCursor], currentStateCursor, currentstates_TS);

    const setState = (value) => {
        currentstates_TS[currentStateCursor] = value;
        console.log('setState_TS', currentstates_TS[currentStateCursor], currentStateIndex_TS, currentstates_TS);
        initializeApp_TS();
    };

    currentStateIndex_TS++;
    console.log('states Dump_TS', currentStateIndex_TS, currentstates_TS);

    return [currentstates_TS[currentStateCursor], setState];
};

export const ReactDOM_TS = {
    render: (reactElement, domNode) => {
        domNode.innerHTML = '';
        domNode.appendChild(reactElement);
    }
}

// Mock async function to fetch images
const getMyAwesomePic_TS = (delay = 2000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const randomId = Math.floor(Math.random() * 1000);
            resolve(`https://picsum.photos/200/300?random=${randomId}`);
        }, delay);
    });
};

// -- App Code --
export const App_TS = () => {
    const [world, setWorld] = useState_TS('Plain TS!');
    const [count, setCount] = useState_TS(0);
    
    // Using createResource to load multiple images in parallel
    const photo1 = createResource_TS(() => getMyAwesomePic_TS(2000), 'photo1_ts');
    const photo2 = createResource_TS(() => getMyAwesomePic_TS(3000), 'photo2_ts');
    const photo3 = createResource_TS(() => getMyAwesomePic_TS(1500), 'photo3_ts');
    
    // IMPORTANT: This is a highly insecure, illustrative function for study purposes ONLY.
    // DO NOT use this in a production environment with untrusted input.
    // Real-world sanitization requires robust, battle-tested libraries (e.g., DOMPurify).
    const basicUnsafeSanitize = (inputString: string): string => {
        let sanitized = inputString;
        // Very basic attempt to remove script tags and common dangerous attributes/protocols
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // Remove script tags
        sanitized = sanitized.replace(/on\w+=/gi, 'data-removed-on='); // Replace 'on' event attributes
        sanitized = sanitized.replace(/javascript:/gi, 'unsafe-javascript:'); // Replace javascript: protocol
        return sanitized;
    };

    const jsxString = `
        <div draggable="true">
          <h2>Hello React with {world}</h2>
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
      `;
    console.log('Original JSX String:', jsxString);

    const filteredJsxString = basicUnsafeSanitize(jsxString); // Apply the basic (insecure) filter
    console.log('Filtered JSX String (Insecure Sample):', filteredJsxString);

    const transformedJsx = transformJsxToReactCreateElement(filteredJsxString);
    console.log('Transformed JSX:', transformedJsx);

    // New line: Use Function constructor to pass necessary variables into scope
    const func = new Function('React_TS', 'world', 'count', 'setWorld', 'setCount', 'photo1', 'photo2', 'photo3', `return ${transformedJsx}`);
    return func(React_TS, world, count, setWorld, setCount, photo1, photo2, photo3);
};

// Export a function that handles rendering for app2
export function initializeApp_TS() {
    const app = document.getElementById('tsbaseapp');
    if (app) {
        app.innerHTML = '';
        currentStateIndex_TS = 0;
        ReactDOM_TS.render(React_TS.createElement(App_TS, null), app);
        // console.log('reRender_TS');
    }
}