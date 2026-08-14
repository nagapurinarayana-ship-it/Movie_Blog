import fs from 'node:fs';

const file = fs.readFileSync('assets/js/monetization.js', 'utf8');
const config = JSON.parse(fs.readFileSync('config/monetization.json', 'utf8'));

const required = [
  'pl30851769.effectivecpmnetwork.com/1c/c7/e4/1cc7e4e406db4b9476e0f28559c0b9a8.js',
  'pl30851772.effectivecpmnetwork.com/67/81/f1/6781f148df67e59df827d9028b51be69.js',
  'pl30851771.effectivecpmnetwork.com/a96924b820785181df59f6efdfa8719f/invoke.js',
  '63e6ab533495630055076eb684026b90',
  'b4b560626f94ccb0ffe06b2047f809ab',
  '85d1302867474481d7c488ca8f3bf6ce',
  'e2b5aeccaccd5399e3ca497e7d30b95b',
  '2d3550da16b1b6f1294563a97a9b21d9',
  '33768b1090012fa1b3cae3845bc9a074',
  'yjevb0bc?key=4f5ce136b4df6a95c4e824c66aaeb316'
];

for (const value of required) {
  if (!file.includes(value)) throw new Error(`Missing monetization identifier: ${value}`);
}

if (config.enabled !== true || config.provider !== 'effectivecpm') {
  throw new Error('Monetization config must be enabled with effectivecpm provider');
}

if (!file.includes("rel = 'sponsored noopener noreferrer'")) {
  throw new Error('Smartlink must use sponsored/noopener/noreferrer rel attributes');
}

if (!file.includes("new URL('/config/monetization.json', location.origin)")) {
  throw new Error('Monetization config must use an absolute root path');
}

console.log('Monetization audit passed: all 10 supplied ad units and safety checks verified.');
