const express = require('express');

const app = express()
const axios = require('axios');
const cors = require('cors')

require('dotenv').config()
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


app.post("/create-transaction", async (req, res) => {
    try {

        console.log(req.body)
        const { cpf, name, email, phone } = req.body;
        const url = "https://api2.anubispay.com.br/v1/payment-transaction/create"
        const auth = "Basic " + Buffer.from(`${process.env.API_PUBLIC_KEY}:${process.env.API_SECRET_KEY}`).toString("base64")
        const cleanCpf = cpf.replace(/\D/g, '');


        const data = {
            payment_method: "pix",
            customer: {
                document: {
                    type: "cpf",
                    number: cleanCpf
                },
                name: name,
                email,
                phone
            },
            items: [
                {
                    title: "carteirinha-cne",
                    unit_price: 29,
                    quantity: 1
                }
            ],
            amount: 5800,
            metadata: {
                provider_name: "owner"
            },
            postback_url: "https://webhook.com",
            pix: {
                expires_in_days: 1
            }
        }
        const response = await axios.post(url, data, {
            headers: {
                Authorization: auth,
                'Content-Type': 'application/json'
            }
        })
        res.json(response.data)
        console.log(response.data)
    } catch (error) {
        console.error('Erro na requisição:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erro na requisição' });
    }
})

app.get('/transaction/:id', async (req, res) => {

    try {
        const { id } = req.params
        const url = "https://api2.anubispay.com.br/v1/payment-transaction/info"
        const auth = "Basic " + Buffer.from(`${process.env.API_PUBLIC_KEY}:${process.env.API_SECRET_KEY}`).toString("base64")

        const response = await axios.get(`${url}/${id}`,{
            headers:{
                Authorization:auth,
                'Content-Type':'application/json'
            }
        })


        res.status(200).json(response.data.data)
    } catch (error) {
        console.error('Erro na requisição:', error.response?.data || error.message);
        res.status(500).json({ error: 'Erro na requisição' });
    }
})

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Servido rodando na porta ${PORT}`);
})