const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        message: 'Fetched posts successfully',
        posts: posts,
      });
    })
    .catch((err) => next(err));
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: 'images/fleabag.jpg',
    creator: { name: 'Lucie' },
  });
  post
    .save()
    .then((postData) => {
      res.status(201).json({
        // success and created a resource
        message: 'New post successfully created.',
        post: postData,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        // if no status code set yet, set it to 500
        err.statusCode = 500;
      }
      next(err); // continue to error handling middleware
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error; // this error will be passed to catch block and then to middleware error handling func
      }
      res.status(200).json({ message: 'Post fetched', post: post });
    })
    .catch((err) => next(err));
};
