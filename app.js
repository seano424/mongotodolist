//jshint esversion:6

const express = require('express')
const bodyParser = require('body-parser')
const https = require('https')
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');


const app = express()
const port = 3000
const newListItems = ["Buy food", "Cook food", "Eat food"];
const workflow = []

mongoose.connect('mongodb://localhost:27017/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});


app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static("public"))

app.get('/', (req, res) => {

  const day = date.getDate()

  res.render('list', {kindOfDay: day, newListItems: newListItems});
});


app.post("/", function(req, res) {
  const newListItem = req.body.newListItem;
  newListItems.push(newListItem)
  res.redirect('/');
})


app.listen(port, function() {
  console.log(`Server Starts on ${port}`)
});
