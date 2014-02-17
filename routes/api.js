var validator = require('validator'),
	crypto = require('crypto'),
	redis = require('redis'),
	db = redis.createClient();
 
// ---------------------------------------------------
// Private Methods
// ---------------------------------------------------
 
var respondOk = function(res, token) {
	res.json({ 
		status: "OK",
		data: { 
			token: token
		}
	});
};

var respondErr = function(res, msg) {
	res.json({
		status: "error",
		msg: msg
	});
};

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

	// Is this url already in our db?
	db.hgetall(url, function(err, reply) {
		
		// reply is null when the key is missing
		if (!reply) {
			// Generate unique (ish) token and save
			crypto.randomBytes(3, function(ex, buf) {
				var token = buf.toString('hex');
				db.hmset(url, {nsfw: nsfw, token:token}, redis.print);

				respondOk(res, token);
			});
		} else {
			respondOk(res, reply.token);
		}
	});
};
