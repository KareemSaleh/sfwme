
/**
 * Module dependencies.
 */

var express = require('express'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	errorHandler = require('errorhandler'),
	bodyParser = require('body-parser'),

	routes = require('./routes'),
	api = require('./routes/api'),
	http = require('http'),
	path = require('path'),
	check = require('validator').check,
	compressor = require('node-minify'),
	monitor = require('monitor');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public/img/favicon.ico')));
app.use(bodyParser());
app.use(logger('dev'));
app.use(methodOverride());
app.use(cookieParser('ftNBUSAk4wGj'));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
monitor.start();

// development only
if ('development' == app.get('env')) {
	app.use(errorHandler());
} //else {

// Minify our client side JS
new compressor.minify({
	type: 'gcc',
	fileIn: 'public/js/client.js',
	fileOut: 'public/js/sfwme.min.js',
	callback: function(err, min){
		if (err) {
			console.log("Error minifying JS: " + err);
		} else {
			console.log("JS Minified");
		}
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
