var express = require('express'),
    router = express.Router(),
    mkdirp = require('mkdirp'),
    fs = require('fs-extra'),
    resizeImg = require('resize-img');

// requiring product model
var Product = require('../models/product');
// requiring category model
var Category = require('../models/category');


// getting index page
router.get('/', (req, res) => {
    // let count;

    // Product.countDocuments((err, c) => {
    //     count = c;
    // });

    Product.find({}, (err, products) => {
        if(err) return console.log(err);
        // console.log("length============" + products.length);

        res.render('admin/products', {
            products: products,
        });
    });
});

// get add product
router.get('/add-product', (req, res) => {
    const title = "",
          desc = "",
          price = "";

    Category.find({}, (err, categories) => {
        if(err) return console.log(err);

        res.render('admin/add_product', {
            title: title,
            desc: desc,
            categories: categories,
            price: price
        });
    });
});

// Post add product
router.post('/add-product', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});



// get edit product
router.get('/edit-product/:id', (req, res) => {

    var errors;
    if(req.session.errors) errors = req.session.errors;

    Category.find({}, (err, categories) => {
        if(err) return console.log(err);
        Product.findById(req.params.id, (err, product) => {
            if(err){
                console.log(err);
                res.redirect('/admin/products');
            } 
            else {
                let gallaryDir = 'public/product_images/' + product._id + '/gallery';
                let gallaryImages = null;

                fs.readdir(gallaryDir, (err, files) => {
                    if(err){ console.log(err) }
                    else {
                        gallaryImages = files;
                        res.render('admin/edit_product', {
                            errors:errors,
                            title: product.title,
                            price: product.price,
                            id: product._id,
                            desc: product.desc,
                            categories:categories,
                            category: product.category.replace(/\s+/g, '-').toLowerCase(),
                            image: product.image,
                            galleryImages: gallaryImages
                        });
                    }
                });
            }
        });
    });
    
});

// post edit page
router.post('/edit-product/:id', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({slug: slug, _id: {'$ne': id}}, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });

                });
            }
        });
    }

});

/*
 * GET delete image
 */
// router.get('/delete-image/:image', function (req, res) {

//     var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
//     var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

//     fs.remove(originalImage, function (err) {
//         if (err) {
//             console.log(err);
//         } else {
//             fs.remove(thumbImage, function (err) {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     req.flash('success', 'Image deleted!');
//                     res.redirect('/admin/products/edit-product/' + req.query.id);
//                 }
//             });
//         }
//     });
// });

/*
 * GET delete product
 */
router.get('/delete-product/:id', function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        }
    });

});



module.exports = router;