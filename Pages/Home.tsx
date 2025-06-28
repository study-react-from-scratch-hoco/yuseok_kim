import { React, createResource } from '../app';
import { styled } from '../styled';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const Description = styled.p`
  color: #34495e;
  font-size: 1.2rem;
  line-height: 1.6;
`;

const FeatureList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-top: 30px;
`;

const FeatureItem = styled.li`
  background: #ecf0f1;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  border-left: 4px solid #3498db;
`;

export const Home = () => {
  return React.createElement(Container, null,
    React.createElement(Title, null, 'Welcome to Custom React SSR'),
    React.createElement(Description, null, 
      'This is a demonstration of our custom React implementation with Server-Side Rendering, Routing, and Styling!'
    ),
    React.createElement(FeatureList, null,
      React.createElement(FeatureItem, null, '✅ Custom React Implementation'),
      React.createElement(FeatureItem, null, '✅ Server-Side Rendering (SSR)'),
      React.createElement(FeatureItem, null, '✅ Client-Side Routing'),
      React.createElement(FeatureItem, null, '✅ CSS-in-JS Styling'),
      React.createElement(FeatureItem, null, '✅ State Management with Hooks')
    )
  );
}; 