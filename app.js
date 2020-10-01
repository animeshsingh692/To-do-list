const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const port = process.env.PORT || 3000;

const app = express();

// var listItems = ["Java Script", "Python", "Data Structures"];
// var workItems = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("Public"));

mongoose.connect("mongodb+srv://admin-Animesh:Shivaay@0100@cluster0.js6uh.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
	name: String
});

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({
	name: "Welcome to to-do-list"
});

const item2 = new Item({
	name: "Click + to add items"
});

const item3 = new Item({
	name: "Click - to delete items"
});

const defaultItems = [item1, item2, item3];

const listsSchema = new mongoose.Schema({
	name: String,
	items: [itemsSchema]
});

const List = mongoose.model("List", listsSchema);

app.get("/", function(req, res){
	//var day = date.getDate();
	Item.find({}, function(err, foundItems){
		if (foundItems.length === 0) {
			Item.insertMany(defaultItems, function(err){
				if (err) {
					console.log(err);
				} else {
					console.log("Succeded");
				}
			});
			res.redirect("/");

		} else {
			res.render("list", {listTitle: "Today", newItems: foundItems});
		}
		
	});
	
});

app.post("/", function(req, res){
	var listItem = req.body.listItem;
	var listTitle = req.body.list;
	const itemNew = new Item({
		name: listItem
	});
	if (listTitle === "Today") {
		itemNew.save();
		res.redirect("/");
	} else {
		List.findOne({name: listTitle}, function(err, foundList){
			foundList.items.push(itemNew);
			foundList.save();
			res.redirect("/" + listTitle);
		});
	}
	
});

app.post("/delete", function(req, res){
	//var checkedItem = req.body.checkboxItem;
	// Item.deleteOne({_id: checkedItem}, function(err){
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		console.log("Deleted");
	// 	}
	// });
	var minusItem = req.body.deleteIt;
	var delListTitle = req.body.list;

	if (delListTitle === "Today") {
		Item.deleteOne({_id: minusItem}, function(err){
		// or Item.findByIdAndRemove(minusItem, function(err)){
			if (err) {
				console.log(err);
			} else {
				console.log("Deleted");
			}
			res.redirect("/");
		});
		
	} else {
		List.findOneAndUpdate({name: delListTitle}, {$pull: {items: {_id: minusItem}}}, function(err, foundList){
			if (!err) {
				res.redirect("/" + delListTitle);
			}
		});
	}
	
});

app.get("/:topic", function(req, res){
	var customList = _.capitalize(req.params.topic);
	// Check for an existing List
	List.findOne({name: customList}, function(err, foundList){
		if (!err) {
			
			if (!foundList) {
				// Create a new list
				const list = new List({
					name: customList,
					items: defaultItems
				});
				list.save();
				res.redirect("/" + customList);
			} else {
				//Show the existing list
				res.render("list", {listTitle: foundList.name, newItems: foundList.items});
			}
		}
	});

});

app.listen(port, function(){
	console.log("server is running on port: " +port);
});