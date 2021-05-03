const router = require('express').Router();


module.exports = function(app) {
    const getController = require("../Controller/controller");

    router.route('/account-info')
    .get(getController.getAllUsers)
    .post(getController.createNewUser)
    .delete(getController.deleteAccount);

    router.route('/user-details/:id1')
    .get(getController.fetchUserInfo)

    router.route("/account-info-login/:id1/:id2")
    .get(getController.authenticateUser);

    router.route('/user-posts')
    .get(getController.getAllPosts);

    router.route('/post-views/:id1')
    .put(getController.addPostView);


    // id1 = id of post ; id2 = user id
    router.route('/user-bookmarks/:id1/:id2')
    .put(getController.bookmarkNewPost)
    .delete(getController.removeBookmarkedPost);

    // id1 = user id
    router.route('/user-all-bookmarks/:id1')
    .get(getController.getBookmarkedPosts);

    router.route('/user-bookmarks-home/:id1')
    .get(getController.bookmarksForHome);


    // id1 = like + 1; id2 = post id; id3 = post title
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
    .post(getController.postNewComment)
    .delete(getController.deleteUserComment);
    
    router.route('/user-comments/:id1')
    .get(getController.loadAllCommentsForPost);
};