"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformJsxToReactCreateElement = transformJsxToReactCreateElement;
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
            }
            else if (char === '\'') {
                inStringSingle = false;
            }
        }
        else if (inStringDouble) {
            if (char === '\\') { // Handle escaped characters
                i++; // Skip the escaped character
            }
            else if (char === '"') {
                inStringDouble = false;
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
function transformJsxToReactCreateElement(jsxString) {
    jsxString = jsxString.trim();
    const fragmentMatch = jsxString.match(/^<>([\s\S]*?)<\/>$/); // Match fragment syntax and capture content
    if (fragmentMatch) {
        const childrenRawFragment = fragmentMatch[1] || '';
        const processedChildren = [];
        if (childrenRawFragment.trim().length > 0) {
            let currentFragmentIndex = 0;
            while (currentFragmentIndex < childrenRawFragment.length) {
                const remaining = childrenRawFragment.substring(currentFragmentIndex);
                if (remaining.startsWith('<')) {
                    // JSX element
                    const selfClosingMatch = remaining.match(/^<\w+[^>]*?\/>/);
                    if (selfClosingMatch) {
                        const selfClosingJsx = selfClosingMatch[0];
                        processedChildren.push(transformJsxToReactCreateElement(selfClosingJsx));
                        currentFragmentIndex += selfClosingJsx.length;
                        continue;
                    }
                    const openTagMatch = remaining.match(/^<(\w+)([^>]*)>/);
                    if (openTagMatch) {
                        const tagName = openTagMatch[1];
                        let balance = 1;
                        let tempIndex = openTagMatch[0].length;
                        let foundEnd = false;
                        while (tempIndex < remaining.length && balance > 0) {
                            if (remaining.substring(tempIndex, tempIndex + tagName.length + 1) === `<${tagName}` &&
                                (remaining[tempIndex + tagName.length + 1] === '>' || /\s/.test(remaining[tempIndex + tagName.length + 1]))) {
                                balance++;
                                let attrEnd = remaining.indexOf('>', tempIndex);
                                if (attrEnd !== -1)
                                    tempIndex = attrEnd + 1;
                                else
                                    tempIndex++;
                                continue;
                            }
                            if (remaining.substring(tempIndex, tempIndex + tagName.length + 3) === `</${tagName}>`) {
                                balance--;
                                if (balance === 0) {
                                    foundEnd = true;
                                    tempIndex += tagName.length + 3;
                                    break;
                                }
                                tempIndex += tagName.length + 3;
                                continue;
                            }
                            const nestedSelfClosingMatch = remaining.substring(tempIndex).match(/^<\w+[^>]*?\/>/);
                            if (nestedSelfClosingMatch) {
                                tempIndex += nestedSelfClosingMatch[0].length;
                                continue;
                            }
                            tempIndex++;
                        }
                        if (foundEnd) {
                            const jsxChild = remaining.substring(0, tempIndex);
                            processedChildren.push(transformJsxToReactCreateElement(jsxChild));
                            currentFragmentIndex += tempIndex;
                        }
                        else {
                            processedChildren.push(`// Error: Malformed nested JSX in fragment, missing closing tag for <${tagName}> in: "${remaining}"`);
                            currentFragmentIndex = childrenRawFragment.length;
                        }
                    }
                    else {
                        // Not a well-formed opening tag, treat as text
                        const nextTagOrExpression = remaining.indexOf('<', 1);
                        const nextJsExpression = remaining.indexOf('{');
                        let endIndex = remaining.length;
                        if (nextTagOrExpression !== -1 && (nextJsExpression === -1 || nextTagOrExpression < nextJsExpression)) {
                            endIndex = nextTagOrExpression;
                        }
                        else if (nextJsExpression !== -1 && (nextTagOrExpression === -1 || nextJsExpression < nextTagOrExpression)) {
                            endIndex = nextJsExpression;
                        }
                        const textContent = remaining.substring(0, endIndex);
                        if (textContent.length > 0) {
                            processedChildren.push(`'${textContent.replace(/'/g, "\'")}'`);
                        }
                        currentFragmentIndex += endIndex;
                    }
                }
                else if (remaining.startsWith('{')) {
                    // JavaScript expression
                    const exprResult = extractBalancedJsExpression(remaining, 0);
                    if (exprResult) {
                        processedChildren.push(exprResult.content);
                        currentFragmentIndex += exprResult.endIndex;
                    }
                    else {
                        processedChildren.push(`// Error: Malformed JavaScript expression in fragment, missing closing brace in: "${remaining}"`);
                        currentFragmentIndex = childrenRawFragment.length;
                    }
                }
                else {
                    // Plain text content
                    const nextTag = remaining.indexOf('<');
                    const nextJsExpression = remaining.indexOf('{');
                    let endIndex = remaining.length;
                    if (nextTag !== -1 && (nextJsExpression === -1 || nextTag < nextJsExpression)) {
                        endIndex = nextTag;
                    }
                    else if (nextJsExpression !== -1 && (nextTag === -1 || nextJsExpression < nextTag)) {
                        endIndex = nextJsExpression;
                    }
                    const textContent = remaining.substring(0, endIndex);
                    if (textContent.length > 0) {
                        processedChildren.push(`'${textContent.replace(/'/g, "\'")}'`);
                    }
                    currentFragmentIndex += endIndex;
                }
            }
        }
        const childrenStringFragment = processedChildren.length > 0 ? processedChildren.join(', ') : 'null';
        return `React.createElement(React.Fragment, null${childrenStringFragment !== 'null' ? ', ' + childrenStringFragment : ''})`;
    }
    // Regex to capture tag, attributes, and children (or indicate self-closing)
    // Group 1: tag name for open/close tag
    // Group 2: attributes for open/close tag (now handles '>' inside expressions)
    // Group 3: children content
    // Group 4: tag name for self-closing tag
    // Group 5: attributes for self-closing tag (now handles '>' inside expressions)
    const match = jsxString.match(/^<(\w+)(\s*(?:"[^"]*"|'[^']*'|\{[\s\S]*\}|[^">])*)>([\s\S]*)<\/\1>$/) || // <tag attrs>children</tag>
        jsxString.match(/^<(\w+)(\s*(?:"[^"]*"|'[^']*'|\{[\s\S]*\}|[^">])*)\/?>$/); // <tag attrs/>
    if (!match) {
        return `// Error: Could not parse simple JSX for input: "${jsxString}"`;
    }
    const tagName = match[1] || match[4]; // Use tag name from either pattern
    const childrenRaw = match[3] || ''; // Children are only from the first pattern
    const attributesRaw = match[2] || match[5] || ''; // Use attributes from either pattern
    const isSelfClosing = !childrenRaw; // If childrenRaw is empty, it's self-closing
    // 1. Parse Attributes
    const attributes = [];
    let currentAttrIndex = 0;
    while (currentAttrIndex < attributesRaw.length) {
        const remainingAttrs = attributesRaw.substring(currentAttrIndex);
        // Try to match a key="value" or key='value' pattern
        let match = remainingAttrs.match(/^\s*(\w+)="([^"]*)"/);
        if (!match) {
            match = remainingAttrs.match(/^\s*(\w+)='([^']*)'/);
        }
        if (match) {
            const key = match[1];
            const value = match[2];
            attributes.push(`${key}: "${value.replace(/"/g, '\\"').replace(/'/g, "\\'")}"`);
            currentAttrIndex += match[0].length;
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
    const processedChildren = [];
    if (!isSelfClosing && childrenRaw.trim().length > 0) {
        let currentIndex = 0;
        const childrenContent = childrenRaw;
        while (currentIndex < childrenContent.length) {
            const remaining = childrenContent.substring(currentIndex);
            if (remaining.startsWith('<')) {
                // Potential JSX element
                const selfClosingMatch = remaining.match(/^<(\w+)([^>]*)?\/>/);
                if (selfClosingMatch) {
                    const selfClosingJsx = selfClosingMatch[0];
                    processedChildren.push(transformJsxToReactCreateElement(selfClosingJsx));
                    currentIndex += selfClosingJsx.length;
                    continue;
                }
                const openTagMatch = remaining.match(/^<(\w+)([^>]*)>/);
                if (openTagMatch) {
                    const tagName = openTagMatch[1];
                    let balance = 1; // Start with 1 for the current opening tag
                    let tempIndex = openTagMatch[0].length; // Start scanning after the opening tag
                    let foundEnd = false;
                    while (tempIndex < remaining.length && balance > 0) {
                        // Check for opening tags of the same type
                        if (remaining.substring(tempIndex, tempIndex + tagName.length + 1) === `<${tagName}` &&
                            (remaining[tempIndex + tagName.length + 1] === '>' || /\s/.test(remaining[tempIndex + tagName.length + 1]))) {
                            balance++;
                            tempIndex += tagName.length + 1; // Move past the tag name for a simple match
                            // Need to correctly advance past attributes if any
                            let attrEnd = remaining.indexOf('>', tempIndex);
                            if (attrEnd !== -1)
                                tempIndex = attrEnd + 1;
                            else
                                tempIndex++; // Fallback
                            continue;
                        }
                        // Check for closing tags of the same type
                        if (remaining.substring(tempIndex, tempIndex + tagName.length + 3) === `</${tagName}>`) {
                            balance--;
                            if (balance === 0) {
                                foundEnd = true;
                                tempIndex += tagName.length + 3; // Move past the closing tag
                                break;
                            }
                            tempIndex += tagName.length + 3;
                            continue;
                        }
                        // Check for self-closing tags (nested within current element's content)
                        const nestedSelfClosingMatch = remaining.substring(tempIndex).match(/^<\w+[^>]*?\/>/);
                        if (nestedSelfClosingMatch) {
                            tempIndex += nestedSelfClosingMatch[0].length;
                            continue;
                        }
                        tempIndex++;
                    }
                    if (foundEnd) {
                        const jsxChild = remaining.substring(0, tempIndex);
                        processedChildren.push(transformJsxToReactCreateElement(jsxChild));
                        currentIndex += tempIndex;
                    }
                    else {
                        // Malformed JSX, couldn't find matching closing tag
                        processedChildren.push(`// Error: Malformed nested JSX, missing closing tag for <${tagName}> in: "${remaining}"`);
                        currentIndex = childrenContent.length; // Stop processing this segment
                    }
                }
                else {
                    // Not a well-formed opening tag, treat as text
                    const nextTagOrExpression = remaining.indexOf('<', 1);
                    const nextJsExpression = remaining.indexOf('{');
                    let endIndex = remaining.length;
                    if (nextTagOrExpression !== -1 && (nextJsExpression === -1 || nextTagOrExpression < nextJsExpression)) {
                        endIndex = nextTagOrExpression;
                    }
                    else if (nextJsExpression !== -1 && (nextTagOrExpression === -1 || nextJsExpression < nextTagOrExpression)) {
                        endIndex = nextJsExpression;
                    }
                    const textContent = remaining.substring(0, endIndex);
                    if (textContent.length > 0) {
                        processedChildren.push(`'${textContent.replace(/'/g, "\'")}'`);
                    }
                    currentIndex += endIndex;
                }
            }
            else if (remaining.startsWith('{')) {
                // JavaScript expression
                const exprResult = extractBalancedJsExpression(remaining, 0);
                if (exprResult) {
                    processedChildren.push(exprResult.content);
                    currentIndex += exprResult.endIndex;
                }
                else {
                    processedChildren.push(`// Error: Malformed JavaScript expression, missing closing brace in: "${remaining}"`);
                    currentIndex = childrenContent.length;
                }
            }
            else {
                // Plain text content
                const nextTag = remaining.indexOf('<');
                const nextJsExpression = remaining.indexOf('{');
                let endIndex = remaining.length;
                if (nextTag !== -1 && (nextJsExpression === -1 || nextTag < nextJsExpression)) {
                    endIndex = nextTag;
                }
                else if (nextJsExpression !== -1 && (nextTag === -1 || nextJsExpression < nextTag)) {
                    endIndex = nextJsExpression;
                }
                const textContent = remaining.substring(0, endIndex);
                if (textContent.length > 0) {
                    processedChildren.push(`'${textContent.replace(/'/g, "\'")}'`);
                }
                currentIndex += endIndex;
            }
        }
    }
    let childrenString = processedChildren.length > 0 ? processedChildren.join(', ') : 'null';
    if (isSelfClosing) {
        return `React.createElement('${tagName}', ${propsString})`;
    }
    else {
        return `React.createElement('${tagName}', ${propsString}, ${childrenString})`;
    }
}
