const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.k9pcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const db = client.db('taskly')
    const tasksCollection = db.collection('tasks')

    // ! CRUD Routes for Tasks

    // Create a Task
    app.post('/tasks', async (req, res) => {
      try {
        const task = req.body;
        const result = await tasksCollection.insertOne(task)
        res.status(200).json(result)
      } catch (err) {
        res.status(500).json({error: "Failed to create Task"})
      }
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Management sever is running");
});

app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
