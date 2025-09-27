/**
 * SECURITY AUDIT: CWE-563 Useless Assignment to Local Variable Detection
 * 
 * This module provides utilities to detect and fix useless assignments
 * that have no effect - either never read or always overwritten.
 */

/**
 * Interface for reporting useless assignment issues
 */
interface UselessAssignmentIssue {
  variableName: string;
  assignedValue: string;
  line?: number;
  type: 'never-read' | 'always-overwritten' | 'unreachable-condition';
  description: string;
  suggestion: string;
}

/**
 * SECURITY: Check for variables assigned constant values that make conditions unreachable
 */
export function detectUnreachableConditions(code: string): UselessAssignmentIssue[] {
  const issues: UselessAssignmentIssue[] = [];
  
  // Pattern 1: const var = true; followed by !var conditions
  const trueThenNotPattern = /const\s+(\w+)\s*=\s*true\s*;[\s\S]*?!\s*\1\s*&&/g;
  let match;
  
  while ((match = trueThenNotPattern.exec(code)) !== null) {
    const variableName = match[1];
    issues.push({
      variableName,
      assignedValue: 'true',
      type: 'unreachable-condition',
      description: `Variable '${variableName}' is assigned 'true' but later used in '!${variableName}' condition which is never true`,
      suggestion: `Remove the assignment or the unreachable conditional block. If the condition should sometimes be false, use proper state management.`
    });
  }
  
  // Pattern 2: const var = false; followed by var && conditions
  const falseThenAndPattern = /const\s+(\w+)\s*=\s*false\s*;[\s\S]*?\1\s*&&/g;
  while ((match = falseThenAndPattern.exec(code)) !== null) {
    const variableName = match[1];
    issues.push({
      variableName,
      assignedValue: 'false',
      type: 'unreachable-condition',
      description: `Variable '${variableName}' is assigned 'false' but later used in '${variableName} &&' condition which is never true`,
      suggestion: `Remove the assignment or the unreachable conditional block. If the condition should sometimes be true, use proper state management.`
    });
  }
  
  // Pattern 3: Variables assigned but immediately reassigned
  const immediateReassignPattern = /(let|const)\s+(\w+)\s*=\s*([^;]+);\s*\n\s*\2\s*=\s*([^;]+);/g;
  while ((match = immediateReassignPattern.exec(code)) !== null) {
    const variableName = match[2];
    const firstValue = match[3];
    const secondValue = match[4];
    
    if (match[1] === 'const') {
      // const variables can't be reassigned - this would be a compilation error
      continue;
    }
    
    issues.push({
      variableName,
      assignedValue: firstValue,
      type: 'always-overwritten',
      description: `Variable '${variableName}' is assigned '${firstValue}' but immediately overwritten with '${secondValue}'`,
      suggestion: `Remove the first assignment and initialize with the final value directly.`
    });
  }
  
  return issues;
}

/**
 * SECURITY: Check for variables declared but never used
 */
export function detectNeverReadVariables(code: string): UselessAssignmentIssue[] {
  const issues: UselessAssignmentIssue[] = [];
  
  // Simple pattern for variables that are declared but not referenced later
  // This is a basic implementation - real static analysis would be more sophisticated
  const declarationPattern = /(?:let|const)\s+(\w+)\s*=\s*([^;]+);/g;
  let match;
  
  while ((match = declarationPattern.exec(code)) !== null) {
    const variableName = match[1];
    const assignedValue = match[2];
    
    // Check if variable is used after declaration (excluding the declaration itself)
    const afterDeclaration = code.substring(match.index + match[0].length);
    const usagePattern = new RegExp(`\\b${variableName}\\b`, 'g');
    
    if (!usagePattern.test(afterDeclaration)) {
      issues.push({
        variableName,
        assignedValue,
        type: 'never-read',
        description: `Variable '${variableName}' is assigned '${assignedValue}' but never used`,
        suggestion: `Remove the unused variable declaration.`
      });
    }
  }
  
  return issues;
}

/**
 * SECURITY: Check for specific problematic patterns found in the codebase
 */
export function detectKnownPatterns(code: string): UselessAssignmentIssue[] {
  const issues: UselessAssignmentIssue[] = [];
  
  // Pattern found in our codebase: hasAcceptedTerms = true with !hasAcceptedTerms condition
  if (code.includes('hasAcceptedTerms = true') && code.includes('!hasAcceptedTerms')) {
    issues.push({
      variableName: 'hasAcceptedTerms',
      assignedValue: 'true',
      type: 'unreachable-condition',
      description: 'hasAcceptedTerms is always true, making !hasAcceptedTerms condition unreachable',
      suggestion: 'Either remove the unreachable conditional block or implement proper state management for terms acceptance.'
    });
  }
  
  // Pattern: Variables assigned null/undefined but never checked
  const nullAssignPattern = /(let|const)\s+(\w+)\s*=\s*(null|undefined)\s*;/g;
  let match;
  
  while ((match = nullAssignPattern.exec(code)) !== null) {
    const variableName = match[2];
    const assignedValue = match[3];
    
    // Check if variable is ever used in conditions
    const conditionPattern = new RegExp(`\\b${variableName}\\s*[!=]=|if\\s*\\(\\s*${variableName}\\b|${variableName}\\s*\\?`, 'g');
    
    if (!conditionPattern.test(code)) {
      issues.push({
        variableName,
        assignedValue,
        type: 'never-read',
        description: `Variable '${variableName}' is assigned '${assignedValue}' but never used in conditions`,
        suggestion: `Consider removing the unused ${assignedValue} assignment or add proper null checking.`
      });
    }
  }
  
  return issues;
}

/**
 * SECURITY: Run comprehensive audit for CWE-563 issues
 */
export function runUselessAssignmentAudit(filePath: string, code: string): {
  filePath: string;
  issues: UselessAssignmentIssue[];
  summary: {
    totalIssues: number;
    unreachableConditions: number;
    neverReadVariables: number;
    alwaysOverwritten: number;
    suggestions: string[];
  };
} {
  const unreachableIssues = detectUnreachableConditions(code);
  const neverReadIssues = detectNeverReadVariables(code);
  const knownPatternIssues = detectKnownPatterns(code);
  
  const allIssues = [...unreachableIssues, ...neverReadIssues, ...knownPatternIssues];
  
  // Remove duplicates based on variable name and type
  const uniqueIssues = allIssues.filter((issue, index, array) => 
    array.findIndex(i => i.variableName === issue.variableName && i.type === issue.type) === index
  );
  
  const suggestions = uniqueIssues.map(issue => 
    `${issue.variableName} (${issue.type}): ${issue.suggestion}`
  );
  
  return {
    filePath,
    issues: uniqueIssues,
    summary: {
      totalIssues: uniqueIssues.length,
      unreachableConditions: uniqueIssues.filter(i => i.type === 'unreachable-condition').length,
      neverReadVariables: uniqueIssues.filter(i => i.type === 'never-read').length,
      alwaysOverwritten: uniqueIssues.filter(i => i.type === 'always-overwritten').length,
      suggestions: suggestions
    }
  };
}

/**
 * Example usage and self-test
 */
export function runSelfTest(): boolean {
  // Test case that should trigger warnings
  const testCode = `
    const hasAcceptedTerms = true; // Should detect this
    let unusedVar = "never used"; // Should detect this
    let overwritten = "first";     // Should detect this
    overwritten = "second";
    
    if (!hasAcceptedTerms) {       // Unreachable due to line 2
      console.log("Never runs");
    }
    
    // These should NOT trigger warnings:
    const used = "hello";
    console.log(used);
    
    let properly = "initial";
    if (condition) {
      properly = "updated";  // This is conditional, not always overwritten
    }
  `;
  
  const results = runUselessAssignmentAudit('test.js', testCode);
  
  // Should find at least 2 issues (hasAcceptedTerms + unusedVar)
  const expectedMinIssues = 2;
  const actualIssues = results.issues.length;
  
  console.log(`🔍 Useless Assignment Audit Self-Test:`);
  console.log(`   Expected min issues: ${expectedMinIssues}`);
  console.log(`   Found issues: ${actualIssues}`);
  
  results.issues.forEach((issue, index) => {
    console.log(`   ${index + 1}. ${issue.variableName}: ${issue.description}`);
  });
  
  if (actualIssues >= expectedMinIssues) {
    console.log(`✅ Self-test passed!`);
    return true;
  } else {
    console.log(`❌ Self-test failed - not detecting enough issues`);
    return false;
  }
}

// Example fixes for common issues
export const USELESS_ASSIGNMENT_FIXES = {
  'always-true-condition': 'Remove the variable or implement proper state management',
  'always-false-condition': 'Remove the variable or implement proper state management', 
  'never-read-variable': 'Remove the unused variable declaration',
  'immediately-overwritten': 'Initialize with the final value directly',
  'null-never-checked': 'Add proper null checking or remove the null assignment'
} as const;