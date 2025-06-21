### 2. Front-end 1st Project Review

https://github.com/1-hummingbird/front_starbucks_clone/pull/45

- React의 JSX에서 DOM 에 Promise 객체가 주입되면 렌더링이 안 됩니다.
그럼으로 Promise를 해당 객체 타입으로 풀어주는 과정을 거쳐야 하는데,
이걸 node.js 기반 프레임워크를 쓰면서 클라이언트 화면에서 풀리게 하면
사용자 경험에 좋지 못해요
    - 휴대폰 새 걸로 안 바꾸는 사람이나 저렴한 PC 혹은 옛날 PC 쓰는 사람은 UX가 아주 아주 안 좋아질겁니다.
    - 기왕 서버에서 돌아가는 거면, Promise 풀어주는 것도 서버에서 바로 하는 게 좋을 거에요
- 그리고 Typescript에서 map 쓸 때 타입 추론 실패로 빌드 안 될 때 있어요
    - 주로 nullable 할 때 일어나는 부분입니다.
- Promise all의 경우 일부라도 실패하면 전체를 실패처리하기 때문에 사용 시 유의해야 해요
    - https://inpa.tistory.com/entry/JS-%F0%9F%93%9A-%EB%8D%94%EC%9D%B4%EC%83%81-Promiseall-%EC%93%B0%EC%A7%80%EB%A7%90%EA%B3%A0-PromiseallSettled-%EC%82%AC%EC%9A%A9%ED%95%98%EC%9E%90
    - https://baek.dev/post/48/
    - https://velog.io/@hiro2474/understandfor-await-of
    
    ![image.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/c0d701d2-c1cf-42ae-a5e5-ab227ad3d939/6023c576-0dd2-4586-9ff5-ff107fdfc9cb/image.png)
    
    - map 도 forEach와 같다고 이해하면 될 거에요
    - 순서 관리가 필요한지 아닌지도 고민하면서 쓰시면 더 좋겠어요