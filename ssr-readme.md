# Server-Side Rendering (SSR) Implementation

This implementation follows the concepts from "Let's build a React from scratch: Part 4" blog post, adapting them to our custom React implementation.

## What We've Implemented

### 1. **Server-Side Rendering Core Functions**

- **`renderToString()`**: Converts our virtual DOM to HTML string on the server
- **`hydrate()`**: Attaches event handlers to server-rendered HTML on the client
- **Modified `render()`**: Now supports hydration mode

### 2. **State Management for SSR**

- **State preservation**: Server state is serialized and passed to client via `window.__SSR_STATE__`
- **`resetState()`**: Ensures clean state for each server request
- **State restoration**: Client restores server state before hydration

### 3. **Suspense Handling for SSR**

- **Server-side behavior**: Returns placeholders instead of throwing promises
- **`isBrowser` check**: Differentiates between server and client environments
- **Synchronous rendering**: Server renders without waiting for async resources

### 4. **Simple HTTP Server**

- No external dependencies like Express (following the "be careful with dependencies" requirement)
- Serves both HTML and JavaScript files
- Handles SSR for all routes

## Key Differences from the Blog

1. **Custom React Implementation**: We're using our own React-like library instead of actual React
2. **No Routing**: We kept it simple without react-router (can be added later)
3. **No Styled Components**: Focused on core SSR concepts rather than styling
4. **Minimal Dependencies**: Using only Node.js built-in modules

## How It Works

1. **Server renders the app**: When a request comes in, the server creates the virtual DOM and converts it to HTML
2. **State serialization**: Any state created during render is captured and embedded in the HTML
3. **Client hydration**: Browser receives HTML with embedded state, restores it, and attaches event handlers
4. **Seamless interaction**: User can interact immediately without waiting for JavaScript to load

## Testing the Implementation

1. Compile TypeScript files:
   ```bash
   npx tsc server.tsx app.tsx --jsx react --esModuleInterop --module commonjs --outDir dist
   ```

2. Run the server:
   ```bash
   node dist/server.js
   ```

3. Visit http://localhost:3000

## What's Next?

Following the blog's progression, you could add:

1. **Routing Support**: Implement server-side routing similar to react-router
2. **Data Loading**: Handle async data fetching on the server
3. **CSS Modules**: Add support for styled-components or CSS modules
4. **Streaming**: Implement React 18's streaming SSR concepts

This implementation demonstrates the core concepts of SSR while maintaining our custom React implementation approach. 