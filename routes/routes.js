// const router = require('express').Router();


module.exports = function(app) {
    const getController = require("../Controller/controller");

    app.route('/account-info')
    .get(getController.getAllUsers);

    app.route("/account-info-login/:id1/:id2")
    .get(getController.authenticateUser);

    app.route('/account-info/:id1/:id2')
    .post(getController.createNewUser)
    .get(getController.listUserInfo)
    .delete(getController.deleteAccount);


    app.route('/user-posts')
    .get(getController.getAllPosts)


    app.route('/user-posts/:id1')
    .post(getController.postNewBlog)
    .get(getController.getAllInfoOnPost)
    .delete(getController.deleteUserPost);


    app.route('/user-comments')
    .get(getController.loadPreviewComments)


    app.route('/user-comments/:id1')
    .post(getController.postNewComment)
    .get(getController.loadAllCommentsForPost)
    .delete(getController.deleteUserComment);
};