import { transformJsxToReactCreateElement } from './parser.js';
// -- Library Code --
const React_TS = {
    createElement: (tag, props, ...children) => {
        // Handle functional components
        if (typeof tag === 'function') {
            return tag(props);
        }
        const element = document.createElement(tag);
        for (const key in props) {
            if (key.startsWith('on') && typeof props[key] === 'function') {
                element.addEventListener(key.toLowerCase().substring(2), props[key]);
            }
            else {
                element.setAttribute(key, props[key]);
            }
        }
        children.forEach(child => {
            if (typeof child === 'string' || typeof child === 'number') {
                element.appendChild(document.createTextNode(String(child)));
            }
            else if (child) {
                element.appendChild(child);
            }
        });
        return element;
    }
};
const currentstates_TS = [];
let currentStateIndex_TS = 0;
const useState_TS = (initialValue) => {
    const currentStateCursor = currentStateIndex_TS;
    currentstates_TS[currentStateIndex_TS] = currentstates_TS[currentStateIndex_TS] || initialValue;
    console.log('useState_TS', currentstates_TS[currentStateCursor], currentStateCursor, currentstates_TS);
    const setState = (value) => {
        currentstates_TS[currentStateCursor] = value;
        console.log('setState_TS', currentstates_TS[currentStateCursor], currentStateIndex_TS, currentstates_TS);
        reRender_TS();
    };
    currentStateIndex_TS++;
    console.log('states Dump_TS', currentStateIndex_TS, currentstates_TS);
    return [currentstates_TS[currentStateCursor], setState];
};
const reRender_TS = () => {
    const app = document.getElementById('myapp');
    app.innerHTML = '';
    currentStateIndex_TS = 0;
    ReactDOM_TS.render(React_TS.createElement(App_TS, null), app);
    // console.log('reRender_TS');
};
const ReactDOM_TS = {
    render: (reactElement, domNode) => {
        domNode.innerHTML = '';
        domNode.appendChild(reactElement);
    }
};
// -- App Code --
const App_TS = () => {
    const [world, setWorld] = useState_TS('Plain TS!');
    const [count, setCount] = useState_TS(0);
    const jsxString = `
        <div draggable="true">
          <h2>Hello React with {world}</h2>
          <p>I am a paragraph</p>
          <input type="text" value={world} onchange={(e) => setWorld(e.target.value)} />
          <h2> Counter: {count}</h2>
          <button onclick={() => setCount(count + 1)}>Increment</button>
          <button onclick={() => setCount(count - 1)}>Decrement</button>
        </div>
      `;
    console.log('JSX String:', jsxString);
    const transformedJsx = transformJsxToReactCreateElement(jsxString);
    console.log('Transformed JSX:', transformedJsx);
    return eval(transformedJsx);
};
reRender_TS();
