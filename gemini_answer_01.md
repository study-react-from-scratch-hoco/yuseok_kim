아, 파일을 올려주셨군요\! 이제 글의 내용을 직접 확인하고 설명해 드릴 수 있겠네요. 이전에 드렸던 답변이 Suspense와 Concurrent Mode의 '개념'에 대한 설명이었다면, 이번에는 **이 글의 저자가 '어떻게' 이 기능들을 직접 구현하는지**에 초점을 맞춰 구체적으로 설명해 드리겠습니다.

역시 예상대로, 이 글은 'Didact'라는 이름의 아주 간단한 React 클론을 직접 만들어보면서 그 내부 동작을 파헤치는 내용입니다. 글이 어려웠던 이유는 바로 이 '내부 구현' 때문입니다.

핵심은 **'렌더링 작업을 어떻게 쪼개고, 멈출 수 있게 만드는가'** 입니다.

### 1\. 문제점: 멈출 수 없는 렌더링 (Blocking Rendering)

글의 초반부에서는 `render` 함수가 재귀적으로(스스로를 계속 호출하며) 동작하는 방식을 보여줍니다.

```javascript
function render(element, container) {
  // ... DOM 노드 생성 ...

  element.props.children.forEach(child =>
    render(child, dom)
  );
}
```

Java나 C\#에서 재귀 함수를 호출하면, 그 함수가 완전히 끝날 때까지 제어권을 되찾아올 수 없는 것과 같습니다. React의 렌더링도 마찬가지로, 일단 시작되면 전체 컴포넌트 트리를 다 그릴 때까지 멈출 수 없습니다. 이것이 바로 '블로킹 렌더링'의 원인입니다.

### 2\. 해결책 1: Concurrent Mode 구현하기 (렌더링 쪼개기)

저자는 이 문제를 해결하기 위해 렌더링 과정을 잘게 쪼갭니다. 하나의 거대한 '렌더링' 작업을 여러 개의 작은 '작업 단위(Unit of Work)'로 나눕니다.

**핵심 아이디어:**

1.  **Work Loop 도입:** `requestIdleCallback`이라는 브라우저 API를 사용해 '작업 루프(Work Loop)'를 만듭니다. 이 API는 브라우저가 현재 한가할 때 (다른 중요한 작업이 없을 때)만 지정된 함수를 실행시켜 줍니다.

    ```javascript
    let nextUnitOfWork = null;

    function workLoop(deadline) {
      let shouldYield = false;
      while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
          nextUnitOfWork
        );
        // deadline.timeRemaining() < 1 : 남은 시간이 1ms 미만이면
        shouldYield = deadline.timeRemaining() < 1;
      }
      requestIdleCallback(workLoop);
    }

    requestIdleCallback(workLoop);
    ```

      * **비유:** Java의 스레드 풀에서 유휴 스레드(闲置线程, idle thread)가 있을 때만 백그라운드 작업을 실행시키는 것과 비슷합니다.
      * `while` 루프 안에서 작업 단위(`nextUnitOfWork`)를 하나씩 처리합니다.
      * **`shouldYield`**: 이 부분이 핵심입니다. 브라우저가 "나 이제 바빠질 것 같아\!"라고 신호를 주면 (`deadline.timeRemaining() < 1`), 루프를 멈추고 제어권을 브라우저에게 돌려줍니다. 그리고 다음 `requestIdleCallback`이 호출될 때 멈췄던 부분부터 다시 시작합니다.
      * 이렇게 함으로써 렌더링이 더 이상 메인 스레드를 독점하지 않게 됩니다. 이것이 바로 **Concurrent Mode의 원리**입니다.

2.  **Fiber 자료구조:** '작업 단위'를 관리하기 위해 'Fiber'라는 개념을 도입합니다. 이것은 단순히 다음에 처리할 작업을 가리키는 포인터(`child`, `sibling`, `return`)를 가진 자바스크립트 객체입니다. `performUnitOfWork` 함수는 이 Fiber 구조를 따라 이동하며 DOM을 만들고 다음 작업 단위를 반환합니다.

### 3\. 해결책 2: Suspense 구현하기 (비동기 작업 처리)

이제 렌더링을 멈출 수 있게 되었으니, 데이터 로딩 같은 비동기 상황을 처리할 차례입니다.

**핵심 아이디어:**

1.  **컴포넌트가 Promise를 던진다(throw):**
    글에서는 `resource`라는 객체를 만듭니다. 이 객체는 처음에는 데이터를 로딩 중인 `Promise`를 가지고 있습니다.

    ```javascript
    // 데이터를 아직 가져오는 중인 컴포넌트
    function ProfilePage() {
      const user = resource.user.read(); // 이 부분!
      return <h1>{user.name}</h1>;
    }
    ```

    `read()` 함수 내부는 데이터가 없으면 `Promise`를 `throw`하도록 되어 있습니다.

    > **C\#이나 Java의 관점:** 비즈니스 로직을 처리하다가 특정 조건이 만족되지 않았을 때 `Exception`을 `throw`하는 것과 완전히 동일한 원리입니다. 다만 여기서는 '예외 상황'이 아니라 '아직 준비가 안 된 상태'를 알리기 위해 사용됩니다.

2.  **`try...catch`로 Promise 잡기:**
    저자는 작업 단위를 처리하는 `performUnitOfWork` 함수를 `try...catch`로 감쌉니다.

    ```javascript
    function performUnitOfWork(fiber) {
      try {
        // 컴포넌트 함수를 실행 (e.g., ProfilePage())
      } catch (promise) {
        // 컴포넌트가 던진 Promise를 여기서 잡는다!
        // 그리고 이 컴포넌트를 나중에 다시 시도하도록 표시한다.
      }
      // ...
    }
    ```

      * 컴포넌트가 `Promise`를 던지면 `catch` 블록이 실행됩니다.
      * `catch` 블록 안에서는 이 컴포넌트의 렌더링을 일단 보류하고, `Promise`가 완료되면(`.then(...)`) 다시 렌더링 큐에 넣는 로직을 추가합니다.

3.  **`<Suspense>` 컴포넌트의 역할:**
    글의 `Suspense` 구현은 간단합니다. `try...catch`로 `Promise`가 잡혔을 때, 해당 `Suspense` 컴포넌트가 감싸고 있는 `fallback`(로딩 UI)을 대신 렌더링하도록 처리하는 로직이 추가됩니다.

### 정리

이 글의 저자는 다음 순서로 React의 고급 기능을 구현했습니다.

1.  **재귀적 렌더링 (문제점):** 한번 시작하면 멈출 수 없다.
2.  **Work Loop + Fiber (Concurrent Mode):** `requestIdleCallback`을 이용해 렌더링을 잘게 쪼개고, 브라우저가 바쁘면 멈출 수 있게 만들었다.
3.  **throw Promise + try-catch (Suspense):** 컴포넌트가 데이터 로딩이 필요하면 `Promise`를 던지고, 렌더링 로직(`performUnitOfWork`)에서 이를 잡아서 로딩이 끝난 후 다시 그리도록 스케줄링하는 방식으로 비동기 처리를 구현했다.

이처럼 매우 낮은 수준(low-level)에서 브라우저의 동작 방식과 자바스크립트의 특성을 활용해 기능을 하나하나 만들어가기 때문에 비전공자나 프론트엔드 경험이 적은 분들에게는 어렵게 느껴지는 것이 당연합니다.

이 글은 React가 내부적으로 **"어떻게 동시성과 비동기 UI를 우아하게 처리하는가"** 에 대한 훌륭한 해설서라고 할 수 있습니다. 이 설명을 통해 글의 전체적인 흐름을 파악하는 데 도움이 되셨으면 좋겠습니다.