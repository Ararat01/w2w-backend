import MovieModel from "../models/Movie.js";
import GenreModel from "../models/Genre.js";
import UserModel from "../models/User.js";
import { Rated } from "../models/Rated.js";
import { fetchMovieData } from "../utils/externalApi.js";

const handleErrors = (err, res) => {
  console.error(err);
  res.status(500).json({
    message: "Something went wrong",
  });
};

export const createMovie = async (req, res) => {
  try {
    const doc = new MovieModel(movieDoc(req.body));

    const movie = await doc.save();

    res.json(movie);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Smth went wrong",
    });
  }
};

export const createUsingDb = async (req, res) => {
  const movieDb = await fetchMovieData(req.body.name, req.body.year);
  const doc = new MovieModel(
    movieDoc({ ...movieDb, Trailer: req.body.trailer })
  );
  const movie = await doc.save();

  res.json(movie);
};

export const createMany = async (req, res) => {
  try {
    for (let i = 0; i < req.body.movies.length; i++) {
      const movieDb = await fetchMovieData(
        req.body.movies[i].name,
        req.body.movies[i].year
      );
      const doc = new MovieModel(
        movieDoc({ ...movieDb, Trailer: req.body.movies[i].trailer })
      );
      const movie = await doc.save();
    }
    res.json({ message: "Success" });
  } catch (err) {
    handleErrors(err, res);
  }
};

export const getMoviesByGenre = async (req, res) => {
  try {
    const genreName = req.query.genre;
    const sortOrder = req.query.sort ? parseInt(req.query.sort) : 1;
    const sortField = req.query.sort ? "w2wRating" : "randomOrder";
    if (req.query.count) {
      const movies = await MovieModel.aggregate([
        { $match: { Genre: { $elemMatch: { $eq: genreName } } } },
        { $sample: { size: parseInt(req.query.count) } },
        { $sort: { [sortField]: sortOrder } },
        {
          $project: {
            _id: 1,
            Title: 1,
            Poster: 1,
            Year: 1,
            imdbRating: 1,
            moviePoster: 1,
          },
        },
      ]).exec();
      res.json(movies);
    } else {
      const movies = await MovieModel.aggregate([
        { $match: { Genre: { $elemMatch: { $eq: genreName } } } },
        { $sort: { [sortField]: sortOrder } },
        {
          $project: {
            _id: 1,
            Title: 1,
            Poster: 1,
            Year: 1,
            imdbRating: 1,
            moviePoster: 1,
          },
        },
      ]).exec();
      res.json(movies);
    }
  } catch (err) {
    handleErrors(err, res);
  }
};

export const getAllMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 24;
    const skip = (page - 1) * pageSize;
    const collectionLength = await MovieModel.countDocuments();
    const movies = await MovieModel.aggregate([
      {
        $match: req.query.genre ? { Genre: req.query.genre } : {},
      },
      {
        $sort: req.body.filter ? { [req.body.filter]: -1 } : { createdAt: -1 },
      },
      { $skip: skip },
      { $limit: pageSize },
      {
        $project: {
          _id: 1,
          Title: 1,
          Poster: 1,
          Year: 1,
          imdbRating: 1,
          moviePoster: 1,
        },
      },
    ]).exec();

    res.json({ movies, fullLength: collectionLength });
    return;
  } catch (err) {
    handleErrors(err, res);
  }
};

export const getMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await MovieModel.findById(movieId)
      .populate({
        path: "Reviews.user",
        select: "fullName",
      })
      .exec();
    movie;
    res.json(movie);
  } catch (err) {
    handleErrors(err, res);
  }
};

export const getMovieByName = async (req, res) => {
  try {
    const { movieName } = req.body;
    const searchTermRegex = new RegExp(movieName, "i");

    const movies = await MovieModel.aggregate([
      {
        $match: { Title: { $regex: searchTermRegex } },
      },
      {
        $sort: req.body.filter ? { [req.body.filter]: -1 } : { createdAt: -1 },
      },
      {
        $project: {
          _id: 1,
          Title: 1,
          Poster: 1,
          Year: 1,
          imdbRating: 1,
          moviePoster: 1,
        },
      },
    ]).exec();
    res.json(movies);
  } catch (err) {
    handleErrors(err, res);
  }
};

export const addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { body } = req.body; // Assuming you send the movie ID in the request body

    // Check if the collection exists
    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "movie not found" });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    movie.Reviews.push({
      user: {
        _id: user._id,
        fullName: user.fullName,
      },
      body,
    });
    await movie.save();

    res.status(200).json({ message: "Review added to the movie" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "No access",
    });
  }
};

export const getGenres = async (req, res) => {
  try {
    const genres = await GenreModel.find();
    res.json(genres);
  } catch (err) {
    handleErrors(err, res);
  }
};

const genreExist = async (genreName) => {
  try {
    const genre = await GenreModel.find({ genreName: genreName });
    if (genre == false) {
      console.log("added new genre");
      const genre = new GenreModel({ genreName: genreName });
      await genre.save();
    }
  } catch (err) {
    console.log(err);
  }
};

const getRating = (imdb, meta, tomat) => {
  let tomatRating = parseFloat(tomat) / 10;
  let imdbRating = parseFloat(imdb);
  let metaRating = parseFloat(meta) / 10;
  return ((imdbRating + metaRating + tomatRating) / 3).toFixed(2);
};

const getDuration = (duration) => {
  const time = parseFloat(duration);
  const hours = parseInt(time / 60);
  const mins = time % 60;
  const hourText = hours === 0 ? "" : hours + "h";
  const minText = mins === 0 ? "" : mins + "m";
  return `${hourText} ${minText}`;
};

const movieDoc = (movie) => {
  let genres = movie.Genre.split(", ").filter((genre) =>
    genre === "Music" ? "Musical" : genre
  );
  for (let genre of genres) {
    genreExist(genre);
  }
  return {
    Title: movie.Title,
    Year: movie.Year,
    Rated: Rated[movie.Rated],
    Released: movie.Released,
    Runtime: getDuration(movie.Runtime),
    Genre: genres,
    Director: movie.Director,
    Writer: movie.Writer.split(", "),
    Actors: movie.Actors.split(", "),
    Plot: movie.Plot,
    Language: movie.Language,
    Poster: movie.Poster,
    Trailer: movie.Trailer,
    Metascore: movie.Metascore,
    imdbRating: movie.imdbRating,
    imdbVotes: movie.imdbVotes,
    tomatRating: movie.Ratings[1].Value,
    w2wRating: getRating(
      movie.imdbRating,
      movie.Metascore,
      movie.Ratings[1].Value
    ),
    imdbID: movie.imdbID,
    Type: movie.Type,
  };
};
