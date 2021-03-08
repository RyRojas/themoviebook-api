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

app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('You just navigated to an empty page. Why did you do that?');
});

app.get('/movies', (req, res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Whoops, we broke it again, didn\'t we?');
});

app.listen(8080, () => {
    console.log('theMovieBook is listening on Port 8080.');
});