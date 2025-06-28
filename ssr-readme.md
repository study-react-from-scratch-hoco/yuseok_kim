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

---

# 서버 사이드 렌더링(SSR) 구현

이 구현은 "Let's build a React from scratch: Part 4" 블로그 포스트의 개념을 따라 우리의 커스텀 React 구현에 적용한 것입니다.

## 구현한 내용

### 1. **서버 사이드 렌더링 핵심 함수들**

- **`renderToString()`**: 서버에서 가상 DOM을 HTML 문자열로 변환합니다
- **`hydrate()`**: 클라이언트에서 서버 렌더링된 HTML에 이벤트 핸들러를 연결합니다
- **수정된 `render()`**: 이제 하이드레이션 모드를 지원합니다

### 2. **SSR을 위한 상태 관리**

- **상태 보존**: 서버 상태가 직렬화되어 `window.__SSR_STATE__`를 통해 클라이언트로 전달됩니다
- **`resetState()`**: 각 서버 요청마다 깨끗한 상태를 보장합니다
- **상태 복원**: 클라이언트가 하이드레이션 전에 서버 상태를 복원합니다

### 3. **SSR을 위한 Suspense 처리**

- **서버 사이드 동작**: 프로미스를 던지는 대신 플레이스홀더를 반환합니다
- **`isBrowser` 체크**: 서버와 클라이언트 환경을 구분합니다
- **동기식 렌더링**: 서버는 비동기 리소스를 기다리지 않고 렌더링합니다

### 4. **간단한 HTTP 서버**

- Express 같은 외부 의존성 없음 ("의존성에 주의하라" 요구사항을 따름)
- HTML과 JavaScript 파일 모두 제공
- 모든 라우트에 대해 SSR 처리

### 5. **클라이언트 사이드 라우팅** (새로운 기능!)

- **커스텀 라우터 구현**: react-router 없이 처음부터 구축
- **`Router`**: 라우팅을 위한 컨테이너 컴포넌트
- **`Route`**: 경로 매칭에 따라 컴포넌트를 렌더링
- **`Link`**: 페이지 새로고침 없는 내비게이션
- **`StaticRouter`**: 서버 사이드 라우팅 지원
- **`useRoute`**: 현재 라우트를 가져오는 훅
- **`navigate()`**: 프로그래매틱 내비게이션
- **브라우저 히스토리 지원**: 뒤로/앞으로 버튼 처리

### 6. **CSS-in-JS 스타일링** (새로운 기능!)

- **`styled` 컴포넌트**: styled-components와 유사하지만 더 간단
- **서버 사이드 스타일 수집**: SSR을 위한 `ServerStyleSheet`
- **동적 스타일링**: 스타일에서 props 지원
- **가상 선택자**: `:hover` 등에 대한 기본 지원
- **글로벌 스타일**: 앱 전체 스타일을 위한 `createGlobalStyle`
- **자동 클래스 생성**: 각 컴포넌트에 대한 고유 클래스명

## 주요 구현 세부사항

### 블로그 vs 우리의 구현

1. **커스텀 React 구현**: 실제 React 대신 우리만의 React 유사 라이브러리 사용
2. **커스텀 라우터**: react-router-dom 대신 자체 라우터 구축
3. **커스텀 스타일드 컴포넌트**: styled-components 대신 자체 CSS-in-JS 솔루션 생성
4. **최소 의존성**: Node.js 내장 모듈과 TypeScript만 사용

### 기술적 하이라이트

- **외부 런타임 의존성 제로**: 모든 것이 처음부터 구현됨
- **완전한 TypeScript 지원**: 코드베이스 전체에서 타입 안전성
- **SSR + 하이드레이션**: 서버가 스타일과 함께 HTML을 렌더링하고, 클라이언트가 이벤트 핸들러로 하이드레이션
- **상태 보존**: 서버 상태가 클라이언트로 원활하게 전달됨
- **Suspense 호환**: 우리의 리소스 로딩이 SSR과 작동 (서버에서 플레이스홀더 반환)

## 작동 방식

1. **서버가 앱을 렌더링**: 요청이 들어오면 서버가 가상 DOM을 생성하고 HTML로 변환합니다
2. **상태 직렬화**: 렌더링 중 생성된 모든 상태가 캡처되어 HTML에 포함됩니다
3. **클라이언트 하이드레이션**: 브라우저가 포함된 상태와 함께 HTML을 받고, 이를 복원하여 이벤트 핸들러를 연결합니다
4. **원활한 상호작용**: 사용자는 JavaScript 로드를 기다리지 않고 즉시 상호작용할 수 있습니다

## 구현 테스트

1. 모든 TypeScript 파일 컴파일:
   ```bash
   npx tsc server.tsx app.tsx router.tsx styled.tsx Pages/*.tsx --jsx react --esModuleInterop --module commonjs --outDir dist
   ```

2. 서버 실행:
   ```bash
   node dist/server.js
   ```

3. http://localhost:3000 방문하여 페이지 간 이동:
   - 홈 페이지: http://localhost:3000/
   - About 페이지: http://localhost:3000/about
   - Articles 페이지: http://localhost:3000/articles

## 다음 단계

블로그의 진행에 따라 다음을 향상시킬 수 있습니다:

1. **고급 라우팅**: 
   - 동적 라우트 매개변수 (예: `/article/:id`)
   - 중첩 라우트
   - 라우트 가드 및 리다이렉트
   
2. **데이터 로딩**: 
   - 렌더링 전 서버 사이드 데이터 페칭
   - 데이터 로딩을 위한 Suspense 통합
   - 캐싱 전략
   
3. **향상된 스타일링**:
   - 미디어 쿼리 지원
   - 키프레임 애니메이션
   - 테마 프로바이더 패턴
   - CSS 변수 통합
   
4. **성능 최적화**:
   - 코드 분할
   - 컴포넌트 지연 로딩
   - 스트리밍 SSR (React 18 스타일)
   - 점진적 향상
   
5. **개발자 경험**:
   - 핫 모듈 교체
   - 더 나은 에러 바운더리
   - 개발 vs 프로덕션 모드
   - TypeScript 개선

이 구현은 우리의 커스텀 React 구현 접근 방식을 유지하면서 SSR, 라우팅, 스타일링의 핵심 개념을 보여줍니다. 블로그의 개념들이 우리의 최소한의, 의존성 없는 설정에서 작동하도록 적용되었습니다. 