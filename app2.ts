import { transformJsxToReactCreateElement } from './parser';

// -- Library Code --
export const React_TS = {
    createElement: (tag, props, ...children) => {
        // Handle functional components
        if (typeof tag === 'function') {
            return tag(props);
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

// -- App Code --
export const App_TS = () => {
    const [world, setWorld] = useState_TS('Plain TS!');
    const [count, setCount] = useState_TS(0);
    
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
        </div>
      `;
    console.log('Original JSX String:', jsxString);

    const filteredJsxString = basicUnsafeSanitize(jsxString); // Apply the basic (insecure) filter
    console.log('Filtered JSX String (Insecure Sample):', filteredJsxString);

    const transformedJsx = transformJsxToReactCreateElement(filteredJsxString);
    console.log('Transformed JSX:', transformedJsx);

    // New line: Use Function constructor to pass necessary variables into scope
    const func = new Function('React_TS', 'world', 'count', 'setWorld', 'setCount', `return ${transformedJsx}`);
    return func(React_TS, world, count, setWorld, setCount);
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