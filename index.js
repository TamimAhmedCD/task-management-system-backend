const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
    // await client.connect();

    const tasksCollection = client.db("tasklyDB").collection("tasks");

    // ! CRUD Routes for Tasks

    // Create a Task
    app.post("/tasks", async (req, res) => {
      try {
        const task = req.body;
        const result = await tasksCollection.insertOne(task);
        res.status(200).send(result);
      } catch (err) {
        res
          .status(500)
          .send({ error: "Failed to create Task", details: err.message });
      }
    });

    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      try {
        const tasks = await tasksCollection.find(query).toArray();

        // Function to format category title as a key (e.g., "To Do" -> "to-do")
        const formatCategoryKey = (category) =>
          category.toLowerCase().replace(/\s+/g, "-");

        // Group tasks by formatted category key
        const groupedTasks = tasks.reduce((acc, task) => {
          const category = task.category || "Uncategorized"; // Default category if missing
          const key = formatCategoryKey(category); // Convert category to key format

          if (!acc[key]) {
            acc[key] = []; // Initialize array if category key doesn't exist
          }
          acc[key].push(task);
          return acc;
        }, {});

        res.status(200).json(groupedTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).json({ error: "Failed to fetch tasks" });
      }
    });

    // Update a Task
    app.put("/tasks/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updatedTask = req.body;
        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedTask }
        );
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to update task" });
      }
    });

    app.delete("/tasks/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to delete task" });
      }
    });

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
