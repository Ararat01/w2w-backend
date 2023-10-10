import MovieModel from "../models/Movie.js";
import GenreModel from "../models/Genre.js";
import { Rated } from "../models/Rated.js";
import { fetchMovieData } from "../utils/externalApi.js";
import CollectionModel from "../models/Collection.js";

export const createCollection = async (req, res) => {
  try {
    const { name, poster } = req.body;
    const collection = new CollectionModel({ name, poster });
    await collection.save();
    res.status(201).json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const addMovieToCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { movieName } = req.body; // Assuming you send the movie ID in the request body

    // Check if the collection exists
    const collection = await CollectionModel.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    // Check if the movie exists
    const movie = await MovieModel.find({ Title: movieName });
    if (!movie[0]) {
      return res.status(404).json({ error: "Movie not found" });
    }
    collection.movies.push({
      _id: movie[0]._id,
    });
    await collection.save();

    res.status(200).json({ message: "Movie added to the collection" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getCollectionById = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await CollectionModel.findById(collectionId).populate({
      path: "movies",
      select: "Title Poster _id imdbRating Year",
    });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    res.status(200).json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getCollections = async (req, res) => {
  try {
    const collection = await CollectionModel.find();

    res.status(200).json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
