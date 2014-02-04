var check = require('validator'),
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
		message: msg
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
	url = req.body.url;
	source = req.body.source;

	if (!check.isURL(url)) {
		respondErr(res);
		return;
	}

	// Is this url already in our db?
	db.get(url, function(err, reply) {
		
		// reply is null when the key is missing
		if (!reply) {
			
			// Generate unique (ish) token and save
			crypto.randomBytes(4, function(ex, buf) {
				var token = buf.toString('hex');
				db.set(url, token, redis.print);

				respondOk(res, token);
			});
		} else {
			respondOk(res, reply);
		}
	});
};
