var validator = require('validator'),
	crypto = require('crypto'),
	redis = require('redis'),
	redisdb = redis.createClient(),
	mongodb = require('mongodb').MongoClient,
    format = require('util').format;

const BASE_URL = process.env.BASE_URL;
const IP_KEY_PREFIX = "ip_";

// Mongo Enviro Variables
var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : 27017;
 
// ---------------------------------------------------
// Private Methods
// ---------------------------------------------------
 
var respondOk = function(res, token, nsfw) {
	res.json({ 
		status: "OK",
		data: { 
			token: token,
			nsfw: nsfw,
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

var validatePost = function(res, url, nsfw, source) {
	if (!validator.isURL(url)) {
		respondErr(res, "Your URL seems to be Invalid.");
		return false;
	}

	if (!nsfw) {
		respondErr(res, "You seem to be missing the NSFW flag (See Docs).");
		return false;
	}

	if (!source) {
		respondErr(res, "Please specify a source to identify your app (See Docs).");
		return false;
	}

	if (isAlreadyShortened(url)) {
		respondErr(res, "Your URL seems to be already shortened. Why not use that link?");
		return false;
	}

	return true;
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
};

/**
 * Actually save data to our persistent DB.
 * 
 * @param  {string} token Unique token created for the purpose of key matching URL
 * @param  {string} url   The actual URL to redirect to or SFW
 * @param  {boolean} nsfw  true if link is NSFW
 */
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
};

var validateIP = function() {

}

var isAlreadyShortened = function(url) {
	var indexes = [ url.indexOf("http://" + BASE_URL),
					url.indexOf("https://" + BASE_URL),
					url.indexOf("http://www." + BASE_URL),
					url.indexOf("https://www." + BASE_URL),
					];
					
	for (var i = indexes.length - 1; i >= 0; i--) {
		if (indexes[i] == 0) {
			return true;
		}
	}

	return false;
};

var generateToken = function(res, url, nsfw) {
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

				respondOk(res, token, nsfw);
			});
		} else {
			console.log("CACHE: URL '" + url + "' with token '" + reply.token + "' exists in cache")
			respondOk(res, reply.token, reply.nsfw);
		}
	});
};


// ---------------------------------------------------
// Export Methods
// ---------------------------------------------------

/*
 * Index endpoint. Lets put some direction here
 */
exports.index = function(req, res) {
	res.render('api', { title: 'SFWMe API Guide' });
};

/*
 * Save endpoint. For saving a new URL if it doesnt exist.
 */
exports.save = function(req, res) {

	var url = req.body.protocol + req.body.url;
	var nsfw = req.body.nsfw;
	var source = req.body.source;
	var ip = req.ip;

	// Validate data
	if (!validatePost(res, url, nsfw, source)) {
		return;
	}

	// is this IP hammering
	ipkey = IP_KEY_PREFIX + ip;
	redisdb.get(ipkey, function(err, reply) {
		if (!reply || reply && reply < 10) {
			generateToken(res, url, nsfw);
			redisdb.incr(IP_KEY_PREFIX + ip);
		} else {
			respondErr(res, "You are doing that too many times. Wait a couple minutes.");
		}

		// Expire in 5 minutes
		redisdb.expire(ipkey, 300);
	});
};
