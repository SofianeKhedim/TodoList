
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import lodash from "lodash";

// const express = require("express");
// const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
// const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');

const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Buy Food",
});
const item2 = new Item({
  name: "Cook Food",
});
const item3 = new Item({
  name: "Eat Food",
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", async (req, res) => {

  const foundItems = await Item.find({}, 'name');
  if (foundItems.length === 0) {
    await Item.insertMany(defaultItems);
  }
  const day = "Today";
  res.render("list", { listTitle: day, newListItems: foundItems });
});

app.get("/:customListName", async (req, res) => {
  const customListName = lodash.capitalize(req.params.customListName);
  const foundList = await List.findOne({ name: customListName });
  if (!foundList) {
    const list = new List({
      name: customListName,
      items: defaultItems
    });

    list.save();
    res.redirect("/" + customListName);
    console.log("created : " + customListName);
  } else {
    res.render("list", { listTitle: customListName, newListItems: foundList.items });
  }

})

app.post("/", async (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    const list = await List.findOne({ name: listName });
    list.items.push(item);
    list.save();
    res.redirect("/" + listName);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    await Item.findByIdAndRemove(id);
    res.redirect("/");
  } else {
    await List.findOneAndUpdate({ name: listName },{$pull: {items : {_id:id}}});
    res.redirect("/" + listName);
  }
});


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
