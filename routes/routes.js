const router = require('express').Router();

    const getController = require("../Controller/controller");
    const isAuth = require("../Controller/isAuth");
    // data is contained in body
    router.route('/account-info')
    .post(getController.createNewUser)
    .delete(isAuth.authenticateToken , getController.deleteAccount);
    // id1 = userId
    router.route('/account_info/:id1')
    .put(getController.addPrefTopics);
    // id1 = username id2 = password
    router.route("/account-info-login/:id1/:id2")
    .get(getController.authenticateUser);
    // no data
    router.route('/user-posts')
    .get(isAuth.authenticateToken, getController.getAllPosts);
    // id1 = blog Id
    router.route('/posts-general/:id1')
    .get( isAuth.authenticateToken , getController.getAllInfoOnPost)
    .put(isAuth.authenticateToken , getController.addPostView)
    .delete(isAuth.authenticateToken , getController.deleteUserPost);
    // id1 = userId id2 = postId id3 = cond
    router.route('/user-bookmarks/:id1/:id2/:id3')
    .put(isAuth.authenticateToken , getController.bookmarkNewPost);
    // id1 = user Id
    router.route('/user-all-bookmarks/:id1')
    .get(isAuth.authenticateToken , getController.getBookmarkedPosts);
    // id1 = user Id
    router.route('/user-bookmarks-home/:id1')
    .get(isAuth.authenticateToken , getController.bookmarksForHome);
    // id1 = userId id2 = postId id3 = cond
    router.route("/numOfLikesForPost/:id1/:id2/:id3")
    .put(isAuth.authenticateToken , getController.addLike);
    // id1 = user Id
    router.route('/getUserPost/:id1')
    .get(isAuth.authenticateToken , getController.displayTopPosts);
    // data is contained in body
    router.route('/create-new-post')
    .post(isAuth.authenticateToken , getController.postNewBlog);
    // DELETE - id1 = postId IF WE KEEP THE ROUTE WE NEED TO PROB ALSO PASS THE USERS ID TO VERIFY
    // POST - id1 = postId id2 = userId data is also contained in body
    router.route('/user-comments/:id1/:id2')
    .post(isAuth.authenticateToken , getController.postNewComment)
    .delete(isAuth.authenticateToken , getController.deleteUserComment);
    // id1 = userId
    router.route('/liked-posts/:id1')
    .get(isAuth.authenticateToken , getController.getLikedPosts);
    // id1 = userId
    router.route('/user-details/:id1')
    .get(isAuth.authenticateToken , getController.fetchUserInfo);
    // id1 = data url; id2 = img type;
    router.route('/blog-images/:id1/:id2')
    .put(isAuth.authenticateToken , getController.uploadBlogImg);
//  id1 = img name to save under in aws; id2 = img type;
    router.route('/user-images/:id1/:id2')
    .put(isAuth.authenticateToken , getController.uploadUserImg);

module.exports = router;