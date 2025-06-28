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

### 5. **Client-Side Routing** (New!)

- **Custom Router Implementation**: Built from scratch without react-router
- **`Router`**: Container component for routing
- **`Route`**: Renders components based on path matching
- **`Link`**: Navigation without page refresh
- **`StaticRouter`**: Server-side routing support
- **`useRoute`**: Hook to get current route
- **`navigate()`**: Programmatic navigation
- **Browser history support**: Back/forward button handling

### 6. **CSS-in-JS Styling** (New!)

- **`styled` components**: Similar to styled-components but simpler
- **Server-side style collection**: `ServerStyleSheet` for SSR
- **Dynamic styling**: Support for props in styles
- **Pseudo-selectors**: Basic support for `:hover` etc.
- **Global styles**: `createGlobalStyle` for app-wide styles
- **Automatic class generation**: Unique class names for each component

## Key Implementation Details

### From the Blog vs Our Implementation

1. **Custom React Implementation**: We're using our own React-like library instead of actual React
2. **Custom Router**: Built our own router instead of using react-router-dom
3. **Custom Styled Components**: Created our own CSS-in-JS solution instead of styled-components
4. **Minimal Dependencies**: Using only Node.js built-in modules and TypeScript

### Technical Highlights

- **Zero external runtime dependencies**: Everything is implemented from scratch
- **Full TypeScript support**: Type-safe throughout the codebase
- **SSR + Hydration**: Server renders HTML with styles, client hydrates with event handlers
- **State preservation**: Server state is transferred to client seamlessly
- **Suspense-compatible**: Our resource loading works with SSR (returns placeholders on server)

## How It Works

1. **Server renders the app**: When a request comes in, the server creates the virtual DOM and converts it to HTML
2. **State serialization**: Any state created during render is captured and embedded in the HTML
3. **Client hydration**: Browser receives HTML with embedded state, restores it, and attaches event handlers
4. **Seamless interaction**: User can interact immediately without waiting for JavaScript to load

## Testing the Implementation

1. Compile all TypeScript files:
   ```bash
   npx tsc server.tsx app.tsx router.tsx styled.tsx Pages/*.tsx --jsx react --esModuleInterop --module commonjs --outDir dist
   ```

2. Run the server:
   ```bash
   node dist/server.js
   ```

3. Visit http://localhost:3000 and navigate between pages:
   - Home page: http://localhost:3000/
   - About page: http://localhost:3000/about
   - Articles page: http://localhost:3000/articles

## What's Next?

Following the blog's progression, you could enhance:

1. **Advanced Routing**: 
   - Dynamic route parameters (e.g., `/article/:id`)
   - Nested routes
   - Route guards and redirects
   
2. **Data Loading**: 
   - Server-side data fetching before render
   - Suspense integration for data loading
   - Caching strategies
   
3. **Enhanced Styling**:
   - Media queries support
   - Keyframe animations
   - Theme provider pattern
   - CSS variables integration
   
4. **Performance Optimizations**:
   - Code splitting
   - Lazy loading components
   - Streaming SSR (React 18 style)
   - Progressive enhancement

5. **Developer Experience**:
   - Hot module replacement
   - Better error boundaries
   - Development vs production modes
   - TypeScript improvements

This implementation demonstrates the core concepts of SSR, routing, and styling while maintaining our custom React implementation approach. The blog's concepts have been adapted to work with our minimal, dependency-free setup. 