const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // <- ADICIONADO

const app = express();
const PORT = 3000;

app.use(cors()); // <- ADICIONADO
app.use(bodyParser.json());

const contractDir = path.join(__dirname, 'SmartContractHyperledger');

app.post('/save-contract', (req, res) => {
  const { filename, code } = req.body;

  if (!filename || !code) {
    return res.status(400).send('Faltam dados: filename ou code.');
  }

  const contractPath = path.join(contractDir, `${filename}.js`);

  fs.writeFile(contractPath, code, (err) => {
    if (err) {
      console.error('Erro ao guardar o contrato:', err);
      return res.status(500).send('Erro ao guardar contrato.');
    }
    console.log('Contrato recebido e guardado como ${contractPath}');
    res.send('Contrato guardado com sucesso!');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});