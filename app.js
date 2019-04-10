var express = require('express'),
    app     = express(),
    path    = require('path'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    expressValidator = require ('express-validator'),
    mongoose = require('mongoose'),
    fileUpload = require('express-fileupload');

// Requiring the routes
var pages = require('./routes/pages');
var admin_pages = require('./routes/admin_pages');
var admin_categories = require('./routes/admin_categories');
var admin_products = require('./routes/admin_products');
var products = require('./routes/products');

// Connecting to  mongo db
mongoose.connect('mongodb://localhost/clgsite', {useNewUrlParser: true});
mongoose.connection.on('error', console.error.bind(console, 'connection error'));
mongoose.connection.once('open', () => {
    console.log('-------Mongo database conneted!!----------')
})

// initialising app
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Setting body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// setting the static file folder
app.use(express.static(path.join(__dirname, 'public')));

// Setting express session
app.use(session({
    secret: 'Dhall',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
  }));

// Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function(value, filename) {
            var extentions = (path.extname(filename)).toLocaleLowerCase();
            switch(extentions) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// Setting express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// global error variable
app.locals.errors = null;

// Express file uploader setting
app.use(fileUpload());

// Using the routes
app.use('/', pages);
app.use('/admin/pages', admin_pages);
app.use('/admin/categories', admin_categories);
app.use('/admin/products', admin_products);
app.use('/products/all', products);

// FrontEnd syncing..........
// Get page model
var Page = require('./models/page');

// Get all pages to pass to header.ejs

    Page.find({}).sort({sorting: 1}).exec((err, pages) => {
        if(err) {
            console.log(err);
        }
        else{
            app.locals.pages = pages;
    }
    });

    // Get category model
var Category = require('./models/category');

// Get all Category to pass to header.ejs
    Category.find({}, (err, categories) => {
        if(err) {
            console.log(err);
        }
        else{
            app.locals.categories = categories;
        }
    });




// 404 Route
app.get('*', (req, res) => {
    res.send("-----404 Page Not Found-------")
})
// App starting config
app.listen(3001, ()=>{
    console.log('--------Server started at port 3001----------')
})