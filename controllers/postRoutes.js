// routes associated with a post and the responses to that post

const router = require('express').Router();
const session = require('express-session');
const { Post, Response, Tag, TagPost, User, UserUpvote } = require('../models');
const { withAuth, isAdmin } = require('../utils/auth');
const { countUpvotes, countResponses, countUserResponses, countUserPosts } = require('../utils/count');

router.get('/:id', withAuth, async (req, res) => {
  // retrieve a single post and the reponses to that post
  // the post should include title, content, author, date, tags, and # comments
  // the responses to that post should include content, author, date, and # of upvotes
  // user should have the ability to respond to this post

  const onePost = await Post.findByPk(req.params.id, {
    attributes: ['title', 'content', ['updated_at', 'date']],
    include: [{
      model: User,
      attributes: ['username']
    }, {
      model: Tag,
      attributes: ['name']
    }, {
      model: Response,
      attributes: ['id', 'content', ['updated_at', 'date']],
      include: {
        model: User,
        attributes: ['username']
      }
    }]
  });

  // get the data then flatten it slightly
  postData = onePost.get({ plain: true });
  postData.post_username = postData.user.username;
  delete postData.user;

  // add the comments count to the post
  postData.numResponses = postData.responses.length;

  // for each response in the object, add the number of upvotes for that response
  // and flatten the response object for convenience
  for (const response of postData.responses) {
    response.username = response.user.username;
    delete response.user;
    response.upvotes = await countUpvotes(response.id);
  };

  // let's combine the tags into a single string
  const tagArray = [];
  for (const tag of postData.tags) tagArray.push(tag.name);
  delete postData.tags;
  postData.tags = tagArray.join(', ');

  // to display output in Insomnia uncomment next line (and log in as a user)
  // res.json(postData);

  // send data to the handlebars template
  res.render('post', {
    logged_in: req.session.logged_in,
    is_admin: req.session.is_admin,
    ...postData
  });
});

module.exports = router;
