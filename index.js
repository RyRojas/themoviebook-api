const express = require('express'),
    morgan = require('morgan');

const app = express();

//List of movies in JSON format
let topMovies = [
    {
        "title": "Man with a Movie Camera",
        "director": "Dziga Vertov",
        "genre": [
            "documentary",
            "music"
        ]
    },
    {
        "title": "Do the Right Thing",
        "director": "Spike Lee",
        "genre": [
            "Comedy",
            "Drama"
        ]
    },
    {
        "title": "Persona",
        "director": "Ingmar Bergman",
        "genre": [
            "Drama",
            "Thriller"
        ]
    },
    {
        "title": "Videodrome",
        "director": "David Cronenberg",
        "genre": [
            "Horror",
            "Sci-Fi",
            "Thriller"
        ]
    },
    {
        "title": "The Sacrifice",
        "director": "Andrei Tarkovsky",
        "genre": [
            "Drama"
        ]
    },
    {
        "title": "Holy Motors",
        "director": "Leos Carax",
        "genre": [
            "Drama",
            "Fantasy"
        ]
    },
    {
        "title": "In the Mood for Love",
        "director": "Wong Kar-wai",
        "genre": [
            "Drama",
            "Romance"
        ]
    },
    {
        "title": "The Rules of the Game",
        "director": "Jean Renoir",
        "genre": [
            "Comedy",
            "Drama"
        ]
    },
    {
        "title": "Tokyo Story",
        "director": "Yasujiro Ozu",
        "genre": [
            "Drama"
        ]
    },
    {
        "title": "8 1/2",
        "director": "Federico Fellini",
        "genre": [
            "Drama"
        ]
    }
];

//Morgan logging middleware
app.use(morgan('common'));

//Serve static files
app.use(express.static('public'));

//Body parser for JSON Objects
app.use(express.json());

//Navigate to (eventual) index on empty endpoint
app.get('/', (req, res) => {
    res.send('You just navigated to an empty page. Why did you do that?');
});

//Retrieve list of all movies
app.get('/movies', (req, res) => {
    res.json(topMovies);
});

//Retrieve movie by title
app.get('/movies/:title', (req, res) => {
    res.json(topMovies.find((movie) => movie.title === req.params.title));
});

//Retrieve movies by talent
app.get('/movies/talent/:name', (req, res) => {
    res.json(topMovies.find((movie) => movie.director === req.params.name)); //revisit later when actors included
});

//Retrieve description of requested genre
app.get('/genres/:genre', (req, res) => {
    res.status(200).send('Genre description successfully retreived.');
});

//Retrieve director bio of requested director
app.get('/directors/:director', (req, res) => {
    res.status(200).send('Director bio successfully retreived.');
});

//Register new user
app.post('/users', (req, res) => {
    res.status(201).send('New user successfully registered.');
});

//Update user info
app.put('/users/:user', (req, res) => {
    res.status(200).send('User information successfully updated');
});

//Retrieve user profile
app.get('/users/:user', (req, res) => {
    res.status(200).send('User information successfully retrieved');
});

//Delete user account
app.delete('/users/:user', (req, res) => {
    res.status(200).send('User account successfully deleted.');
});

//Get list of user favorites
app.get('/users/:user/favs', (req, res) => {
    res.status(200).send('Favorites list successfully retrieved.');
});

//Add movie to user favorites list
app.post('/users/:user/favs', (req, res) => {
    res.status(200).send('New movie successfully added to favorites list.');
});

//Delete movie from user favorites list
app.delete('/users/:user/favs/:id', (req, res) => {
    res.status(200).send('Movie successfully removed from favorites list.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Whoops, we broke it again, didn\'t we?');
});

app.listen(8080, () => {
    console.log('theMovieBook is listening on Port 8080.');
});