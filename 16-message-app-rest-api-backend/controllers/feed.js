const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

const io = require('../socket');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate('creator')
      .sort({ createdAt: -1 }) // in descending order, last created on top
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: 'Fetched posts successfully',
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace('\\', '/'); // for Windows
  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = User.findById(req.userId); // userId saved in req via isAuth
    user.posts.push(post);
    await user.save();

    // sending this to all clients through the communication channel
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
    });

    // 201 success and created a resource
    res.status(201).json({
      message: 'New post successfully created.',
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      // if no status code set yet, set it to 500
      err.statusCode = 500;
    }
    next(err); // continue to error handling middleware
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error; // this error will be passed to catch block and then to middleware error handling func
    }
    res.status(200).json({ message: 'Post fetched', post: post });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace('\\', '/');
  }
  if (!imageUrl) {
    const error = new Error('No file picked!');
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findById(postId).populate('creator');
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId) {
      // loggedin user doesn't match to creator of the post
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      // different from imageUrl saved in the db
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;

    const postData = await post.save();

    io.getIO().emit('posts', { action: 'update', post: postData });

    res.status(200).json({ message: 'Post updated!', post: postData });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId); // remove the post from posts collection

    const user = await User.findById(req.userId);
    user.posts.pull(postId); // remove the post from the users collection, needed since there is a Post-User relation
    await user.save();

    io.getIO().emit('posts', { action: 'delete', post: postId });

    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', filePath); // .. go up one level
  fs.unlink(filePath, (err) => console.log(err));
};
