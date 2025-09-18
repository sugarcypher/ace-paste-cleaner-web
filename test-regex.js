const text = '### Test Header\n**Bold text**\n*Italic text*';
console.log('Original:', JSON.stringify(text));
console.log('');

// Test markdown header pattern
const headerPattern = /^\s{0,3}#{1,6}\s+/gmu;
const headerResult = text.replace(headerPattern, '');
console.log('After header removal:', JSON.stringify(headerResult));

// Test bold pattern
const boldPattern = /\*\*(.*?)\*\*/gmsu;
const boldResult = headerResult.replace(boldPattern, '$1');
console.log('After bold removal:', JSON.stringify(boldResult));

// Test italic pattern
const italicPattern = /(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/gmsu;
const italicResult = boldResult.replace(italicPattern, '$1');
console.log('After italic removal:', JSON.stringify(italicResult));
