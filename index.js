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

mongoose.connect('mongodb://localhost:27017/theMovieBookDB',
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const app = express();

//Configure and run CORS
let allowedOrigins = ['http://localhost:8080', 'http:themoviebook.com'],
    corsOptions = {
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if(allowedOrigins.indexOf(origin) === -1) {
                let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
                return callback(new Error(message), false);
            }
            return callback(null, true);
        }
    };

app.use(cors(corsOptions));

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
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then(movies => res.json(movies))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Retrieve movie by title
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find({ Title: req.params.title })
        .then(movies => res.json(movies))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Retrieve movies by talent (will revisit to include actors after we cover MongoDB Atlas)
app.get('/movies/talent/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find( {'Director.Name': req.params.name})
        .then(movies => res.json(movies))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Retrieve description of requested genre
app.get('/genres/:genre', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.genre}, '-_id Genre.$')
        .then(genre => res.json(genre))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Retrieve director bio of requested director
app.get('/directors/:director', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.director}, '-_id Director.Genre Director.Bio Director.Birth Director.Death')
        .then(director => res.json(director))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Register new user -- No auth required
app.post('/users', (req, res) => {

        let hashedPassword = Users.hashPassword(req.body.Password);

        Users.findOne({ Username: req.body.Username })
            .then((user) => {
                if (user) {
                    return res.status(400).send(req.body.Username + ' already exists.');
                } else {
                    Users
                        .create({
                            Username: req.body.Username,
                            Password: hashedPassword,
                            Email: req.body.Email,
                            Birth: req.body.Birth
                        })
                        .then((user) => { res.status(201).json(user) })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        })
                }
            }).catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
});

//Update user info
app.put('/users/:user', passport.authenticate('jwt', { session: false }), (req, res) => {
    //Fields we are expecting/accept
    const { Username, Password, Email, Birth } = req.body;

    //The double if (Password) doesn't sit well with me. Target for future refactor
    if ( Username || Password || Email || Birth) {
        if (Password) {
            req.body.Password = Users.hashPassword(Password);
        }

        Users.findOneAndUpdate(
            { Username: req.params.user },
            { $set:
                {
                    ...req.body //Pass body into db
                }
            },
            { new: true})
        .then(updatedUser => res.json(updatedUser))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
    } else {
    res.status(200).send('No fields to update');
    }
});

//Retrieve user profile
app.get('/users/:user', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.user })
        .then(user => res.json(user))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Delete user account
app.delete('/users/:user', passport.authenticate('jwt', { session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.user})
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.user + ' was not found');
            } else {
                res.status(200).send(req.params.user + ' was deleted successfully.')
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Get list of user favorites
app.get('/users/:user/favs', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ Username: req.params.user }, '-_id Favorites')
        .then(favs => res.json(favs))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Add movie to user favorites list
app.post('/users/:user/favs', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.user},
        { $push: { Favorites: req.body.MovieID }},
        { new: true })
        .then(updatedUser => res.json(updatedUser))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Delete movie from user favorites list
app.delete('/users/:user/favs/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { Username: req.params.user},
        { $pull: { Favorites: req.params.id }},
        { new: true })
        .then(updatedUser => res.json(updatedUser))
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Whoops, we broke it again, didn\'t we?');
});

app.listen(8080, () => {
    console.log('theMovieBook is listening on Port 8080.');
});