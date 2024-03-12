const router = require('express').Router();
const sequelize = require('../config/connection');
const { withAuth } = require('../utils/auth');
const session = require('express-session');
const { Post, Response, Tag, TagPost, User, UserUpvote } = require('../models');
const { countUpvotes } = require('../utils/count');



//dashboard
router.get('/', withAuth, async (req, res) => {
  try {
    const postData = await Post.findAll({
      attributes: [
        'id',
        'title',
        'content'
      ],

      where: { user_id: req.session.user_id },

      // include: [
      //   {
      //     model: Response,
      //     attributes: ['content'],
      //   },

      // ],
    });
    const posts = postData.map(val => val.get({ plain: true }));
    console.log({ posts })

    const responseData = await Response.findAll({
      where: { user_id: req.session.user_id },
      include: [
        {
          model: Post,
          attributes: ['id', 'title']
        }
      ]
    });

    const responses = responseData.map(val => val.get({ plain: true }));

    // const userUpvotes = responses.map(val => val.get({ plain: true }));

    // for (let i = 0; i < userUpvotes.length; i++) {
    //   userUpvotes[i].upvotes = await countUpvotes(userUpvotes[i].id);
    // }



    res.render('dashboard', {
      posts,
      responses,
      logged_in: req.session.logged_in,
      is_admin: req.session.is_admin,
      username: req.session.username
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//edit response
router.get('/response-edit/:id', withAuth, async (req, res) => {
  try {
    const singleResponse = await Response.findByPk(req.params.id, {
      atttributes: [
        'id',
        'content',
        'post_id',
        'user_id'

      ],
      include: [
        {
          model: Post,
          attributes: ['title', 'content']
        },

      ],
    });
    const response = singleResponse.get({ plain: true });
    console.log(response)

    res.render('response-edit', {
      response,
      logged_in: req.session.logged_in,
      is_admin: req.session.is_admin,
      username: req.session.username
    })
  } catch (err) {
    res.status(500).json(err);
  }
});


//edit a post
router.get('/edit-post/:id', withAuth, async (req, res) => {
  try {
    const onePost = await Post.findByPk(req.params.id);
    const post = onePost.get({ plain: true });

    // res.json(postData);

    res.render('edit-post', {
      ...post,
      logged_in: req.session.logged_in,
      is_admin: req.session.is_admin,
    });
  } catch (err) {
    res.status(500).json(err);
  }

})

module.exports = router;
