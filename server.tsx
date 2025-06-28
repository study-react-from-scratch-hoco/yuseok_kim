// Server-side rendering example for our custom React implementation
import { React, renderToString, App, currentstates, resetState } from './app';
import { StaticRouter } from './router';
import { ServerStyleSheet } from './styled';

// Simple HTTP server without Express
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

// HTML template
const createHtmlTemplate = (content: string, styles: string, stateData?: any) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSR Example - Custom React</title>
    ${styles}
</head>
<body>
    <div id="myapp">${content}</div>
    ${stateData ? `
    <script>
        // Pass server state to client
        window.__SSR_STATE__ = ${JSON.stringify(stateData)};
    </script>
    ` : ''}
    <script type="module">
        // Import and run client-side app
        import { initializeApp, currentstates, resetState } from './app.js';
        
        // Restore server state if available
        if (window.__SSR_STATE__) {
            // Reset state first
            resetState();
            // Then restore from server
            window.__SSR_STATE__.forEach((state, index) => {
                currentstates[index] = state;
            });
        }
        
        // Initialize with hydration
        window.addEventListener('DOMContentLoaded', () => {
            const app = document.getElementById('myapp');
            const hasServerContent = app && app.innerHTML.trim() !== '';
            
            if (hasServerContent) {
                console.log('Hydrating server-rendered content...');
            }
            
            initializeApp(hasServerContent);
        });
    </script>
</body>
</html>
  `;
};

// Simple request handler
const handleRequest = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const url = req.url || '/';
  
  // Serve static files (for app.js)
  if (url.endsWith('.js')) {
    const filePath = path.join(__dirname, url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(data);
    });
    return;
  }
  
  try {
    // Reset state for each request
    resetState();
    
    // Create app with router for SSR
    const appWithRouter = React.createElement(
      StaticRouter, 
      { location: url },
      React.createElement(App, null)
    );
    
    // Collect styles during rendering
    const styledApp = ServerStyleSheet.collectStyles(appWithRouter);
    
    // Render to string
    const html = renderToString(styledApp);
    
    // Get the style tags
    const styleTags = ServerStyleSheet.getStyleTags();
    
    // Capture the state after rendering
    const serverState = [...currentstates];
    
    // Send response with rendered HTML, styles, and state
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(createHtmlTemplate(html, styleTags, serverState));
    
  } catch (error) {
    console.error('SSR Error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
};

// Create and start server
const server = http.createServer(handleRequest);
const PORT = 3000;

server.listen(PORT, () => {
  console.log(`SSR Server running at http://localhost:${PORT}`);
  console.log('Visit http://localhost:3000 to see server-side rendered content');
}); 