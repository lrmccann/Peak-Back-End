// const router = require('express').Router();


module.exports = function(app) {
    const getController = require("../Controller/controller");

    app.route('/account-info')
    .get(getController.getAllUsers)
    .post(getController.createNewUser)
    .delete(getController.deleteAccount);

    app.route('/user-details/:id1')
    .get(getController.fetchUserInfo)

    app.route("/account-info-login/:id1/:id2")
    .get(getController.authenticateUser);

    app.route('/user-posts')
    .get(getController.getAllPosts);

    app.route('/post-views/:id1')
    .put(getController.addPostView);


    // id1 = id of post ; id2 = user id
    app.route('/user-bookmarks/:id1/:id2')
    .put(getController.bookmarkNewPost)
    .delete(getController.removeBookmarkedPost);

    // id1 = user id
    app.route('/user-all-bookmarks/:id1')
    .get(getController.getBookmarkedPosts);

    app.route('/user-bookmarks-home/:id1')
    .get(getController.bookmarksForHome);


    // id1 = like + 1; id2 = post id; id3 = post title
    app.route("/numOfLikesForPost/:id1/:id2/:id3")
    .put(getController.addLike);

    app.route('/user-posts/:id1')
    .get(getController.getAllInfoOnPost)
    .delete(getController.deleteUserPost);

    app.route('/getUserPost/:id1')
    .get(getController.displayTopPosts);

    app.route('/create-new-post')
    .post(getController.postNewBlog);


    app.route('/user-comments/:id1')
    .get(getController.displayTopComments)
    .post(getController.postNewComment)
    .delete(getController.deleteUserComment);
    
    app.route('/user-comments/:id1')
    .get(getController.loadAllCommentsForPost);
};