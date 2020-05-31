exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{ title: 'First Post', content: 'This is the first post.' }],
  });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  // create post in db
  res.status(201).json({ // success and created a resource
    message: 'Post created successfully',
    post: {
      id: new Date().toISOString().replace(/:/g, '-'),
      title: title,
      content: content,
    },
  });
};
