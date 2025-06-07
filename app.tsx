// This will our main app file.

// ---- Library --- //
const React = {
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
  const render = (el, container) => {
    let domEl;
    // 0. Check the type of el
    //    if string we need to handle it like text node.
    if (typeof el === 'string') {
      // create an actual Text Node
      domEl = document.createTextNode(el);
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
  
  // ---- Application --- //
  const App = () => {
    const world = 'TSX';
    return (
      <div draggable>
        <h2>Hello {world}!</h2>
        <p>I am a pargraph</p>
        <input type="text" />
      </div>
    );
  };
  
  render(<App />, document.getElementById('myapp'));
  