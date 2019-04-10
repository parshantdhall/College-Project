var express = require('express'),
    router = express.Router();

// requiring page model
var Page = require('../models/page');


// getting index page
router.get('/', (req, res) => {
    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
        if(err) {
            req.flash('danger', err);
        }
        else{
        res.render('admin/pages', {
            pages: pages
        });
    }
    });
});

// get add page
router.get('/add-page', (req, res) => {
    const title = "",
          slug = "",
          content = "";
    res.render('admin/add_page', {
        title: title,
        slug: slug,
        content: content
    });
});

// Post add page
router.post('/add-page', (req, res) => {
    req.checkBody('title', 'title must have a value.').notEmpty();
    req.checkBody('content', 'COntent must have a value.').notEmpty();

    let title = req.body.title,
        slug = req.body.slug.replace(/\s+/g, '-').toLowerCase(),
        content = req.body.content
        // if slug is empty
    if(slug == "") {slug = title.replace(/\s+/g, '-').toLowerCase()}

    let errors = req.validationErrors();
    if(errors) {
        // console.log(errors);
        res.render('admin/add_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        // if same slug already existed into the database
        // console.log('success' + title + "  ---  " + slug);
        Page.findOne({slug: slug}, (err, existedSlug) => {
            if(existedSlug) {
                req.flash('danger', 'Page slug exists Please choose any other..');
                res.render('admin/add_page', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                let page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save((err, result) => {
                    if(err) return console.log(err);
                    // console.log(result)
                    // below code is just for refreshing the global page var for frontend
                    Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.pages = pages;
                        }
                    });
                    req.flash('success', 'Page added');
                    res.redirect('/admin/pages');
                });
            }
        });
    }
});

// Sort pages function
function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (err, page) {
                page.sorting = count;
                page.save(function (err) {
                    if (err)
                        return console.log(err);
                    ++count;
                    if (count >= ids.length) {
                        callback();
                    }
                });
            });
        })(count);

    }
}

/*
 * POST reorder pages
 */
router.post('/reorder-pages', function (req, res) {
    var ids = req.body['id[]'];

    sortPages(ids, function () {
    // below code is just for refreshing the global page var for frontend
    // front end wale passe page refresh di problem lae..
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
    });

});


// get edit page
router.get('/edit-page/:id', (req, res) => {
    Page.findById(req.params.id, (err, page) => {
        if(err) return console.log(err);
        res.render('admin/edit_page', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

// post edit page
router.post('/edit-page/:id', (req, res) => {
    req.checkBody('title', 'title must have a value.').notEmpty();
    req.checkBody('content', 'COntent must have a value.').notEmpty();

    let title = req.body.title,
        slug = req.body.slug.replace(/\s+/g, '-').toLowerCase(),
        content = req.body.content,
        id = req.params.id;
        // if slug is empty
    if(slug == "") {slug = title.replace(/\s+/g, '-').toLowerCase()}

    let errors = req.validationErrors();
    if(errors) {
        // console.log(errors);
        res.render('admin/edit_page', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        // checking if same slug already existed into the database except the slug of nedded page
        // console.log('success' + title + "  ---  " + slug);
        Page.findOne({slug: slug, _id: {'$ne': id}}, (err, existedSlug) => {
            if(existedSlug) {
                req.flash('danger', 'Page slug exists Please choose any other..');
                res.render('admin/edit_page', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, (err, page) => {
                    if(err) return console.log(err);
                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                        page.save((err, result) => {
                        if(err) return console.log(err);
                        // console.log(result)
                        // below code is just for refreshing the global page var for frontend
                            Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    req.app.locals.pages = pages;
                                }
                            });
                        req.flash('success', 'Page Edited successfully');
                        res.redirect('/admin/pages/edit-page/' + page._id);
                    });
                });
            }
        });
    }
});

// get DElete page
router.get('/delete-page/:id', (req, res) => {
    Page.findByIdAndDelete(req.params.id, (err) => {
        if(err) return console.log(err);
        // below code is just for refreshing the global page var for frontend
        Page.find({}).sort({sorting: 1}).exec(function (err, pages) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.pages = pages;
            }
        });
        
        req.flash('success', 'succefully Deleted');
        res.redirect('/admin/pages');
    });
});



module.exports = router;