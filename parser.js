console.log('parser.ts module loaded');
/**
 * A very simplified JSX to React.createElement transformer.
 *
 * This function attempts to convert basic JSX elements with:
 * - Simple tag names (e.g., 'div', 'h2')
 * - Simple string attributes (e.g., `attr="value"`)
 * - Boolean attributes (e.g., `draggable`)
 * - Plain text children, preserving whitespace.
 * - Arbitrarily deep and complex nested JSX elements.
 * - Multiple sibling JSX elements or mixed text and JSX children.
 * - Simple JavaScript expressions as attributes (e.g., `value={myVar}`).
 * - Simple JavaScript expressions as children (e.g., `{myVar}`).
 * - Fragments (<>...</>).
 *
 * For robust JSX parsing, dedicated libraries or a language's built-in transpiler (like TypeScript's) are required.
 *
 * @param jsxString The JSX string to transform.
 * @returns A string representing the equivalent React.createElement call.
 */
const extractBalancedJsExpression = (source, startIndex) => {
    let balanceCurly = 0;
    let balanceParen = 0;
    let balanceSquare = 0;
    let inStringSingle = false;
    let inStringDouble = false;
    let inTemplate = false;
    let i = startIndex;
    if (source[i] === '{') {
        balanceCurly++;
        i++;
    }
    else {
        return null;
    }
    const expressionContentStart = i;
    while (i < source.length) {
        const char = source[i];
        if (inStringSingle) {
            if (char === '\\') { // Handle escaped characters
                i++; // Skip the escaped character
                if (i < source.length)
                    i++; // Skip the next character too
                continue;
            }
            else if (char === '\'') {
                inStringSingle = false;
            }
        }
        else if (inStringDouble) {
            if (char === '\\') { // Handle escaped characters
                i++; // Skip the escaped character
                if (i < source.length)
                    i++; // Skip the next character too
                continue;
            }
            else if (char === '"') {
                inStringDouble = false;
            }
        }
        else if (inTemplate) {
            if (char === '\\') { // Handle escaped characters
                i++; // Skip the escaped character
                if (i < source.length)
                    i++; // Skip the next character too
                continue;
            }
            else if (char === '`') {
                inTemplate = false;
            }
        }
        else {
            if (char === '{') {
                balanceCurly++;
            }
            else if (char === '}') {
                balanceCurly--;
            }
            else if (char === '(') {
                balanceParen++;
            }
            else if (char === ')') {
                balanceParen--;
            }
            else if (char === '[') {
                balanceSquare++;
            }
            else if (char === ']') {
                balanceSquare--;
            }
            else if (char === '\'') {
                inStringSingle = true;
            }
            else if (char === '"') {
                inStringDouble = true;
            }
            else if (char === '`') {
                inTemplate = true;
            }
            // If the outermost curly brace is balanced, we've found the end of the expression
            if (balanceCurly === 0) {
                return {
                    content: source.substring(expressionContentStart, i).trim(),
                    endIndex: i + 1,
                };
            }
        }
        i++;
    }
    return null; // Malformed: unmatched brace
};
/**
 * Helper function to process children content, handling JSX elements, JavaScript expressions, and plain text.
 * This function is designed to be called recursively by transformJsxToReactCreateElement.
 * @param childrenRaw The raw string content of children to process.
 * @returns An array of processed child strings ready for React.createElement.
 */
function processChildren(childrenRaw) {
    const processedChildren = [];
    let currentIndex = 0;
    if (childrenRaw.trim().length === 0) {
        return processedChildren;
    }
    let loopCount = 0;
    while (currentIndex < childrenRaw.length) {
        loopCount++;
        if (loopCount > 1000) {
            console.error('processChildren: Loop count exceeded, breaking to prevent infinite loop');
            processedChildren.push('null /* Error: Loop limit exceeded in processChildren */');
            break;
        }
        const lastIndex = currentIndex;
        const remaining = childrenRaw.substring(currentIndex);
        // 1. Prioritize JavaScript expressions
        if (remaining.startsWith('{')) {
            const exprResult = extractBalancedJsExpression(remaining, 0);
            if (exprResult) {
                processedChildren.push(exprResult.content);
                currentIndex += exprResult.endIndex;
                continue;
            }
            else {
                processedChildren.push(`null /* Error: Malformed JavaScript expression, missing closing brace in: "${remaining}" */`);
                currentIndex = childrenRaw.length;
                break;
            }
        }
        // 2. Prioritize JSX elements - look for any tag that starts with <
        if (remaining.startsWith('<')) {
            const currentJsxElementLength = findLengthOfFullJsxElement(remaining);
            if (currentJsxElementLength > 0) {
                const jsxChild = remaining.substring(0, currentJsxElementLength);
                processedChildren.push(transformJsxToReactCreateElement(jsxChild));
                currentIndex += currentJsxElementLength;
                continue;
            }
            else {
                processedChildren.push(`null /* Error: Malformed JSX element in children: "${remaining.substring(0, Math.min(remaining.length, 100))}" */`);
                currentIndex = childrenRaw.length;
                break;
            }
        }
        // 3. Handle plain text (if it doesn't start with a JSX tag or JS expression)
        const nextJsxOrExprStart = Math.min(remaining.indexOf('<') === -1 ? remaining.length : remaining.indexOf('<'), remaining.indexOf('{') === -1 ? remaining.length : remaining.indexOf('{'));
        const textContent = remaining.substring(0, nextJsxOrExprStart);
        if (textContent.length > 0) {
            processedChildren.push(JSON.stringify(textContent));
        }
        currentIndex += textContent.length;
        // Safety check to prevent infinite loops
        if (currentIndex === lastIndex) {
            console.error(`processChildren: No progress made at index ${currentIndex}, breaking to prevent infinite loop`);
            processedChildren.push('null /* Error: No progress in processChildren */');
            break;
        }
    }
    return processedChildren;
}
// New helper function to find the length of a complete JSX element, handling nesting.
// Returns the length of the element, or -1 if malformed.
function findLengthOfFullJsxElement(jsxString) {
    const trimmedJsx = jsxString.replace(/^\s+/, ''); // Replaced trimLeft() with regex
    if (!trimmedJsx.startsWith('<')) {
        return -1; // Not a JSX element
    }
    // Safety check to prevent infinite loops
    if (trimmedJsx.length > 10000) {
        console.error('findLengthOfFullJsxElement: JSX string too long, aborting');
        return -1;
    }
    // Helper function to find the end of a tag, handling JS expressions properly
    const findTagEnd = (jsx, startIndex) => {
        let i = startIndex;
        let braceDepth = 0;
        let inString = false;
        let stringChar = '';
        while (i < jsx.length) {
            const char = jsx[i];
            if (!inString) {
                if (char === '"' || char === "'") {
                    inString = true;
                    stringChar = char;
                }
                else if (char === '{') {
                    braceDepth++;
                }
                else if (char === '}') {
                    braceDepth--;
                }
                else if (char === '>' && braceDepth === 0) {
                    return i;
                }
            }
            else {
                if (char === stringChar && jsx[i - 1] !== '\\') {
                    inString = false;
                }
            }
            i++;
        }
        return -1;
    };
    // Find tag name
    const tagNameMatch = trimmedJsx.match(/^<(\w+)/);
    if (!tagNameMatch) {
        console.log('findLengthOfFullJsxElement: No tag name found');
        return -1;
    }
    const tagName = tagNameMatch[1];
    const tagEnd = findTagEnd(trimmedJsx, tagNameMatch[0].length);
    if (tagEnd === -1) {
        console.log('findLengthOfFullJsxElement: Could not find tag end');
        return -1;
    }
    // Check if it's self-closing
    if (trimmedJsx[tagEnd - 1] === '/') {
        return tagEnd + 1;
    }
    // Process opening tag - look for matching closing tag
    let balance = 1;
    let tempIndex = tagEnd + 1; // Start after the opening tag
    let loopCount = 0;
    while (tempIndex < trimmedJsx.length && balance > 0) {
        loopCount++;
        if (loopCount > 1000) {
            console.error('findLengthOfFullJsxElement: Loop count exceeded, breaking to prevent infinite loop');
            return -1;
        }
        const sub = trimmedJsx.substring(tempIndex);
        const nextRelevantChar = Math.min(sub.indexOf('<') === -1 ? sub.length : sub.indexOf('<'), sub.indexOf('{') === -1 ? sub.length : sub.indexOf('{'));
        if (nextRelevantChar > 0) {
            // Advance past plain text
            tempIndex += nextRelevantChar;
            continue;
        }
        // At a relevant character ('<' or '{') or end of string
        if (sub.startsWith(`</${tagName}>`)) {
            balance--;
            tempIndex += tagName.length + 3;
        }
        else if (sub.startsWith('<')) {
            // Any other nested JSX tag (different tag name or self-closing)
            const nestedLength = findLengthOfFullJsxElement(sub);
            if (nestedLength > 0) {
                tempIndex += nestedLength;
                continue; // Move to next iteration
            }
            else {
                return -1; // Malformed nested JSX
            }
        }
        else if (sub.startsWith('{')) {
            // Nested JS expression
            const expr = extractBalancedJsExpression(sub, 0);
            if (expr) {
                tempIndex += expr.endIndex;
                continue; // Move to next iteration
            }
            else {
                return -1; // Malformed JS expression
            }
        }
        else {
            // If execution reaches here, it means the character at tempIndex is neither '<' nor '{'
            // and it's not part of a closing tag, which indicates malformed JSX.
            return -1; // Malformed JSX
        }
    }
    return balance === 0 ? tempIndex : -1; // Return total length of the element, or -1 if malformed (unbalanced)
}
export function transformJsxToReactCreateElement(jsxString) {
    jsxString = jsxString.trim();
    const fragmentMatch = jsxString.match(/^<>([\s\S]*?)<\/>$/); // Match fragment syntax and capture content
    if (fragmentMatch) {
        const childrenRawFragment = fragmentMatch[1] || '';
        const processedChildren = processChildren(childrenRawFragment); // Call the new helper function
        const childrenStringFragment = processedChildren.length > 0 ? processedChildren.join(', ') : 'null';
        return `React_TS.createElement(React_TS.Fragment, null${childrenStringFragment !== 'null' ? ', ' + childrenStringFragment : ''})`;
    }
    // Use the same helper function to properly parse the JSX
    const findTagEnd = (jsx, startIndex) => {
        let i = startIndex;
        let braceDepth = 0;
        let inString = false;
        let stringChar = '';
        while (i < jsx.length) {
            const char = jsx[i];
            if (!inString) {
                if (char === '"' || char === "'") {
                    inString = true;
                    stringChar = char;
                }
                else if (char === '{') {
                    braceDepth++;
                }
                else if (char === '}') {
                    braceDepth--;
                }
                else if (char === '>' && braceDepth === 0) {
                    return i;
                }
            }
            else {
                if (char === stringChar && jsx[i - 1] !== '\\') {
                    inString = false;
                }
            }
            i++;
        }
        return -1;
    };
    // Find tag name and tag end
    const tagNameMatch = jsxString.match(/^<(\w+)/);
    if (!tagNameMatch) {
        return `null /* Error: Could not find tag name in: "${JSON.stringify(jsxString)}" */`;
    }
    const tagName = tagNameMatch[1];
    const tagEnd = findTagEnd(jsxString, tagNameMatch[0].length);
    if (tagEnd === -1) {
        return `null /* Error: Could not find tag end in: "${JSON.stringify(jsxString)}" */`;
    }
    const isSelfClosing = jsxString[tagEnd - 1] === '/';
    const attributesRaw = jsxString.substring(tagNameMatch[0].length, isSelfClosing ? tagEnd - 1 : tagEnd).trim();
    let childrenRaw = '';
    if (!isSelfClosing) {
        const closingTag = `</${tagName}>`;
        const closingTagIndex = jsxString.lastIndexOf(closingTag);
        if (closingTagIndex === -1) {
            return `null /* Error: Could not find closing tag ${closingTag} in: "${JSON.stringify(jsxString)}" */`;
        }
        childrenRaw = jsxString.substring(tagEnd + 1, closingTagIndex);
    }
    // 1. Parse Attributes
    const attributes = [];
    let currentAttrIndex = 0;
    while (currentAttrIndex < attributesRaw.length) {
        const remainingAttrs = attributesRaw.substring(currentAttrIndex);
        // Try to match a key="value" or key='value' pattern
        let attrMatch = remainingAttrs.match(/^\s*(\w+)="([^"]*)"/);
        if (!attrMatch) {
            attrMatch = remainingAttrs.match(/^\s*(\w+)='([^']*)'/);
        }
        if (attrMatch) {
            const key = attrMatch[1];
            const value = attrMatch[2];
            attributes.push(`${key}: ${JSON.stringify(value)}`);
            currentAttrIndex += attrMatch[0].length;
            continue;
        }
        // Try to match a key={expression} pattern
        const exprMatch = remainingAttrs.match(/^\s*(\w+)=\{/);
        if (exprMatch) {
            const key = exprMatch[1];
            const braceStartIndex = remainingAttrs.indexOf('{');
            const exprResult = extractBalancedJsExpression(remainingAttrs, braceStartIndex);
            if (exprResult) {
                attributes.push(`${key}: ${exprResult.content}`);
                currentAttrIndex += exprResult.endIndex;
                continue;
            }
            else {
                attributes.push(`${key}: /* Malformed Expression */ null`);
                currentAttrIndex = attributesRaw.length; // Stop processing malformed attributes
                continue;
            }
        }
        // Try to match a boolean attribute (key only)
        const boolMatch = remainingAttrs.match(/^\s*(\w+)/);
        if (boolMatch) {
            const key = boolMatch[1];
            attributes.push(`${key}: true`);
            currentAttrIndex += boolMatch[0].length;
            continue;
        }
        // If nothing matches, advance by one character to avoid infinite loop (should not happen with well-formed JSX)
        currentAttrIndex++;
    }
    const propsString = attributes.length > 0 ? `{ ${attributes.join(', ')} }` : 'null';
    // 2. Handle Children
    const processedChildren = processChildren(childrenRaw); // Call the new helper function
    let childrenString = processedChildren.length > 0 ? processedChildren.join(', ') : 'null';
    if (isSelfClosing) {
        return `React_TS.createElement('${tagName}', ${propsString})`;
    }
    else {
        return `React_TS.createElement('${tagName}', ${propsString}, ${childrenString})`;
    }
}
