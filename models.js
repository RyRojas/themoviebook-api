const bcrypt = require('bcrypt'),
  mongoose = require('mongoose');

/**
 * @typedef {Object} Movie
 *  @property {String} Title - Movie title
 *  @property {String} Description - Movie synopsis
 *  @property {Array<Genre>} Genre - Array of movie's genres
 *  @property {Object<Director>} Director - Movie's director
 *  @property {String} ImagePath - Image path of movie poster
 *  @property {Boolean} Featured - Indicates whether movie is featured
 *  @property {String} Year - Year of release
 */

/**
 * @typedef {Object} Genre
 *  @property {string} Name - Genre name
 *  @property {string} Descriptiion - Genre description
 */

/**
 * @typedef {Object} Director
 *  @property {String} Name - Director's full name
 *  @property {String} Bio - Director's biography
 *  @property {Date} Birth - Director's date of birth
 *  @property {Date} Death - Director's date of death
 */

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: [
    {
      Name: String,
      Description: String,
    },
  ],
  Director: {
    Name: String,
    Bio: String,
    Birth: Date,
    Death: Date,
  },
  ImagePath: String,
  Featured: Boolean,
  Year: String,
});

/**
 * @typedef {Object} User
 * @property {String} Username - User's username
 * @property {String} Password - User's hashed password
 * @property {String} Email - User's email
 * @property {Date} Birth - User's date of birth
 * @property {Array<String>} Favorites - User's favorites listed by Movie ID
 */

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birth: Date,
  Favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
