var express = require('express'),
    router = express.Router();

// requiring category model
var Category = require('../models/category');


// getting index page
router.get('/', (req, res) => {
    Category.find({}, (err, categories) => {
        if(err) return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

// get add page
router.get('/add-category', (req, res) => {
    const title = "";
    res.render('admin/add_category', {
        title: title
    });
});

// Post add category
router.post('/add-category', (req, res) => {
    req.checkBody('title', 'title must have a value.').notEmpty();

    let title = req.body.title,
        slug = title.replace(/\s+/g, '-').toLowerCase();

    let errors = req.validationErrors();
    if(errors) {
        // console.log(errors);
        res.render('admin/add_category', {
            errors: errors,
            title: title,
        });
    } else {
        // check if same category already existed into the database with the help of slug
        Category.findOne({slug: slug}, (err, existedSlug) => {
            if(existedSlug) {
                req.flash('danger', 'Category Title exists Please choose any other..');
                res.render('admin/add_category', {
                    title: title,
                });
            } else {
                let category = new Category({
                    title: title,
                    slug: slug,
                });
                category.save((err, result) => {
                    if(err) return console.log(err);
                    // console.log(result)
                    // Frontend stuff
                    Category.find({}, (err, categories) => {
                        if(err) {
                            console.log(err);
                        }
                        else{
                            req.app.locals.categories = categories;
                        }
                    });

                    req.flash('success', 'Category added');
                    res.redirect('/admin/categories');
                });
            }
        });
    }
});


// get edit page
router.get('/edit-category/:id', (req, res) => {
    Category.findById(req.params.id, (err, category) => {
        if(err) return console.log(err);
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id 
        });
    });
});

// post edit page
router.post('/edit-category/:id', (req, res) => {
    req.checkBody('title', 'title must have a value.').notEmpty();

    let title = req.body.title,
        slug = title.replace(/\s+/g, '-').toLowerCase(),
        id = req.params.id;

    let errors = req.validationErrors();
    if(errors) {
        // console.log(errors);
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        // checking if same slug already existed into the database except the slug of nedded page
        // console.log('success' + title + "  ---  " + slug);
        Category.findOne({slug: slug, _id: {'$ne': id}}, (err, existedSlug) => {
            if(existedSlug) {
                req.flash('danger', 'Category Title exists Please choose any other..');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, (err, category) => {
                    if(err) return console.log(err);
                    category.title = title;
                    category.slug = slug;

                    category.save((err, result) => {
                        if(err) return console.log(err);
                        // console.log(result)
                        // Frontend stuff
                        Category.find({}, (err, categories) => {
                            if(err) {
                                console.log(err);
                            }
                            else{
                                req.app.locals.categories = categories;
                            }
                        });
                        
                        req.flash('success', 'Category Edited successfully');
                        res.redirect('/admin/categories/edit-category/' + category.id);
                    });
                });
            }
        });
    }
});

// get DElete category
router.get('/delete-category/:id', (req, res) => {
    Category.findByIdAndDelete(req.params.id, (err) => {
        if(err) return console.log(err);
        // Frontend stuff
        Category.find({}, (err, categories) => {
            if(err) {
                console.log(err);
            }
            else{
                req.app.locals.categories = categories;
            }
        });

        req.flash('success', 'succefully Deleted');
        res.redirect('/admin/categories');
    });
});



module.exports = router;