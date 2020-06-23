//jshint esversion:6

const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const mongoose = require('mongoose');
const _ = require('lodash');

const Schema = mongoose.Schema;


const app = express()
const port = 3000
const workflow = []

mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"))

//Creating Item Schema
const itemSchema = new Schema({
  name: String
})
//Creating our Item model
const Item = mongoose.model('Item', itemSchema)

//Creating 3 Default items
const item1 = new Item({
  name: "Welcome to your todolist"
})
const item2 = new Item({
  name: "Hit the + button to add a new item"
})
const item3 = new Item({
  name: "<--- Hit this to delete an item"
})
//Make the array to hold the items
const defaultItems = [item1, item2, item3]

//New Schema for New Routes
const listSchema = new Schema({
  name: String,
  items: [itemSchema]
})
//Creating List Model
const List = mongoose.model('List', listSchema)


app.get('/', (req, res) => {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      //Insert the items from the array into the data
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Default items inserted into data");
        }
      })
      res.redirect('/');
    } else {
      res.render('list', {listTitle: "Today", newListItems: foundItems});
    }
  })
});


app.get('/:newRoute', function(req, res) {
  const customListName = _.capitalize(req.params.newRoute)
  List.findOne({name: customListName}, function(err, results) {
    if (!err) {
      if (!results) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save()
        res.redirect('/' + customListName);
      } else {
        res.render('list', {listTitle: results.name, newListItems: results.items})
      }
    } else {
      console.log(err);
    }
  })
})

app.post("/", function(req, res) {
  const itemName = req.body.newListItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })
  if (listName === 'Today') {
    item.save()
    res.redirect('/');
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item)
      foundList.save()
      res.redirect('/' + listName)
    })
  }
})

app.post('/delete', function(req, res) {
  const checkedItemId = req.body.checkbox
  const listName = req.body.listName

  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('successfully removed item');
        res.redirect('/');
      }
    })
  } else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
        if (!err) {
          res.redirect('/' + listName);
        }
      });
  }
})
// 
// app.listen(port, function() {
//   console.log(`Server Starts on ${port}`)
// });

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
