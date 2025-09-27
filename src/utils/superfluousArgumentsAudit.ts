/**
 * SECURITY AUDIT: CWE-685 Superfluous Trailing Arguments Detection
 * 
 * This module provides utilities to detect and fix superfluous trailing arguments
 * that could indicate bugs or misunderstanding of function signatures.
 */

/**
 * Common JavaScript functions and their expected arity (number of parameters)
 */
const FUNCTION_ARITY_MAP: Record<string, number> = {
  // String methods
  'replace': 2,           // str.replace(searchValue, replaceValue)
  'substring': 2,         // str.substring(start, end)
  'substr': 2,            // str.substr(start, length)
  'slice': 2,             // str.slice(start, end)
  'split': 2,             // str.split(separator, limit)
  'indexOf': 2,           // str.indexOf(searchValue, fromIndex)
  'lastIndexOf': 2,       // str.lastIndexOf(searchValue, fromIndex)
  'charAt': 1,            // str.charAt(index)
  'charCodeAt': 1,        // str.charCodeAt(index)
  'normalize': 1,         // str.normalize(form)
  
  // Array methods
  'push': Infinity,       // arr.push(...elements) - variable arity
  'unshift': Infinity,    // arr.unshift(...elements) - variable arity
  'splice': Infinity,     // arr.splice(start, deleteCount, ...items) - variable arity
  'join': 1,              // arr.join(separator)
  'sort': 1,              // arr.sort(compareFn)
  'reverse': 0,           // arr.reverse()
  'pop': 0,               // arr.pop()
  'shift': 0,             // arr.shift()
  
  // Math functions
  'Math.max': Infinity,   // Math.max(...values) - variable arity
  'Math.min': Infinity,   // Math.min(...values) - variable arity
  'Math.round': 1,        // Math.round(x)
  'Math.floor': 1,        // Math.floor(x)
  'Math.ceil': 1,         // Math.ceil(x)
  'Math.abs': 1,          // Math.abs(x)
  'Math.pow': 2,          // Math.pow(base, exponent)
  
  // Global functions
  'parseInt': 2,          // parseInt(string, radix)
  'parseFloat': 1,        // parseFloat(string)
  'isNaN': 1,             // isNaN(value)
  'isFinite': 1,          // isFinite(value)
  'encodeURIComponent': 1, // encodeURIComponent(uriComponent)
  'decodeURIComponent': 1, // decodeURIComponent(encodedURI)
  
  // Browser APIs
  'setTimeout': 2,        // setTimeout(function, delay, ...args) - but commonly used with 2
  'setInterval': 2,       // setInterval(function, delay, ...args) - but commonly used with 2
  'alert': 1,             // alert(message)
  'confirm': 1,           // confirm(message)
  'prompt': 2,            // prompt(message, defaultText)
  
  // Console methods
  'console.log': Infinity,    // console.log(...data) - variable arity
  'console.error': Infinity,  // console.error(...data) - variable arity
  'console.warn': Infinity,   // console.warn(...data) - variable arity
  'console.info': Infinity,   // console.info(...data) - variable arity
  'console.debug': Infinity,  // console.debug(...data) - variable arity
  
  // JSON methods
  'JSON.parse': 2,        // JSON.parse(text, reviver)
  'JSON.stringify': 3,    // JSON.stringify(value, replacer, space)
  
  // DOM methods
  'addEventListener': 3,  // element.addEventListener(type, listener, options)
  'removeEventListener': 3, // element.removeEventListener(type, listener, options)
  'setAttribute': 2,      // element.setAttribute(name, value)
  'getAttribute': 1,      // element.getAttribute(name)
  'removeAttribute': 1,   // element.removeAttribute(name)
  'createElement': 1,     // document.createElement(tagName)
  'getElementById': 1,    // document.getElementById(id)
  'querySelector': 1,     // element.querySelector(selectors)
  'querySelectorAll': 1,  // element.querySelectorAll(selectors)
};

/**
 * Interface for reporting superfluous argument issues
 */
interface SuperfluousArgumentIssue {
  functionName: string;
  expectedArity: number;
  actualArity: number;
  line?: number;
  column?: number;
  suggestion: string;
}

/**
 * SECURITY: Check for common patterns that might have superfluous arguments
 */
export function auditFunctionCalls(code: string): SuperfluousArgumentIssue[] {
  const issues: SuperfluousArgumentIssue[] = [];
  
  // Pattern to match function calls with arguments
  // This is a simplified regex - real CodeQL analysis would be more sophisticated
  const functionCallPattern = /(\w+(?:\.\w+)*)\s*\(\s*([^)]*)\s*\)/g;
  
  let match;
  while ((match = functionCallPattern.exec(code)) !== null) {
    const functionName = match[1];
    const argsString = match[2].trim();
    
    if (!argsString) continue; // No arguments
    
    // Count actual arguments (simplified - doesn't handle nested function calls perfectly)
    const actualArgs = argsString.split(',').filter(arg => arg.trim().length > 0);
    const actualArity = actualArgs.length;
    
    const expectedArity = FUNCTION_ARITY_MAP[functionName];
    
    if (expectedArity !== undefined && expectedArity !== Infinity && actualArity > expectedArity) {
      issues.push({
        functionName,
        expectedArity,
        actualArity,
        suggestion: `Function '${functionName}' expects ${expectedArity} argument(s) but received ${actualArity}. Consider removing ${actualArity - expectedArity} trailing argument(s).`
      });
    }
  }
  
  return issues;
}

/**
 * SECURITY: Specific checks for known problematic patterns
 */
export function checkCommonMistakes(code: string): SuperfluousArgumentIssue[] {
  const issues: SuperfluousArgumentIssue[] = [];
  
  // Check for parseInt with more than 2 arguments
  const parseIntPattern = /parseInt\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)/g;
  let match = parseIntPattern.exec(code);
  if (match) {
    issues.push({
      functionName: 'parseInt',
      expectedArity: 2,
      actualArity: 3,
      suggestion: 'parseInt() takes at most 2 arguments (string, radix). The third argument is ignored.'
    });
  }
  
  // Check for alert with multiple arguments
  const alertPattern = /alert\s*\(\s*[^,]+,\s*[^)]+\)/g;
  if (alertPattern.test(code)) {
    issues.push({
      functionName: 'alert',
      expectedArity: 1,
      actualArity: 2, // At least 2
      suggestion: 'alert() only displays the first argument. Additional arguments are ignored.'
    });
  }
  
  // Check for Math.round, Math.floor, Math.ceil with multiple arguments
  const mathSingleArgPattern = /Math\.(round|floor|ceil)\s*\(\s*[^,]+,\s*[^)]+\)/g;
  while ((match = mathSingleArgPattern.exec(code)) !== null) {
    const methodName = match[1];
    issues.push({
      functionName: `Math.${methodName}`,
      expectedArity: 1,
      actualArity: 2, // At least 2
      suggestion: `Math.${methodName}() takes only 1 argument. Additional arguments are ignored.`
    });
  }
  
  return issues;
}

/**
 * SECURITY: Run comprehensive audit for CWE-685 issues
 */
export function runSuperfluousArgumentsAudit(filePath: string, code: string): {
  filePath: string;
  issues: SuperfluousArgumentIssue[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    suggestions: string[];
  };
} {
  const generalIssues = auditFunctionCalls(code);
  const commonMistakes = checkCommonMistakes(code);
  
  const allIssues = [...generalIssues, ...commonMistakes];
  
  // Categorize issues by severity
  const criticalIssues = allIssues.filter(issue => 
    ['parseInt', 'alert', 'setTimeout', 'setInterval'].includes(issue.functionName)
  );
  
  const suggestions = allIssues.map(issue => 
    `${issue.functionName}: ${issue.suggestion}`
  );
  
  return {
    filePath,
    issues: allIssues,
    summary: {
      totalIssues: allIssues.length,
      criticalIssues: criticalIssues.length,
      suggestions: [...new Set(suggestions)] // Remove duplicates
    }
  };
}

/**
 * Example usage and self-test
 */
export function runSelfTest(): boolean {
  // Test cases that should trigger warnings
  const testCode = `
    // These should trigger warnings:
    parseInt("123", 10, "extra");        // 3 args, expects 2
    alert("message", "extra");           // 2 args, expects 1
    Math.round(3.14, "extra");          // 2 args, expects 1
    
    // These should NOT trigger warnings:
    console.log("a", "b", "c");         // Variable arity
    setTimeout(func, 1000);             // 2 args, expects 2
    str.replace("old", "new");          // 2 args, expects 2
  `;
  
  const results = runSuperfluousArgumentsAudit('test.js', testCode);
  
  // Should find at least 3 issues
  const expectedIssues = 3;
  const actualIssues = results.issues.length;
  
  console.log(`🔍 Superfluous Arguments Audit Self-Test:`);
  console.log(`   Expected issues: ${expectedIssues}`);
  console.log(`   Found issues: ${actualIssues}`);
  
  if (actualIssues >= expectedIssues) {
    console.log(`✅ Self-test passed!`);
    return true;
  } else {
    console.log(`❌ Self-test failed - not detecting enough issues`);
    return false;
  }
}

// Example function to fix common issues
export const SUPERFLUOUS_ARGS_FIXES = {
  'parseInt with 3+ args': 'Use parseInt(string, radix) - remove extra arguments',
  'alert with 2+ args': 'Use alert(message) - only first argument is shown',
  'Math.round with 2+ args': 'Use Math.round(number) - extra arguments ignored',
  'Math.floor with 2+ args': 'Use Math.floor(number) - extra arguments ignored', 
  'Math.ceil with 2+ args': 'Use Math.ceil(number) - extra arguments ignored',
  'setTimeout excess args': 'Use setTimeout(func, delay) or setTimeout(func, delay, ...args)',
  'setInterval excess args': 'Use setInterval(func, delay) or setInterval(func, delay, ...args)'
} as const;