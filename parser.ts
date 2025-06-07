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
 * It will NOT correctly parse:
 * - JSX inside string literals.
 * - Complex JavaScript expressions as attribute values (e.g., `value={myFunction()}`).
 * - Complex JavaScript expressions as children (e.g., `{a + b}` or `{() => {}}`).
 * - Self-closing tags with no space before `/>` (e.g., `<input/>` may be problematic without careful regex).
 *
 * For robust JSX parsing, dedicated libraries or a language's built-in transpiler (like TypeScript's) are required.
 *
 * @param jsxString The JSX string to transform.
 * @returns A string representing the equivalent React.createElement call.
 */
export function transformJsxToReactCreateElement(jsxString: string): string {
    jsxString = jsxString.trim();

    const fragmentMatch = jsxString.match(/^<>([\s\S]*?)<\/>$/); // Match fragment syntax and capture content
    if (fragmentMatch) {
        const childrenRawFragment = fragmentMatch[1] || '';
        // Handle children for fragments similar to regular elements
        const processedChildren: string[] = [];
        if (childrenRawFragment.trim().length > 0) {
            const cleanedChildren = childrenRawFragment.trim();
            const childNodeRegex = /(<\w+[^>]*>.*?<\/\w+>|<\w+[^>]*?\/>)|(\{[^}]*\})|([^<{]+)/g;
            let childMatch;
            while ((childMatch = childNodeRegex.exec(cleanedChildren)) !== null) {
                const jsxChild = childMatch[1];
                const jsExpressionChild = childMatch[2];
                const textChild = childMatch[3];

                if (jsxChild) {
                    processedChildren.push(transformJsxToReactCreateElement(jsxChild));
                } else if (jsExpressionChild) {
                    processedChildren.push(jsExpressionChild.substring(1, jsExpressionChild.length - 1).trim());
                } else if (textChild && textChild.length > 0) {
                    processedChildren.push(`'${textChild.replace(/'/g, "\\'")}'`);
                }
            }
        }
        const childrenStringFragment = processedChildren.length > 0 ? processedChildren.join(', ') : 'null';
        return `React.createElement(React.Fragment, null${childrenStringFragment !== 'null' ? ', ' + childrenStringFragment : ''})`;
    }

    // Regex to capture tag, attributes, and children (or indicate self-closing)
    // Group 1: tag name for open/close tag
    // Group 2: attributes for open/close tag
    // Group 3: children content
    // Group 4: tag name for self-closing tag
    // Group 5: attributes for self-closing tag
    const match = jsxString.match(/^<(\w+)([^>]*)>([\s\S]*)<\/\1>$/) || // <tag attrs>children</tag>
                  jsxString.match(/^<(\w+)([^>]*)?\/>$/);           // <tag attrs/>

    if (!match) {
        return `// Error: Could not parse simple JSX for input: "${jsxString}"`;
    }

    const tagName = match[1] || match[4]; // Use tag name from either pattern
    const childrenRaw = match[3] || ''; // Children are only from the first pattern
    const attributesRaw = match[2] || match[5] || ''; // Use attributes from either pattern
    const isSelfClosing = !childrenRaw; // If childrenRaw is empty, it's self-closing

    // 1. Parse Attributes
    const attributes: string[] = [];
    // Matches: key="value", key='value', key={expression}, key
    const attrRegex = /(\w+)(?:="([^"]*)"|='([^']*)'|=\{([^}]*)\})?/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attributesRaw)) !== null) {
        const key = attrMatch[1];
        const valueDoubleQuote = attrMatch[2];
        const valueSingleQuote = attrMatch[3];
        const valueExpression = attrMatch[4]; // This will be treated as raw expression

        if (valueDoubleQuote !== undefined) {
            attributes.push(`${key}: "${valueDoubleQuote.replace(/"/g, '\\\\"')}"`);
        } else if (valueSingleQuote !== undefined) {
            attributes.push(`${key}: "${valueSingleQuote.replace(/'/g, "\\\\'")}"`);
        } else if (valueExpression !== undefined) {
            // IMPORTANT LIMITATION: This simplified parser just inserts the expression as-is.
            // It does not parse or validate the JS expression within {}.
            attributes.push(`${key}: ${valueExpression}`);
        } else {
            // Boolean attribute (e.g., 'draggable')
            attributes.push(`${key}: true`);
        }
    }

    const propsString = attributes.length > 0 ? `{ ${attributes.join(', ')} }` : 'null';

    // 2. Handle Children
    const processedChildren: string[] = [];
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
                            if (attrEnd !== -1) tempIndex = attrEnd + 1;
                            else tempIndex++; // Fallback
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
                    } else {
                        // Malformed JSX, couldn't find matching closing tag
                        processedChildren.push(`// Error: Malformed nested JSX, missing closing tag for <${tagName}> in: "${remaining}"`);
                        currentIndex = childrenContent.length; // Stop processing this segment
                    }
                } else {
                    // Not a well-formed opening tag, treat as text
                    const nextTagOrExpression = remaining.indexOf('<', 1);
                    const nextJsExpression = remaining.indexOf('{');
                    let endIndex = remaining.length;
                    if (nextTagOrExpression !== -1 && (nextJsExpression === -1 || nextTagOrExpression < nextJsExpression)) {
                        endIndex = nextTagOrExpression;
                    } else if (nextJsExpression !== -1 && (nextTagOrExpression === -1 || nextJsExpression < nextTagOrExpression)) {
                        endIndex = nextJsExpression;
                    }
                    const textContent = remaining.substring(0, endIndex);
                    if (textContent.length > 0) {
                        processedChildren.push(`'${textContent.replace(/'/g, "\\'")}'`);
                    }
                    currentIndex += endIndex;
                }
            } else if (remaining.startsWith('{')) {
                // JavaScript expression
                const endOfExpression = remaining.indexOf('}');
                if (endOfExpression !== -1) {
                    const jsExpressionChild = remaining.substring(1, endOfExpression).trim();
                    processedChildren.push(jsExpressionChild);
                    currentIndex += endOfExpression + 1;
                } else {
                    // Malformed JS expression
                    processedChildren.push(`// Error: Malformed JavaScript expression, missing closing brace in: "${remaining}"`);
                    currentIndex = childrenContent.length;
                }
            } else {
                // Plain text content
                const nextTag = remaining.indexOf('<');
                const nextJsExpression = remaining.indexOf('{');
                let endIndex = remaining.length;

                if (nextTag !== -1 && (nextJsExpression === -1 || nextTag < nextJsExpression)) {
                    endIndex = nextTag;
                } else if (nextJsExpression !== -1 && (nextTag === -1 || nextJsExpression < nextTag)) {
                    endIndex = nextJsExpression;
                }
                const textContent = remaining.substring(0, endIndex);
                if (textContent.length > 0) {
                    processedChildren.push(`'${textContent.replace(/'/g, "\\'")}'`);
                }
                currentIndex += endIndex;
            }
        }
    }

    let childrenString = processedChildren.length > 0 ? processedChildren.join(', ') : 'null';

    if (isSelfClosing) {
        return `React.createElement('${tagName}', ${propsString})`;
    } else {
        return `React.createElement('${tagName}', ${propsString}, ${childrenString})`;
    }
} 