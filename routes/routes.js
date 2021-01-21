// const router = require('express').Router();


module.exports = function(app) {
    const getController = require("../Controller/controller");

    app.route('/account-info')
    .get(getController.getAllUsers)
    .post(getController.createNewUser)
    .delete(getController.deleteAccount);

    app.route("/account-info-login/:id1/:id2")
    .get(getController.authenticateUser);

    app.route('/user-posts')
    .get(getController.getAllPosts);

    app.route('/user-posts/:id1')
    .get(getController.getAllInfoOnPost)
    .delete(getController.deleteUserPost);

    app.route('/getUserPost/:id1')
    .get(getController.displayTopPosts);

    app.route('/create-new-post')
    .post(getController.postNewBlog);

    app.route('/user-comments')
    .get(getController.getUserNameForComments);

    app.route('/user-comments/:id1')
    .get(getController.displayTopComments)
    .post(getController.postNewComment)
    .delete(getController.deleteUserComment);
    
    app.route('/user-comments/:id1')
    .get(getController.loadAllCommentsForPost);
};