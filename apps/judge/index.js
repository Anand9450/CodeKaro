const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.post('/execute', (req, res) => {
  const { code, language } = req.body;
  // Simulate execution
  console.log(`Executing ${language} code`);
  res.json({ output: 'Execution Simulated: ' + code });
});

app.listen(PORT, () => {
  console.log(`Judge Service running on port ${PORT}`);
});
