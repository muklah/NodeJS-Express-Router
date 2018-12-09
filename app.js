/*
 * Express Example
 */

// Dependencies
const express = require('express');
const app = express();
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const hello =  require('./hello');
const usersRoutes = require('./routes/user');
const postsRoutes = require('./routes/post');
const mongoose = require('mongoose');

//  Starting MongoDB connection
mongoose.connect('mongodb://muklah:12345m@ds217671.mlab.com:17671/express', { useNewUrlParser: true });

//  To Check if the connection works fine or not
mongoose.connection.on('connected', () => {
  console.log('\x1b[36m%s\x1b[0m', 'mongo has been connected...');
});


// MiddleWare
app.use(express.json());
// Custom MiddleWare thats do nothing just to made the MiddleWare clear
app.use(hello);
// For serving images and other static data
app.use(express.static('public'));
// Custom MiddleWare
// app.use((req, res, next) => {
//   try {
//     let payload = jwt.verify(req.body.token, 'secret123');
//     res.send(payload);
//   } catch (err) {
//     res.status(400).send('invalid token');
//   }
//   res.send(v);
//   next();
// });

// Route MiddleWare for any route that start with (/api/user)
app.use('/api/user', usersRoutes);
app.use('/api/post', postsRoutes);

// Home Router
app.get('/', (req, res) => {
  const token = jwt.sign({"name":"Muklah", "age": 25}, 'key');
  res.send(token);
})

// Starting the server
app.listen(3000, () => {
  console.log('Running on port 3000');
});
