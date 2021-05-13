const router = require('express').Router();

    const getController = require("../Controller/controller");
    const isAuth = require("../Controller/isAuth");

    router.route('/account-info')
    .post(getController.createNewUser)
    .delete(isAuth.authenticateToken , getController.deleteAccount)

    router.route('/account_info/:id1')
    .put(getController.addPrefTopics);

    router.route("/account-info-login/:id1/:id2")
    .get(getController.authenticateUser);

    router.route('/user-posts')
    .get(isAuth.authenticateToken, getController.getAllPosts);
    // id1 = blog Id
    router.route('/posts-general/:id1')
    .get( isAuth.authenticateToken ,getController.getAllInfoOnPost)
    .put(isAuth.authenticateToken , getController.addPostView)
    .delete(isAuth.authenticateToken ,getController.deleteUserPost);

    router.route('/user-bookmarks/:id1/:id2')
    .put(isAuth.authenticateToken , getController.bookmarkNewPost)
    .delete(isAuth.authenticateToken , getController.removeBookmarkedPost);
    // id1 = user Id
    router.route('/user-all-bookmarks/:id1')
    .get(isAuth.authenticateToken , getController.getBookmarkedPosts);
    // id1 = user Id
    router.route('/user-bookmarks-home/:id1')
    .get(isAuth.authenticateToken , getController.bookmarksForHome);

    router.route("/numOfLikesForPost/:id1/:id2/:id3")
    .put(isAuth.authenticateToken , getController.addLike);
    // id1 = user Id
    router.route('/getUserPost/:id1')
    .get(isAuth.authenticateToken ,getController.displayTopPosts);

    router.route('/create-new-post')
    .post(isAuth.authenticateToken ,getController.postNewBlog);

    router.route('/user-comments/:id1')
    .delete(isAuth.authenticateToken ,getController.deleteUserComment);

    router.route('/user-comments-post/:id1/:id2/:id3')
    .post(isAuth.authenticateToken ,getController.postNewComment);

    router.route('/liked-posts/:id1')
    .get(isAuth.authenticateToken ,getController.getLikedPosts);

    router.route('/user-details/:id1')
    .get(isAuth.authenticateToken ,getController.fetchUserInfo);

    // id1 = data url; id2 = img type;
    router.route('/blog-images/:id1/:id2')
    .put(isAuth.authenticateToken ,getController.uploadBlogImg);

//  id1 = img name to save under in aws; id2 = img type;
    router.route('/user-images/:id1/:id2')
    .put(isAuth.authenticateToken ,getController.uploadUserImg);

module.exports = router;