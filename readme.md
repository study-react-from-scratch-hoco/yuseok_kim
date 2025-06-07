# 목차
- [1주차 소감](#1주차-소감-1st-week-feelings)
- [1.1주차 소감-JSX parser](#1-1-주차-소감)

### 1주차 소감 (1st Week Feelings)

**파일 확장자를 ts로 해 놓고 어 왜 예제가 안 되는거지 해버렸습니다. </br>**
I wrote file extensions ts not tsx 😄, so why not works? I said </br>
그래서 일단 되게 해봐라고 Cursor.ai에서 gemini를 불렀는데, 어 예제랑 코드가 왜 다르지 고민하다 뒤늦게 깨달았네요 </br>
So I call gemini in cursor.ai and finally I see file extension difference

덕분에 순수 스크립트인 TS/JS와 xml을 같이 활용하는 JSX/TSX의 차이를 좀 더 체감할 수 있었던 거 같네요.

#### 코드 분석 by Gemini in cursor.ai

Both `app.tsx` and `app2.ts` serve the same purpose: to render a simple "Hello World" application using a custom-built, React-like library. However, they differ in their approach, primarily due to how they handle the creation of UI elements and their expected compilation environment.

Here's a breakdown of the differences:

**1. JSX vs. Manual `createElement` Calls:**

*   **`app.tsx` (JSX Approach):**
    ```jsx
    // ... existing code ...
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
    // ... existing code ...
    render(<App />, document.getElementById('myapp'));
    ```
    This file uses **JSX (JavaScript XML)** syntax within the `App` component. JSX is a syntax extension for JavaScript, popular with React. It allows you to write HTML-like structures directly within your JavaScript code. This JSX code *is not* valid JavaScript directly. It needs to be transformed (compiled) into regular JavaScript by a tool (like Babel or TypeScript's built-in JSX transformer) before it can run in a browser. The transformation converts JSX elements into `React.createElement()` calls. For example, `<div draggable>` becomes `React.createElement('div', { draggable: true })`.

*   **`app2.ts` (Manual `createElement` Calls):**
    ```typescript
    // ... existing code ...
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
    ```
    This file explicitly calls `React_TS.createElement()` for every UI element. This is the **direct JavaScript equivalent** of what JSX compiles down to. It doesn't require a separate JSX transformation step; it can be compiled directly by a TypeScript compiler (which then outputs standard JavaScript).

**2. Library Implementation Differences (`React` vs. `React_TS` and `ReactDOM_TS`):**

The custom "React-like" libraries themselves also have subtle differences because of the different approaches.

*   **`app.tsx`'s `React.createElement` and `render`:**
    *   **`createElement`:** Returns a plain JavaScript object representing the element (`{ tag, props, children }`). It expects the `render` function to do the actual DOM manipulation.
    *   **`render`:** Recursively creates DOM elements and appends them. It handles props by directly setting them on the DOM element (`domEl[prop] = el.props[prop]`). It also has a simpler handling of functional components, expecting the JSX transformer to pass children directly.

*   **`app2.ts`'s `React_TS.createElement` and `ReactDOM_TS.render`:**
    *   **`React_TS.createElement`:** Directly creates and returns a DOM element. This means the heavy lifting of DOM creation is done at the `createElement` stage, not the `render` stage.
    *   **Event Handling:** It includes explicit logic to handle event listeners (e.g., `onClick`, `onMouseOver`) by checking if a prop starts with 'on' and adding an event listener.
    *   **Props:** It uses `element.setAttribute(key, props[key])` for most attributes, which is generally a safer and more standard way to apply attributes to DOM elements than direct property assignment for all cases.
    *   **`ReactDOM_TS.render`:** Simply appends the already created DOM element to the target container.

**Summary of Differences and Why:**

The fundamental difference lies in their **development workflow and compilation.**

*   `app.tsx` is written with the expectation of being part of a modern web development setup that includes a **JSX transpiler (like TypeScript itself configured for React JSX, or Babel)**. This allows developers to write more concise and readable UI code using JSX, similar to how one would write actual HTML. The "library" in `app.tsx` reflects this, as `createElement` returns a "virtual" element object that then gets processed by `render`.

*   `app2.ts` is written to be as **close to plain JavaScript as possible** while still demonstrating React's core component-based idea. It avoids JSX and directly uses `createElement` calls. Its `createElement` function directly creates and manipulates DOM nodes, making it a more "self-contained" way to build the UI without needing a JSX transformation step. This is a more "vanilla" or "from-scratch" approach to building a UI library.

In essence, `app.tsx` demonstrates how you'd typically write a React-like application today (using JSX for developer convenience), while `app2.ts` shows the underlying mechanics that JSX abstracts away. They achieve the same visual output, but `app.tsx` relies on a build step for its JSX syntax, while `app2.ts` does not for its "app code" (though it still uses TypeScript, which requires compilation to JavaScript).

### 1-1 주차 소감
**Create JSX parser (JSX to ReactCreateElement) with Cursor.ai with Gemini)**
- **[parser.ts](parser.ts) - JSX parser**
- **[test_parser.ts](test_parser.ts) - Unit test code for parser.ts**

- 리엑트 라이브러리의 기반에서 중요 요소 중 하나는 JSX 문법이라고 생각합니다.
AST까지 구현은 어려울 거 같았지만, 단순 Parsing은 (tsx 파일을 tsc로 컴파일 했을 때 어떤 일이 일어나나 정도는) 충분히 시도해볼만 했다고 생각했습니다.
    - 그런데 제가 일일이 머리써서 코드를 쓰거나 맨땅에 삽질하긴 싫었습니다.
    - 그래서 Cursor랑 같이 하면서 구경하는 게 재밌더라구요.
- I thought React library's core infra feature is JSX syntax. Implemenation AST is to hard to me, but just Parsing should be possilbe(like tsc's compile for tsx)
     - But I type and think hard isn't my likes
     - So, I call Cursor AI
- Cursor랑 같이 구현하면서 느낀 소감은 은근히 Regex가 복잡하고, 또 번거롭다? 그리고 ADD를 위한 TDD는 사람의 지적 수고를 아주 많이 덜어준다 인 거 같아요.
- My feelings with Cursor, to implement this. Regex is annoying in slightly, and TDD for ADD is very good for me, by reducing reasoning job.