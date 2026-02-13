const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config()

const app = express();

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
};

app.use(cors(corsOptions));
app.use(express.json());

// Rota de teste
app.get('/dummie', (req, res) => {
  return res.json({ name: "dummie dummie dummie" });
});

// Rota principal
app.post('/create-transaction', async (req, res) => {
  try {
    const { name, email, cpf, phone, amount, address } = req.body;

    console.log(req.body)



    const url = process.env.URL;
    const publicKey = process.env.PUBLIC_KEY;
    const secretKey = process.env.SECRET_KEY;
    const auth = 'Basic ' + Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
    const cleanCpf = cpf.replace(/\D/g, '');

    const response = await axios.post(url, {
      amount,
      currency: 'BRL',
      paymentMethod: 'pix',
      shipping: {
        fee: 0,
        address: address
      },
      customer: {
        name: name,
        email: email,
        document: { type: 'cpf', number: cleanCpf }
      },
      items: [{
        title: 'Carteira DNE',
        unitPrice: amount,
        quantity: 1,
        tangible: false
      }]
    }, {
      headers: {
        accept: 'application/json',
        authorization: auth,
        'content-type': 'application/json'
      }
    });
    console.log()

    const qrCode = response.data.pix.qrcode;
    const id = response.data.id;

    res.json({ id: id, qrcode: qrCode });

  } catch (error) {
    console.error('Erro na requisição:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro na requisição' });
  }
});

app.get('/transaction/:id', async (req, res) => {
  const id = req.params.id;
  const publicKey = process.env.PUBLIC_KEY;
  const secretKey = process.env.SECRET_KEY;
  const auth = 'Basic ' + Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
  try {
    const response = await axios.get(`${process.env.URL}/${id}`, {
      headers: {
        accept: 'application/json',
        authorization: auth
      }
    });

    const status = response.data.status; // ou response.status dependendo da API
    res.json({ status: status });

  } catch (error) {
    // console.error('Erro ao buscar transação:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao buscar transação' });
  }
});

const port = 8080
app.listen(port, () => {
  console.log('server is running')
})
