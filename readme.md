# 목차
- [1주차 소감](#1주차-소감-1st-week-feelings)
- [1.1주차 소감-JSX parser](#1-1-주차-소감)
- [2주차 소감](#2주차-소감)
- [2.1 Parser](#21-Self-created-parser-using)
- [2.2 Bundling](#22-bundling-by-tsc-with-tsconfig-options)
- [3주차 소감](#3주차-소감)

### 1주차 소감 (1st Week Feelings)
[목차](#목차)

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
[목차](#목차)
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

### 2주차 소감
[목차](#목차)
- State 관리가 왜 중요한지, 그리고 어려운지 체감을 할 수있는 좋은 기회였네요.
    - 지금 예제는 0번부터 idx + cursor로 관리하지만, key-value로 관리하는 방법도 있지 않을까 고민이 들었네요.
      - 그러면 대신 state 이름이 중복이 안 되는 제약이 생길 거 같기도 하고요.
      - 하지만 많은 상태를 관리할 때 효율적으로 접근할 수 있지 않을까요? 특정 state에 대한 거만 re rendering 하거나,\
        cursor 관리 대신 state 이름 관리만 하면 되니까요.
- 상태 관리를 array 에서 hashmap으로 바꿀때 어떤 영향이 있을 지 한번 궁금해졌어요.

### 2.1 Self created parser using
[목차](#목차)
- 이전에 만들어두었던 간단한 parser를 ts 파일에서 한번 활용해 보려고 했는데, 안 되더라구요.
    - 그래서 이걸 일단 cursor.ai랑 같이 맞춰보는 중에 느꼈는데, 어 이거 이상하게 만들고 있는데 생각이 들었어요.
    - 하지만 잘 작동시켜둔 Unit Test 파일 덕분에 편하게 cursor, unit test 결과도 봐 주겠니? 했는데 알아서 뭔가 뚝딱뚝딱 하더라구요
    - JSX 문법 parser가 참 어려운 주제였구나 싶었습니다.
- 안 되는 걸 고친 claude 4 sonnet은 제 신인거 같네요
    - ✅ Fixed Issues:
    **Complex Tag Detection:** \
    Implemented a robust findTagEnd function that properly handles JavaScript expressions inside attributes (like onClick={() => console.log('Clicked')})\
    **Self-Closing Tag Recognition:** \
    Fixed the regex patterns to correctly identify self-closing tags vs opening tags\
    **Nested JSX Processing:** \
     Fixed the processChildren function to properly handle nested JSX elements without infinite loops\
     **JavaScript Expression Parsing: **\
      Enhanced extractBalancedJsExpression to handle template literals, arrow functions, and complex expressions\
      **Attribute Parsing:** \
       Updated the main parsing function to use the same robust tag detection logic


### 2.2 Bundling by tsc with tsconfig options
[목차](#목차)
- bundling을 위해 알려진 bundler library를 사용해야만 하는가 궁금했는데, tsc에서 어느정도 된다는 걸 보았어요 (thanks Gemini)
- 근데 그냥 bundling만 한다고 되는 것도 아니라서, 어떻게 해야 잘 돌아가는가가 또 고려사항이 되더라구요
- 그래서 구경을 좀 했는데 [PR #5](https://github.com/study-react-from-scratch-hoco/yuseok_kim/pull/5)
    - 간단한 소감은 음 미묘하네요, 하지만 일단 vite나 webpack 같은 거 없이 시도를 해 볼 수 있었다?, tsc build로 해결했다?
    - 그렇지만 require.js/2.3.6 의존성이 늘어난 건 왜인지 잘 모르겠어요,\
     아무튼 이 친구가 bundle.js에서 필요한 부분만 뽑아준다로 이해했습니다.
- 아 코파일럿의 리뷰에서 너 입력된 JSX 제대로 검사 안 하면 큰일 날 수 있다? 라는 곳에서 입력값 검증이란 기초적 시큐어코딩이 중요함을 되세겼네요.

### 3주차 소감
[목차](#목차)
- 우선 글이 도대체 무슨소리지 한참 고민하다 제미나이 친구에게 물어봤어요.\
(프롬프트)
```
Let’s build a React from scratch: Part 3— React Suspense and Concurrent Mode | by Arindam Paul | Medium
+ mhtml 파일 추가 첨부

이 글의 내용을 이해하기 좀 어려운데, 한글로 설명해줄 수 있을까?

나는 React에 관해서는 부트캠프에서 Next.js 기반 프로그램 학습 경험 조금이고, Java 백엔드 위주로 5개월 학습했어
회사에서는 Powerbuilder(ERP Project), C#(ASP.NET razor web page, .NET Framework DLL project) 경험 6개월,


원래 컴퓨터공학 전공자가 아니었고, 독학학위제 시험을 통해 학사학위를 취득하였으며, 정보보안기사, 정보처리기사 자격증 수준의 기초만 있다
```
덕분에 이해가 수월해졌습니다.
[답변](gemini_answer_01.md)


- 여러개 병렬을 어떻게 해 볼 수 있을까의 문제는, Cursor.AI에서 Claude 4 Opus를 부르니 시원하게 풀어주더라구요....
    - 중복요청 방지해야 하고, 비동기 요청은 한번에 불러야하기도 하고 이런 문제를 정리해주니 고마웠어요.
    - Promise.All 이 함부로 쓰이면 안 된다고 친구에개 배웠던 기억이 있는데 아 이렇게 쓰일 수도 있구나 하고 이해하는 계기가 되었기도 해요.
        - [친구와의 대화](talk_partial.md)