const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ekjpc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('carAtlas');
        const productCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewCollection = database.collection('review');
        const usersCollection = database.collection('users');

        // Get Products API
        app.get('/products', async (req, res) => {
            const result = await productCollection.find({}).toArray();
            res.send(result);
        })

        // Single Product
        app.get("/singleProduct/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await productCollection.find({ _id: ObjectId(req.params.id) }).toArray();
            res.send(result[0])
            // console.log(result);
        })

        // delete a product
        app.delete('/deleteProduct/:id', async (req, res) => {
            const result = await productCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.send(result);
            console.log(result);
        })

        // insert order
        app.post("/addOrders", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);
        })

        // get order
        app.get('/myOrders/:email', async (req, res) => {
            // console.log(req.params.email);
            const result = await ordersCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        })

        // manage all order
        app.get('/orders', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            console.log(result);
            res.send(result);
        })

        // delete order
        app.delete('/deleteOrder/:id', async (req, res) => {
            const result = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.send(result);
        })

        // post register user
        app.post('/users', async (req, res) => {
            const result = await usersCollection.insertOne(req.body);
            console.log(result);
            res.send(result)
        })

        // put google sign in user 
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: user };
            const options = { upsert: true };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // get admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.send({ admin: isAdmin })
        })

        // add review 
        app.post("/addReview", async (req, res) => {
            const result = await reviewCollection.insertOne(req.body);
            res.send(result);
        })

        // get review
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            console.log(result);
            res.send(result);
        })

        // add product
        app.post("/addProduct", async (req, res) => {
            const result = await productCollection.insertOne(req.body);
            res.send(result);
        })

        // status update
        app.put('/statusUpdate/:id', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            const result = await ordersCollection.updateOne(filter, {
                $set: {
                    status: req.body.status,
                },
            });
            res.send(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from Car Atlas!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})