import { React, useState } from '../app';
import { styled } from '../styled';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #e74c3c;
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 15px;
`;

const Text = styled.p`
  color: #34495e;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 10px;
  
  &:hover {
    background: #2980b9;
  }
`;

const Counter = styled.div`
  background: #ecf0f1;
  padding: 20px;
  border-radius: 5px;
  margin-top: 20px;
`;

export const About = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('Custom React');
  
  return React.createElement(Container, null,
    React.createElement(Title, null, 'About This Project'),
    
    React.createElement(Section, null,
      React.createElement(SectionTitle, null, 'What is this?'),
      React.createElement(Text, null, 
        'This is a custom implementation of React built from scratch to understand the core concepts of modern web frameworks.'
      ),
      React.createElement(Text, null,
        'It includes Virtual DOM, hooks, Server-Side Rendering, routing, and CSS-in-JS styling - all implemented without external dependencies!'
      )
    ),
    
    React.createElement(Section, null,
      React.createElement(SectionTitle, null, 'Interactive Demo'),
      React.createElement(Counter, null,
        React.createElement('p', null, `Hello from ${name}!`),
        React.createElement('input', {
          type: 'text',
          value: name,
          onchange: (e) => setName(e.target.value),
          style: 'padding: 5px; margin-bottom: 10px; width: 200px;'
        }),
        React.createElement('br', null),
        React.createElement('br', null),
        React.createElement('p', null, `Counter: ${count}`),
        React.createElement(Button, { onclick: () => setCount(count + 1) }, 'Increment'),
        React.createElement(Button, { onclick: () => setCount(count - 1) }, 'Decrement'),
        React.createElement(Button, { onclick: () => setCount(0) }, 'Reset')
      )
    )
  );
}; 