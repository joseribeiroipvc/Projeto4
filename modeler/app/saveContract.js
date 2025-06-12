const fs = require('fs');
const path = require('path');

function saveContract(code) {
    const contractPath = path.join(__dirname, '../../SmartContractHyperledger/contract.js');
    fs.writeFileSync(contractPath, code);
    return true;
} 