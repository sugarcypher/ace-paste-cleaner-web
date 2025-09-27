/**
 * SECURITY TEST SUITE: CWE-116/CWE-020 Double Escaping/Unescaping Prevention
 * 
 * This test suite validates that our HTML entity decoding is secure against
 * double escaping/unescaping vulnerabilities detected by CodeQL analysis.
 */

import { sanitizeTextAdvanced, PRESET_PROFILES } from './advancedTextCleaner';

interface SecurityTestCase {
  name: string;
  input: string;
  expected: string;
  description: string;
  cweReference: string;
}

/**
 * Test cases that would trigger CWE-116/CWE-020 warnings in vulnerable implementations
 */
const SECURITY_TEST_CASES: SecurityTestCase[] = [
  {
    name: "Basic Entity Decoding",
    input: "&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;",
    expected: "<script>alert(\"test\")</script>",
    description: "Basic HTML entity decoding should work correctly",
    cweReference: "CWE-116"
  },
  {
    name: "Double Encoded Entities",
    input: "&amp;lt;div&amp;gt;content&amp;lt;/div&amp;gt;",
    expected: "&lt;div&gt;content&lt;/div&gt;",
    description: "Double-encoded entities should decode only once, preventing double-unescaping",
    cweReference: "CWE-116"
  },
  {
    name: "Mixed Entity Types",
    input: "&amp;#39;Hello&amp;#39; &amp;quot;World&amp;quot;",
    expected: "&#39;Hello&#39; &quot;World&quot;",
    description: "Mixed entity types should decode safely without corruption",
    cweReference: "CWE-020"
  },
  {
    name: "Ampersand Last Processing",
    input: "&amp;amp;lt;test&amp;amp;gt;",
    expected: "&amp;lt;test&amp;amp;gt;",
    description: "Ampersand entities should be processed last to prevent double-decoding",
    cweReference: "CWE-116"
  },
  {
    name: "Complex Entity Chain",
    input: "&amp;lt;p&gt;Text with &amp;quot;quotes&amp;quot; and &amp;amp; symbols&lt;/p&gt;",
    expected: "&lt;p>Text with &quot;quotes&quot; and &amp; symbols</p>",
    description: "Complex chains of entities should decode correctly without corruption",
    cweReference: "CWE-116"
  },
  {
    name: "Malformed Entity Handling",
    input: "&amp;invalid; &amp;lt;valid&gt; &partial",
    expected: "&invalid; &lt;valid> &partial",
    description: "Malformed entities should be handled gracefully without breaking valid ones",
    cweReference: "CWE-020"
  }
];

/**
 * Run security tests for double escaping/unescaping vulnerabilities
 */
export function runSecurityTests(): { passed: number; failed: number; results: Array<{test: string; passed: boolean; error?: string}> } {
  const results = [];
  let passed = 0;
  let failed = 0;

  // Test with HTML markup stripping enabled
  const testProfile = {
    ...PRESET_PROFILES.EMOJI_SAFE,
    strip_markup: {
      html_xml: true,
      markdown: false,
      code_fences: false
    }
  };

  console.log("🔐 Running Security Tests for CWE-116/CWE-020...\n");

  for (const testCase of SECURITY_TEST_CASES) {
    try {
      // SECURITY: Test that our sanitizer prevents double escaping/unescaping
      const result = sanitizeTextAdvanced(testCase.input, testProfile);
      
      const testPassed = result === testCase.expected;
      
      if (testPassed) {
        passed++;
        console.log(`✅ ${testCase.name}: PASSED`);
        console.log(`   Input: "${testCase.input}"`);
        console.log(`   Output: "${result}"`);
        console.log(`   Reference: ${testCase.cweReference}\n`);
      } else {
        failed++;
        console.log(`❌ ${testCase.name}: FAILED`);
        console.log(`   Input: "${testCase.input}"`);
        console.log(`   Expected: "${testCase.expected}"`);
        console.log(`   Got: "${result}"`);
        console.log(`   Description: ${testCase.description}`);
        console.log(`   Reference: ${testCase.cweReference}\n`);
      }
      
      results.push({
        test: testCase.name,
        passed: testPassed,
        error: testPassed ? undefined : `Expected: "${testCase.expected}", Got: "${result}"`
      });
      
    } catch (error) {
      failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`❌ ${testCase.name}: ERROR - ${errorMsg}`);
      console.log(`   Reference: ${testCase.cweReference}\n`);
      
      results.push({
        test: testCase.name,
        passed: false,
        error: errorMsg
      });
    }
  }

  console.log(`\n🔐 Security Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log("✅ All security tests passed! The implementation is secure against CWE-116/CWE-020 vulnerabilities.");
  } else {
    console.log("⚠️  Some security tests failed. Review the implementation for potential vulnerabilities.");
  }

  return { passed, failed, results };
}

/**
 * Manual test runner for development
 */
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // Node.js environment - run tests if this file is executed directly
  if (require.main === module) {
    runSecurityTests();
  }
}