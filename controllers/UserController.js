import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import UserModel from "../models/User.js";
import MovieModel from "../models/Movie.js";

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: "Smth went wrong email",
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    if (!isValidPass) {
      return res.status(400).json({
        message: "Smth went wrong password",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );
    const { passwordHash, ...userData } = user._doc;

    res.json({ userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Smth went wrong",
    });
  }
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      favorite: [],
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    res.json({ userData, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Smth went wrong",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "No user found",
      });
    }
    const { passwordHash, ...userData } = user._doc;

    res.json(userData);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "No access",
    });
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    const password = await bcrypt.genSalt(10);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      email: user.email,
      fullName: user.fullName,
      passwordHash: hash,
      favorite: user.favorite,
    });

    const newUser = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );

    res.json({
      email,
      message: `Your new password: ${password}`,
      fullName: user.fullName,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "No access",
    });
  }
};

export const addMovieToFavorite = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "No user found",
      });
    }

    const { movieId } = req.body;
    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }
    user.favorite.push(movieId);
    await user.save();
    res.json({ message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "No access",
    });
  }
};
export const delMovieToFavorite = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "No user found",
      });
    }

    const { movieId } = req.body;
    user.favorite = user.favorite.filter((id) => id.toString() !== movieId);

    await user.save();
    res.json({ message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "No access",
    });
  }
};

export const getFavoriteMovies = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).populate({
      path: "favorite",
      select: "Title Poster _id imdbRating Year",
    });
    if (!user) {
      return res.status(404).json({
        message: "No user found",
      });
    }

    res.json(user.favorite);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "No access",
    });
  }
};
export const getFavoriteMoviesId = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "No user found",
      });
    }

    res.json(user.favorite);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "No access",
    });
  }
};
