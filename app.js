
/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	api = require('./routes/api'),
	http = require('http'),
	path = require('path'),
	check = require('validator').check,
	compressor = require('node-minify');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon('public/img/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('ftNBUSAk4wGj'));
app.use(app.router);
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
} //else {

// Minify our client side JS
new compressor.minify({
	type: 'gcc',
	fileIn: 'public/js/client.js',
	fileOut: 'public/js/sfwme.min.js',
	callback: function(err, min){
		console.log("JS Minified");
	}
});

// Api routes
app.get('/api', api.index);
app.post('/save', api.save);

// Web routes
app.get('/', routes.index);
app.get('/popular', routes.popular);
app.get('/about', routes.about);
app.get('/:token', routes.redirect);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
