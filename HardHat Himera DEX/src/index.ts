import express from 'express';
import { ethers } from 'ethers';
import 'dotenv/config';

const app = express();
const port = 3000;

// Configuración de la red de Goerli
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

// Dirección del contrato inteligente y ABI
const contractAddress = '0xYourContractAddress';
const contractABI = [
  // ABI del contrato inteligente
  "function someFunction() public view returns (uint256)",
  "event SomeEvent(uint256 indexed value)"
];

// Crear una instancia del contrato
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Endpoint para obtener datos del contrato
app.get('/contract-data', async (req, res) => {
  try {
    const data = await contract.someFunction(); // Reemplaza con la función del contrato que deseas llamar
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para obtener eventos del contrato
app.get('/contract-events', async (req, res) => {
  try {
    const filter = contract.filters.SomeEvent(); // Reemplaza con el evento del contrato que deseas filtrar
    const events = await contract.queryFilter(filter);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
