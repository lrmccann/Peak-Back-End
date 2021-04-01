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

    // id1 is the num of likes to add
    // id2 is the id of the post
    // id3 is the post title 
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