import mongoose from "mongoose";

const GenreSchema = new mongoose.Schema(
  {
    genreName: {
      type: String,
      required: true,
      unique: true,
    },
    genreImg: {
      type: String,
      required: true,
      default: "https://tacm.com/wp-content/uploads/2018/01/no-image-available.jpeg "
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model("Genre", GenreSchema);
