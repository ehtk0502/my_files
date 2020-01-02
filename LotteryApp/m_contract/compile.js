const path = require('path');
const fs= require('fs');
const solc = require('solc');

const srcPath =  path.resolve(__dirname, 'm_test.sol');
const source = fs.readFileSync(srcPath, 'utf8');

//module.exports = solc.compile(source, 1).contracts[':Funds'];
console.log(solc.compile(source, 1));
