/*
 * This file handel all /api/user Routes
 *
 */

// Dependencies
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/*
 *  @TODO you can use below to create a more complex Queries
 *  eq  Equal
 *  ne  Eot Equal
 *  gt  Greater Than
 *  gte Greater Than or Equal
 *  ls  Less Than
 *  lte Less Than or Equal
 *  in  Contain
 *  nin Not in
 *  //  Example:
 *  .find({ age: { $gte: 18, $lt: 40 } })  Means that the age should be >= 18 AND less than 40
 *  .find({ age: { $in: [18, 19, 20] } })  Means that the age should equal one of the array items
 *  // Adding OR operator
 *  Keep the find() emplty just like that then write your or operator, just like below
 *  .find().or([ { age: { $gte: 18 } }, { name: 'Hamdon' } ])
 *  //
 *
 *  @TODO
 *  You Can Set a Pagination Like This:
 *
 *  const pageNumber = 1;
 *  const pageSize = 10;
 *  .skip((pageNumber - 1) * pageSize)
 *
 *
 */

// Dummy Data just for testing
let users = [
  { 'id': 1, 'name': 'Muklah', 'cool': false },
  { 'id': 2, 'name': 'Layan', 'cool': true },
];

// Getting all users
router.get('/all', (req, res) => {
  User.find()
    .then(result => {
      res.send(result);
    }).catch(err => {
      res.status(400).send(err)
    })
})

// Getting spesific users
router.get('/', (req, res) => {
  User.find()
    .or([{ name: req.body.name }, { age: req.body.age }]) // This is means WHERE NAME == Hamdon && AGE == 24
    .limit(10)  //  This for setting a limit to the requesr
    .sort({ name: 1 })  //  Sorting according the name 1 mean asc -1 means desc
    .select({ name: 1, age: 1 }) //  Means that get me the name and age only
    .then(result => {
      res.send(result);
    }).catch(err => {
      res.status(400).send(err)
    })
})

// Getting information
router.get('/:id', (req, res) => {
  User.findById(req.params.id).then(result => {
    if (!result) {
      res.status(404).send('There is no such user');
    }
    res.send(result);
  }).catch(err => {
    res.status(400).send(err.message)
  });
});

// Adding a new User
router.post('/', (req, res) => {
  // Setting Schema so i can validate it
  const validating = userValidating(req.body);
  if (validating.error) {
    res.status(400).send(validating.error.details);
  } else {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    //  Checking the Mongoose Schema Validating
    const v = user.validateSync();
    // If the validateSync returns any string, that means that there is somthing wrong in saving the data
    if (v)
      res.status(400).send('There is somthing wrong');
    //  IF the above if didn't wokred then the program can contiue to the below lines
    user.save()
      .then(result => {
        //  IF the user saved in the database
        res.send('You have added a new user');
        console.log(result);
      })
      .catch(err => {
        //  IF the user hasn't saved in the database

        res.status(401).send(err);
        console.log(err);
      });
  }
});

// Register new user
router.post('/register', (req, res) => {
  const validating = userValidating(req.body);
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).send('Not registered');
    }
    if (validating.error) {
      res.status(400).send(validating.error.details);
    }
    else {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        password: hash
      });
      const v = user.validateSync();
      if (v)
        res.status(400).send('There is somthing wrong');
      user.save()
        .then(result => {
          res.send('New user has been registerd');
          console.log(result);
        })
        .catch(err => {
          res.status(401).send(err);
        });
    }
  });
});

// Check Login
router.post('/checklogin', (req, res) => {

  var token = req.headers['x-access-token'];
  if (token)
    jwt.verify(token, 'publickKey', (err, decoded) => {
      if (err) {
        return res.status(500).send({ message: 'Unvalidate payload' });
      }
      res.status(200).send({ message: 'You are logged in' , decoded });

      return res.status(401).send({ message: 'You have to login' });
    });
});

// Don't forget to give me plus for writing the register be myself
// Login user
router.post('/login', (req, res) => {
  const validating = userValidating(req.body);
  if (validating.error) {
    res.status(400).send(validating.error.details);
  }
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).send('Password not valid');
        }
        if (result) {
          const JWTToken = jwt.sign({
            email: user.email,
            _id: user._id
          },
            'publickKey',
            {
              expiresIn: 86400
            });
          return res.status(200).json({
            token: JWTToken
          })
        }
        return res.status(401).send('Unauthorized Access');
      });
    })
    .catch(err => {
      res.status(401).send(err);
    });
});

// PUT
router.put('/:id', (req, res) => {
  // If req.body is valid
  const validating = userValidating(req.body);
  //  If the validation fails
  if (validating.error) {
    res.status(400).send(validating.error.details);
  } else {
    //  You can use updateMany
    User.updateOne({ _id: req.params.id }, { $set: req.body })
      .then(result => {
        res.send(`Number of updated users is ${result.n}`);
      }).catch(err => {
        res.status(400).send(err);
      });
  }
});

// Deleting a user
router.delete('/:id', (req, res) => {
  User.remove({ name: req.params.id }).then(result => {
    res.send(`Number of deleted users is ${result.n}`)
  }).catch(err => {
    res.status(400).send(err);
  });
});

//  To validate the POST PUT requestes
function userValidating(user) {
  const userSchema = {
    'name': Joi.string().min(5).required(),
    'email': Joi.string().required(),
    'password': Joi.string().min(5).required()
  }
  return Joi.validate(user, userSchema);
}

//  Expoting the router so app.js can use it in a MiddleWare
module.exports = router;
