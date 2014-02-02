var check = require('validator').check,
	sanitize = require('validator').sanitize,
	crypto = require('crypto'),
	redis = require('redis'),
	db = redis.createClient();
 
// ---------------------------------------------------
// Private Methods
// ---------------------------------------------------
 
var respond = function(res, token) {
	res.json({
		url: "http://sfwme.com/" + token
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
	var status;
	url = req.body.url;
	source = req.body.source;

	try {
		check(url).isUrl();
	} catch(err) {
		// 422 Unprocessable Entity
		res.status(422).json({
			error: err
		});
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

				respond(res, token);
			});
		} else {
			respond(res, reply);
		}
	});
};
