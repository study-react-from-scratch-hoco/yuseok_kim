import { transformJsxToReactCreateElement } from './parser';

console.log('--- Testing transformJsxToReactCreateElement ---');

// Test Case 1: Simple element with no props or children
const jsx1 = `<div/>`;
const expected1 = `React.createElement('div', null)`;
const result1 = transformJsxToReactCreateElement(jsx1);
console.log(`Input:   ${jsx1}`);
console.log(`Output:  ${result1}`);
console.log(`Expected: ${expected1}`);
console.log(`Match: ${result1 === expected1}\n`);

// Test Case 2: Element with a string attribute
const jsx2 = `<input type="text"/>`;
const expected2 = `React.createElement('input', { type: "text" })`;
const result2 = transformJsxToReactCreateElement(jsx2);
console.log(`Input:   ${jsx2}`);
console.log(`Output:  ${result2}`);
console.log(`Expected: ${expected2}`);
console.log(`Match: ${result2 === expected2}\n`);

// Test Case 3: Element with a boolean attribute
const jsx3 = `<div draggable/>`;
const expected3 = `React.createElement('div', { draggable: true })`;
const result3 = transformJsxToReactCreateElement(jsx3);
console.log(`Input:   ${jsx3}`);
console.log(`Output:  ${result3}`);
console.log(`Expected: ${expected3}`);
console.log(`Match: ${result3 === expected3}\n`);

// Test Case 4: Element with text children
const jsx4 = `<h2>Hello World!</h2>`;
const expected4 = `React.createElement('h2', null, 'Hello World!')`;
const result4 = transformJsxToReactCreateElement(jsx4);
console.log(`Input:   ${jsx4}`);
console.log(`Output:  ${result4}`);
console.log(`Expected: ${expected4}`);
console.log(`Match: ${result4 === expected4}\n`);

// Test Case 5: Element with mixed attributes and text children
const jsx5 = `<p id="my-paragraph">I am a paragraph</p>`;
const expected5 = `React.createElement('p', { id: "my-paragraph" }, 'I am a paragraph')`;
const result5 = transformJsxToReactCreateElement(jsx5);
console.log(`Input:   ${jsx5}`);
console.log(`Output:  ${result5}`);
console.log(`Expected: ${expected5}`);
console.log(`Match: ${result5 === expected5}\n`);

// Test Case 6: Attempt to parse complex JSX (will likely fail or produce unexpected output due to limitations)
const jsx6 = `<div><span>Nested</span></div>`;
const expected6 = `React.createElement('div', null, React.createElement('span', null, 'Nested'))`;
const result6 = transformJsxToReactCreateElement(jsx6);
console.log(`Input:   ${jsx6}`);
console.log(`Output:  ${result6}`);
console.log(`Expected: ${expected6}`);
console.log(`Match: ${result6 === expected6}\n`);

const jsx7 = `<input type="text" value={myVar}/>`;
const expected7 = `React.createElement('input', { type: "text", value: myVar })`;
const result7 = transformJsxToReactCreateElement(jsx7);
console.log(`Input:   ${jsx7}`);
console.log(`Output:  ${result7}`);
console.log(`Expected: ${expected7}`);
console.log(`Match: ${result7 === expected7}\n`);

// New Test Case: Element with multiple mixed children (text and JSX)
const jsx8 = `<div>Hello <p>World</p>!</div>`;
const expected8 = `React.createElement('div', null, 'Hello ', React.createElement('p', null, 'World'), '!')`;
const result8 = transformJsxToReactCreateElement(jsx8);
console.log(`Input:   ${jsx8}`);
console.log(`Output:  ${result8}`);
console.log(`Expected: ${expected8}`);
console.log(`Match: ${result8 === expected8}\n`);

// New Test Case: Element with multiple JSX sibling children
const jsx9 = `<div><p>First</p><span>Second</span></div>`;
const expected9 = `React.createElement('div', null, React.createElement('p', null, 'First'), React.createElement('span', null, 'Second'))`;
const result9 = transformJsxToReactCreateElement(jsx9);
console.log(`Input:   ${jsx9}`);
console.log(`Output:  ${result9}`);
console.log(`Expected: ${expected9}`);
console.log(`Match: ${result9 === expected9}\n`);

// New Test Case: Element with JavaScript expression as a child
const jsx10 = `<h2>Hello {world}!</h2>`;
const expected10 = `React.createElement('h2', null, 'Hello ', world, '!')`;
const result10 = transformJsxToReactCreateElement(jsx10);
console.log(`Input:   ${jsx10}`);
console.log(`Output:  ${result10}`);
console.log(`Expected: ${expected10}`);
console.log(`Match: ${result10 === expected10}\n`);

// New Test Case: Deeply nested JSX elements (e.g., <div><div><span>Text</span></div></div>)
const jsx11 = `<div><div><span>Nested Deeply</span></div></div>`;
const expected11 = `React.createElement('div', null, React.createElement('div', null, React.createElement('span', null, 'Nested Deeply')))`;
const result11 = transformJsxToReactCreateElement(jsx11);
console.log(`Input:   ${jsx11}`);
console.log(`Output:  ${result11}`);
console.log(`Expected: ${expected11}`);
console.log(`Match: ${result11 === expected11}\n`);

// New Test Case: Fragment with text children
const jsx12 = `<>Hello Fragment!</>`;
const expected12 = `React.createElement(React.Fragment, null, 'Hello Fragment!')`;
const result12 = transformJsxToReactCreateElement(jsx12);
console.log(`Input:   ${jsx12}`);
console.log(`Output:  ${result12}`);
console.log(`Expected: ${expected12}`);
console.log(`Match: ${result12 === expected12}\n`);

// New Test Case: Fragment with JSX children
const jsx13 = `<><p>Child 1</p><span>Child 2</span></>`;
const expected13 = `React.createElement(React.Fragment, null, React.createElement('p', null, 'Child 1'), React.createElement('span', null, 'Child 2'))`;
const result13 = transformJsxToReactCreateElement(jsx13);
console.log(`Input:   ${jsx13}`);
console.log(`Output:  ${result13}`);
console.log(`Expected: ${expected13}`);
console.log(`Match: ${result13 === expected13}\n`);

// New Test Case: Deeply nested JSX with mixed content
const jsx14 = `<div>Text 1 <span>Nested Text {expr1} <button/></span> Text 2 {expr2}</div>`;
const expected14 = `React.createElement('div', null, 'Text 1 ', React.createElement('span', null, 'Nested Text ', expr1, ' ', React.createElement('button', null)), ' Text 2 ', expr2)`;
const result14 = transformJsxToReactCreateElement(jsx14);
console.log(`Input:   ${jsx14}`);
console.log(`Output:  ${result14}`);
console.log(`Expected: ${expected14}`);
console.log(`Match: ${result14 === expected14}\n`); 