import express from "express";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/expense")
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
  });

const expenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
});

const Expenses = mongoose.model("Expenses", expenseSchema);

app.get("/api/expenses", async (req, res) => {
  try {
    const expenses = await Expenses.find();
    res.status(200).json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

app.get("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expenses.findOne({ id });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({ expense });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expense" });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const { title, amount } = req.body;
    const newExpense = new Expenses({
      id: uuidv4(),
      title,
      amount,
    });
    const savedExpense = await newExpense.save();
    res.status(201).json({ message: "Expense Created Successfully", savedExpense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create expense" });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount } = req.body;
    const updatedExpense = await Expenses.findOneAndUpdate(
      { id },
      { title, amount },
      { new: true }
    );
    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(updatedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update expense" });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Expenses.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
