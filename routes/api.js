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
	// TODO: Add Expirations
	redisdb.hmset(url, { nsfw: nsfw, token:token }, redis.print); // For fast autocomplete
	redisdb.hmset(token, { url: url, nsfw: nsfw }, redis.print); // For fast redirecting
}

var saveIt = function(token, url, nsfw) {

	mongodb.connect(format("mongodb://%s:%s/", host, port), function(err, db) {
		if(err) throw err;

		var collection = db.collection('urls');
		collection.update({url: url}, {$set: {nsfw: nsfw, token: token}}, {w:1, safe:true, upsert:true}, function(err) {
			if (err) {
				console.log(err);
			}
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
	res.send("API Documentation coming soon.");
};

/*
 * Save endpoint. For saving a new URL if it doesnt exist.
 */
exports.save = function(req, res) {

	// Validate data
	var url = req.body.protocol + req.body.url;
	var nsfw = req.body.nsfw;
	var source = req.body.source;

	if (!validator.isURL(url)) {
		respondErr(res, "Your URL seems to be Invalid.");
		return;
	}

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
			console.log("CACHE: URL '" + url + "' with token '" + reply.token + "' exists in cache")
			respondOk(res, reply.token);
		}
	});
};
