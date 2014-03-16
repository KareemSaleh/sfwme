var validator = require('validator'),
	crypto = require('crypto'),
	redis = require('redis'),
	redisdb = redis.createClient(),
	mongodb = require('mongodb').MongoClient,
    format = require('util').format;

const BASE_URL = process.env.BASE_URL;

// Mongo Enviro Variables
var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : 27017;
 
// ---------------------------------------------------
// Private Methods
// ---------------------------------------------------
 
var respondOk = function(res, token) {
	res.json({ 
		status: "OK",
		data: { 
			token: token,
			base: BASE_URL
		}
	});
};

var respondErr = function(res, msg) {
	res.json({
		status: "error",
		msg: msg
	});
};

/**
 * Save to redis cache for quick retrieval later. We save two entries: One where
 * the URL is the key and the other where the token is the key for quick reference.
 * 
 * @param  {string} 	token Hex string that uniquely identifies this entry
 * @param  {string} 	url   url being shortened
 * @param  {boolean} 	nsfw  true if this lnk is NSFW
 */
var cacheIt = function(token, url, nsfw) {
	redisdb.hmset(url, {nsfw: nsfw, token:token}, redis.print);
	redisdb.hmset(token, {url: url}, redis.print);
}

var saveIt = function(token, url, nsfw) {

console.log(host);
console.log(port);
	mongodb.connect(format("mongodb://%s:%s/", host, port), function(err, db) {
		if(err) throw err;

		var collection = db.collection('test_insert');
		collection.insert({a:2}, function(err, docs) {

			collection.count(function(err, count) {
				console.log(format("count = %s", count));
			});

			// Locate all the entries using find
			collection.find().toArray(function(err, results) {
				console.dir(results);
				// Let's close the db
				db.close();
			});
		});
	});
}


// ---------------------------------------------------
// Export Methods
// ---------------------------------------------------

/*
 * Index endpoint. Lets put some direction here
 */
exports.index = function(req, res) {
	res.send("respond with a index");
};

/*
 * Save endpoint. For saving a new URL if it doesnt exist.
 */
exports.save = function(req, res) {

	// Validate data
	var url = req.body.url;
	var nsfw = req.body.nsfw;
	var source = req.body.source;

	if (!validator.isURL(url)) {
		respondErr(res, "Your URL seems to be Invalid.");
		return;
	}

	url = url.toLowerCase();

	// Is this url already in our db?
	redisdb.hgetall(url, function(err, reply) {

		// reply is null when the key is missing
		if (!reply) {
			// Generate unique (ish) token and save
			crypto.randomBytes(3, function(ex, buf) {
				var token = buf.toString('hex');
				try {
					saveIt(token, url, nsfw);
					cacheIt(token, url, nsfw);
				} catch (e) {
					console.log("Failed to save url: " + url + "error: " + e);
				}

				respondOk(res, token);
			});
		} else {
			respondOk(res, reply.token);
		}
	});
};
