var redis = require('redis'),
	redisdb = redis.createClient(),
	mongodb = require('mongodb').MongoClient,
	format = require('util').format;

var adCollection = new Array(
		{ adUrl: "https://google.com/search?site=&tbm=isch&q=kittens", adText: "Show me Kittens!" },
		{ adUrl: "https://google.com/search?site=&tbm=isch&q=puppies", adText: "Show me Puppies!" }
	);

// Mongo Enviro Variables
var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : 27017;

var redirectMe = function(res, urlObj) {
	
	selectedAd = adCollection[Math.floor((Math.random()*2))];

	// Is it Safe For Work?
	if (urlObj.nsfw) {
		res.render('redirect', { title: 'SFWMe: NSFW!', url: urlObj.url, 
			adUrl: selectedAd.adUrl, adText: selectedAd.adText });
	} else if (urlObj.url) {
		res.redirect(urlObj.url);
	} else {
		res.redirect(process.env.BASE_URL);
	}
}

exports.index = function(req, res){
	res.render('index', { title: 'SFWMe' });
};

exports.popular = function(req, res){
	res.render('popular', { title: 'SFWMe' });
}

exports.about = function(req, res){
	res.render('about', { title: 'SFWMe' });
}

exports.redirect = function(req, res){
 	// Check if this URL exists in our cache
	redisdb.hgetall(req.params.token, function(err, reply) {

		// Reply is null when the key is missing. Check DB.
		if (!reply) {
			mongodb.connect(format("mongodb://%s:%s/", host, port), function(err, db) {
				if(err) throw err;

				var collection = db.collection('url_list');
				reply = collection.findOne({ token:req.params.token }, console.log);
				
				if (!reply) {
					res.render('404', { title: "Oops! 404 Not Found!" });
					return;
				}

				redirectMe(res, reply);
			});
		} else {
			redirectMe(res, reply);
		}
	});
};