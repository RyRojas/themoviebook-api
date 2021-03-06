const cors = require('cors'),
  express = require('express'),
  { check, validationResult } = require('express-validator'),
  Models = require('./models.js'),
  mongoose = require('mongoose'),
  morgan = require('morgan'),
  passport = require('passport');

require('./passport.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/theMovieBookDB',
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const app = express();

//Configure and run CORS
// const allowedOrigins = ['https://the-moviebook.herokuapp.com/', 'https://themoviebook.netlify.app'],
//     corsOptions = {
//         origin: (origin, callback) => {
//             if (!origin) return callback(null, true);
//             if(allowedOrigins.indexOf(origin) === -1) {
//                 let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
//                 return callback(new Error(message), false);
//             }
//             return callback(null, true);
//         }
//     };

app.use(cors(corsOptions));

app.use(cors());

//Morgan logging middleware
app.use(morgan('common'));

//Serve static files
app.use(express.static('public'));

//Body parser for JSON Objects
app.use(express.json());

let auth = require('./auth.js')(app);

//Navigate to (eventual) index on empty endpoint
app.get('/', (req, res) => {
  res.send('You just navigated to an empty page. Why did you do that?');
});

//Retrieve list of all movies
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => res.json(movies))
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Retrieve movie by title
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find({ Title: req.params.title })
      .then((movies) => res.json(movies))
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Retrieve movies by talent (may revisit to include actors while building frontend)
app.get(
  '/movies/talent/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find({ 'Director.Name': req.params.name })
      .then((movies) => res.json(movies))
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Retrieve description of requested genre
app.get(
  '/genres/:genreName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genreName }, '-_id Genre.$')
      .then((genre) => res.json(genre))
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Retrieve director bio of requested director
app.get(
  '/directors/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne(
      { 'Director.Name': req.params.name },
      '-_id Director.Genre Director.Bio Director.Birth Director.Death'
    )
      .then((director) => res.json(director))
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Register new user -- No auth required
app.post(
  '/users',
  [
    check('Username', 'Username is required.').not().isEmpty(),
    check(
      'Username',
      'Username must contain only alphanumeric characters.'
    ).isAlphanumeric(),
    check('Password', 'Password is required.').not().isEmpty(),
    check(
      'Password',
      'Password must be a minimum of 8 characters long'
    ).isLength({ min: 8 }),
    check('Email', 'Email is not valid.').isEmail().normalizeEmail(),
  ],
  (req, res) => {
    //Check validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);

    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists.');
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birth: req.body.Birth,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

//Update user info
app.put(
  '/users/:username',
  [
    check('Username', 'Username must contain only alphanumeric characters.')
      .optional()
      .isAlphanumeric(),
    check('Password', 'Password must be a minimum of 8 characters long')
      .optional()
      .isLength({ min: 8 }),
    check('Email', 'Email is not valid.').optional().isEmail().normalizeEmail(),
  ],
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    //Fields we are expecting/accept
    const { Username, Password, Email, Birth } = req.body;

    //The double if (Password) doesn't sit well with me. Target for future refactor
    if (Username || Password || Email || Birth) {
      if (Password) {
        req.body.Password = Users.hashPassword(Password);
      }

      Users.findOneAndUpdate(
        { Username: req.params.username },
        {
          $set: {
            ...req.body, //Pass body into db
          },
        },
        { new: true }
      )
        .then((updatedUser) => res.json(updatedUser))
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
        });
    } else {
      res.status(200).send('No fields to update');
    }
  }
);

//Retrieve user profile
app.get(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.username })
      .then((user) => res.json(user))
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Delete user account
app.delete(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.user + ' was not found');
        } else {
          res.status(200).send(req.params.user + ' was deleted successfully.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Get list of user favorites
app.get(
  '/users/:username/favs',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.username }, '-_id Favorites')
      .then((favs) => res.json(favs))
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Add movie to user favorites list
app.post(
  '/users/:username/favs',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.username },
      { $push: { Favorites: req.body.MovieID } },
      { new: true }
    )
      .then((updatedUser) => res.json(updatedUser))
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

//Delete movie from user favorites list
app.delete(
  '/users/:username/favs/:movieId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.username },
      { $pull: { Favorites: req.params.movieId } },
      { new: true }
    )
      .then((updatedUser) => res.json(updatedUser))
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Whoops, we broke it again, didn't we?");
});

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log('theMovieBook is listening on Port ' + port);
});
