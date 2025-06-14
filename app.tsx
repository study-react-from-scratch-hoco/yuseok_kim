// This will our main app file.

// ---- Library --- //
export const React = {
    createElement: (tag, props, ...children) => {
      if (typeof tag === 'function') {
        return tag(props, ...children);
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
    if (typeof el === 'string' || typeof el === 'number') {
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

  // ---- Application --- //
  export const App = () => {  
    const [world, setWorld] = useState('TSX');
    const [count, setCount] = useState(0);
    return (
      <div draggable>
        <h2>Hello {world}!</h2>
        <p>I am a paragraph</p>
        <input type="text" value={world} onchange={(e) => setWorld(e.target.value)} />
        <h2> Counter: {count}</h2>
        <button onclick={() => setCount(count + 1)}>Increment</button>
        <button onclick={() => setCount(count - 1)}>Decrement</button>
      </div>
    );
  };
  
  // Export a function that handles rendering
  export function initializeApp() {
      const app = document.getElementById('myapp');
      if (app) {
          app.innerHTML = '';
          currentStateIndex = 0;
          render(React.createElement(App, null), app);
          console.log('reRender');
      }
  }
  