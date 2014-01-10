var check = require('validator').check,
    sanitize = require('validator').sanitize;

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
	var status
	url = req.body.url;
	source = req.body.source;

	try {
		check(url).isUrl();
	} catch(err) {
		res.json({
			error: err
		});
		return;
	}

	// TODO: Generate unique hash and save

	res.json({
		status: "TODO Return Hash"
	});
};
