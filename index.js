import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import {
  createMovie,
  createMany,
  createUsingDb,
  getGenres,
  getMoviesByGenre,
  getMovieById,
  getAllMovies,
  addReview,
  getMovieByName,
} from "./controllers/MovieController.js";

import {
  addMovieToCollection,
  createCollection,
  getCollections,
  getCollectionById,
} from "./controllers/CollectionController.js";
import {
  addMovieToFavorite,
  delMovieToFavorite,
  forgetPassword,
  getFavoriteMovies,
  getFavoriteMoviesId,
  getMe,
  login,
  register,
} from "./controllers/UserController.js";
import checkAuth from "./utils/checkAuth.js";

const app = express();

mongoose
  .connect(
    "mongodb+srv://admin:pass1234@cluster0.ecvdwuu.mongodb.net/w2w?retryWrites=true&w=majority"
  )
  .then(() => console.log("DB is ok"))
  .catch((err) => console.log("DB error:", err));

app.use(express.json());
app.use(cors());

// User
app.get("/auth/me", checkAuth, getMe);
app.get("/auth/favorite/movies", checkAuth, getFavoriteMovies);
app.get("/auth/favorite/id", checkAuth, getFavoriteMoviesId);
app.post("/auth/register", register);
app.post("/auth/login", login);
app.post("/auth/forget", forgetPassword);
app.post("/auth/favorite", checkAuth, addMovieToFavorite);
app.post("/auth/favorite/del", checkAuth, delMovieToFavorite);

// Movies
app.get("/moviesByGenre", getMoviesByGenre);
app.get("/movies/:id", getMovieById);
app.post("/getMovies", getAllMovies);
app.post("/movies/search", getMovieByName);
app.post("/movies", checkAuth, createMovie);
app.post("/moviesMany", checkAuth, createMany);
app.post("/movies/:movieId/reviews", checkAuth, addReview);
app.post("/movie/db", checkAuth, createUsingDb);

// Genres
app.get("/genres", getGenres);

//Collections
app.get("/collections/:collectionId", getCollectionById);
app.get("/collections", getCollections);
app.post("/collection", checkAuth, createCollection);
app.post("/collections/:collectionId/movies", checkAuth, addMovieToCollection);

app.listen("4444", (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("Server OK");
});
