import { runSuperfluousArgumentsAudit, runSelfTest } from './superfluousArgumentsAudit';
import fs from 'fs';
import path from 'path';

// SECURITY: Check for CWE-685 issues in our codebase
async function checkAppFiles() {
  console.log('🔍 Checking for Superfluous Trailing Arguments (CWE-685)...\n');
  
  // Run self-test first
  console.log('Running self-test...');
  runSelfTest();
  console.log('');
  
  const filesToCheck = [
    '../App.tsx',
    '../utils/advancedTextCleaner.ts',
    '../utils/textCleaner.ts',
    '../hooks/useSimpleAuth.ts'
  ];
  
  let totalIssues = 0;
  
  for (const file of filesToCheck) {
    try {
      const filePath = path.resolve(__dirname, file);
      const code = fs.readFileSync(filePath, 'utf8');
      
      const results = runSuperfluousArgumentsAudit(file, code);
      
      console.log(`📄 Checking ${file}:`);
      
      if (results.issues.length === 0) {
        console.log('  ✅ No superfluous argument issues found');
      } else {
        console.log(`  ⚠️  Found ${results.issues.length} potential issue(s):`);
        
        results.issues.forEach((issue, index) => {
          console.log(`    ${index + 1}. ${issue.functionName}:`);
          console.log(`       Expected: ${issue.expectedArity} args, Found: ${issue.actualArity} args`);
          console.log(`       Suggestion: ${issue.suggestion}`);
        });
        
        totalIssues += results.issues.length;
      }
      
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error reading ${file}: ${error}`);
      console.log('');
    }
  }
  
  console.log(`\n🔍 Summary: ${totalIssues} potential superfluous argument issue(s) found`);
  
  if (totalIssues === 0) {
    console.log('✅ All checked files appear to have correct function call signatures!');
  } else {
    console.log('⚠️  Review the issues above and fix any genuine problems.');
    console.log('   Note: Some findings may be false positives depending on context.');
  }
}

// Run the check if this file is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  if (require.main === module) {
    checkAppFiles().catch(console.error);
  }
}

export { checkAppFiles };