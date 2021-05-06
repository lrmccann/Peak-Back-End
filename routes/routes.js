const router = require('express').Router();

    const getController = require("../Controller/controller");

    router.route('/account-info')
    .post(getController.createNewUser)
    .delete(getController.deleteAccount)

    router.route('/account_info/:id1')
    .put(getController.addPrefTopics);

    router.route("/account-info-login/:id1/:id2")
    .get(getController.authenticateUser);

    router.route('/user-posts')
    .get(getController.getAllPosts);

    router.route('/post-views/:id1')
    .put(getController.addPostView);

    router.route('/user-bookmarks/:id1/:id2')
    .put(getController.bookmarkNewPost)
    .delete(getController.removeBookmarkedPost);

    router.route('/user-all-bookmarks/:id1')
    .get(getController.getBookmarkedPosts);

    router.route('/user-bookmarks-home/:id1')
    .get(getController.bookmarksForHome);

    router.route("/numOfLikesForPost/:id1/:id2/:id3")
    .put(getController.addLike);

    router.route('/user-posts/:id1')
    .get(getController.getAllInfoOnPost)
    .delete(getController.deleteUserPost);

    router.route('/getUserPost/:id1')
    .get(getController.displayTopPosts);

    router.route('/create-new-post')
    .post(getController.postNewBlog);

    router.route('/user-comments/:id1')
    .get(getController.displayTopComments)
    .delete(getController.deleteUserComment);
    
    router.route('/user-comments/:id1')
    .get(getController.loadAllCommentsForPost);

    router.route('/user-comments-post/:id1/:id2/:id3')
    .post(getController.postNewComment);

    router.route('/liked-posts/:id1')
    .get(getController.getLikedPosts);

    router.route('/user-details/:id1')
    .get(getController.fetchUserInfo);

module.exports = router;