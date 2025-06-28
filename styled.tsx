// Simple CSS-in-JS implementation for our custom React

import { React } from './app';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Style sheet for SSR
let serverStyleSheet = '';
let styleCounter = 0;

// Generate unique class names
const generateClassName = () => {
  return `styled-${++styleCounter}`;
};

// Create style element in browser
const createStyleElement = () => {
  if (!isBrowser) return null;
  
  let styleEl = document.getElementById('custom-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'custom-styles';
    document.head.appendChild(styleEl);
  }
  return styleEl;
};

// Process CSS to handle pseudo-selectors like &:hover
const processCssWithSelectors = (className: string, cssText: string): string => {
  // Simple replacement of & with the class name
  const processedCss = cssText.replace(/&/g, `.${className}`);
  
  // Check if there are nested selectors (like &:hover)
  if (processedCss.includes(`.${className}:`)) {
    // Extract main styles and pseudo-selector styles
    const lines = processedCss.split('\n');
    let mainStyles = '';
    let pseudoStyles = '';
    
    lines.forEach(line => {
      if (line.includes(`.${className}:`)) {
        // This is a pseudo-selector, extract it
        const match = line.match(/(.${className}:[^{]+){([^}]+)}/);
        if (match) {
          pseudoStyles += `${match[1]} { ${match[2]} }\n`;
        }
      } else if (!line.includes('{') && !line.includes('}')) {
        mainStyles += line + '\n';
      }
    });
    
    return `.${className} { ${mainStyles} }\n${pseudoStyles}`;
  }
  
  return `.${className} { ${cssText} }`;
};

// Add styles to the page
const addStyles = (className: string, cssText: string) => {
  const css = processCssWithSelectors(className, cssText);
  
  if (isBrowser) {
    const styleEl = createStyleElement();
    if (styleEl) {
      styleEl.textContent += css + '\n';
    }
  } else {
    // For SSR, accumulate styles
    serverStyleSheet += css + '\n';
  }
};

// Template literal tag function to process CSS
const processCss = (strings: TemplateStringsArray, ...values: any[]): string => {
  let result = '';
  strings.forEach((str, i) => {
    result += str;
    if (i < values.length) {
      result += values[i];
    }
  });
  return result;
};

// Main styled function
export const styled = (tag: string) => {
  return (strings: TemplateStringsArray, ...values: any[]) => {
    const className = generateClassName();
    const cssText = processCss(strings, ...values);
    
    // Add styles immediately
    addStyles(className, cssText);
    
    // Return a component that renders with the class
    return (props: any) => {
      const { children, ...otherProps } = props || {};
      
      return React.createElement(
        tag,
        { 
          ...otherProps,
          className: className + (otherProps.className ? ' ' + otherProps.className : '')
        },
        children
      );
    };
  };
};

// Helper to create styled components for common HTML elements
styled.div = styled('div');
styled.h1 = styled('h1');
styled.h2 = styled('h2');
styled.p = styled('p');
styled.button = styled('button');
styled.input = styled('input');
styled.img = styled('img');
styled.ul = styled('ul');
styled.li = styled('li');
styled.span = styled('span');
styled.nav = styled('nav');
styled.a = styled('a');

// Server-side style sheet management
export const ServerStyleSheet = {
  collectStyles: (element: any) => {
    // Reset server style sheet
    serverStyleSheet = '';
    styleCounter = 0;
    return element;
  },
  
  getStyleTags: () => {
    return `<style id="custom-styles">${serverStyleSheet}</style>`;
  },
  
  getStyles: () => {
    return serverStyleSheet;
  }
};

// Global styles function
export const createGlobalStyle = (strings: TemplateStringsArray, ...values: any[]) => {
  const cssText = processCss(strings, ...values);
  
  if (isBrowser) {
    const styleEl = createStyleElement();
    if (styleEl) {
      styleEl.textContent = cssText + '\n' + (styleEl.textContent || '');
    }
  } else {
    serverStyleSheet = cssText + '\n' + serverStyleSheet;
  }
  
  // Return empty component
  return () => null;
}; 