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
            } else {
                element.setAttribute(key, props[key]);
            }
        }

        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child) {
                element.appendChild(child);
            }
        });

        return element;
    }
}

const ReactDOM_TS = {
    render: (reactElement, domNode) => {
        domNode.innerHTML = '';
        domNode.appendChild(reactElement);
    }
}

// -- App Code --
const App_TS = () => {
    return (
      React_TS.createElement('div', { draggable: "true" },
        React_TS.createElement('h2', null, 'Hello React with Plain TS!'),
        React_TS.createElement('p', null, 'I am a paragraph'),
        React_TS.createElement('input', { type: "text" })
      )
    );
  };

ReactDOM_TS.render(React_TS.createElement(App_TS, null), document.getElementById('myapp'));