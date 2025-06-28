import { React } from '../app';
import { styled } from '../styled';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #27ae60;
  font-size: 2.5rem;
  margin-bottom: 30px;
`;

const ArticleCard = styled.div`
  background: #fff;
  border: 1px solid #ecf0f1;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const ArticleTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const ArticleDate = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const ArticleExcerpt = styled.p`
  color: #34495e;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-top: 10px;
`;

const Tag = styled.span`
  background: #3498db;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 8px;
`;

// Mock articles data
const articles = [
  {
    id: 1,
    title: 'Building a React Clone from Scratch',
    date: '2024-01-15',
    excerpt: 'Learn how to build your own React implementation to understand the core concepts of Virtual DOM, reconciliation, and more.',
    tags: ['React', 'JavaScript', 'Tutorial']
  },
  {
    id: 2,
    title: 'Understanding Server-Side Rendering',
    date: '2024-01-20',
    excerpt: 'Deep dive into SSR concepts, hydration, and how to implement server-side rendering for better performance and SEO.',
    tags: ['SSR', 'Performance', 'SEO']
  },
  {
    id: 3,
    title: 'CSS-in-JS: Building a Styled Components Clone',
    date: '2024-01-25',
    excerpt: 'Explore how CSS-in-JS libraries work by building a simple styled-components implementation from scratch.',
    tags: ['CSS', 'Styling', 'JavaScript']
  }
];

export const Articles = () => {
  return React.createElement(Container, null,
    React.createElement(Title, null, 'Articles'),
    
    ...articles.map(article => 
      React.createElement(ArticleCard, { key: article.id },
        React.createElement(ArticleTitle, null, article.title),
        React.createElement(ArticleDate, null, article.date),
        React.createElement(ArticleExcerpt, null, article.excerpt),
        React.createElement('div', { style: 'margin-top: 15px;' },
          ...article.tags.map(tag => 
            React.createElement(Tag, { key: tag }, tag)
          )
        )
      )
    )
  );
}; 