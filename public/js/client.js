
/*
 * Submit the URL to the SFWMe API
 */
var submitUrl = function(input_url) {
	input_url.addClass('loading');

	$.post("save", { url: input_url.val(), source: "web" }, function(data, textStatus, jqXHR) {
		console.log("Success:");
		console.log(data);
	}).fail(function() {
		console.log("Fail:");
		console.log(jqXHR);
	}).always(function() {
		input_url.removeClass('loading');
	});
};

/*
 * jQery Ready function
 */
$(document).ready(function() {
	var input_url = $('#input-url');
	var btn_go = $('#btn-go');
	var div_options = $('#options');

	// Btn click & Htting the enter button.
	btn_go.on('click', function() {
		submitUrl(input_url);
	});
	input_url.keypress(function(e) {
		if (e.which == 13) {
			e.preventDefault();
			$("form").submit();
			submitUrl(input_url);
		}
	});

	// On key Up show the options if something is in the field
	input_url.keyup(function() {
		var value = $(this).val();
		if(value && value.length > 0) {
			div_options.removeClass('hidden');
			div_options.fadeIn();
		} else {
			div_options.fadeOut();
		}
	});
});