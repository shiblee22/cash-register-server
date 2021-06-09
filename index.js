const express = require('express');
const app = express();
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdusz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const transactionsCollection = client.db(`${process.env.DB_NAME}`).collection("transactions");
    const finalAmountCollection = client.db(`${process.env.DB_NAME}`).collection("finalAmount");
    console.log('connection err', err)

    app.get('/', (req, res) => {
        res.send('Server Running');
    });

    app.get('/finalAmount', (req, res) => {
        finalAmountCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.get('/transactions', (req, res) => {
        transactionsCollection.find()
            .toArray((err, items) => {
                res.send(items)
            })
    })

    app.post('/addTransaction', (req, res) => {
        const newTransaction = req.body;
        transactionsCollection.insertOne(newTransaction)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.post('/updateFinalAmount', (req, res) => {
        const {time, date, finalAmount, name} = req.body;
        finalAmountCollection.updateOne({name},{ $set:{ time, date, finalAmount }})
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
});

app.listen(process.env.PORT || '3001');