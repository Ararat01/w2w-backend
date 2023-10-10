import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
    },
    Year: {
      type: String,
      required: true,
    },
    Rated: {
      type: String,
      required: true,
    },
    Released: {
      type: String,
      required: true,
    },
    Runtime: {
      type: String,
      required: true,
    },
    Genre: {
      type: Array,
      required: true,
      default: [],
    },
    Director: {
      type: String,
      required: true,
    },
    Writer: {
      type: Array,
      required: true,
      default: [],
    },
    Actors: {
      type: Array,
      required: true,
      default: [],
    },
    Plot: {
      type: String,
      required: true,
    },
    Language: {
      type: String,
      required: true,
    },
    Poster: {
      type: String,
      required: true,
    },
    Trailer: {
      type: String,
      default: "https://www.youtube.com/embed/KqvpV8xi4ps?si=hqQe-QH7esIGIJ2o",
      required: true,
    },
    Metascore: String,
    imdbRating: String,
    imdbVotes: String,
    tomatRating: String,
    w2wRating: String,
    imdbID: {
      type: String,
      unique: true,
    },
    Type: {
      type: String,
      required: true,
    },
    Reviews: [
      new mongoose.Schema(
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          body: {
            type: String,
            required: true,
          },
        },
        {
          timestamps: true,
        }
      ),
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Movie", MovieSchema);
