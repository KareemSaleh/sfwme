
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'SFWMe' });
};

exports.popular = function(req, res){

}

exports.about = function(req, res){

}

exports.redirect = function(req, res){
 	// TODO: Check if this URL exists in our storage

	// TODO: Is it Safe For Work?

	// TODO: If it exists redirect and log the hit

	// TODO: Fetch the 

	res.send("Redirect");
};