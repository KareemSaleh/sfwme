var handleFailure = function() {

}

/*
 * Handle when the AJAX is successful
 */
var handleSuccess = function(data, textStatus, jqXHR) {
	var div_result = $('#result');

	div_result.fadeIn();

}

/*
 * Submit the URL to the SFWMe API
 */
var submitUrl = function(input_url, input_safe) {
	input_url.addClass('loading');

	$.post("save", { 
		url: input_url.val(), 
		safe: input_safe.val(), 
		source: "web" }, 
		handleSuccess)
	.fail(handleFailure)
	.always(function() {
		input_url.removeClass('loading');
	});
};

/*
 * jQuery Ready function
 */
$(document).ready(function() {
	var input_url = $('#input-url');
	var btn_go = $('#btn-go');
	var div_options = $('#options');
	var input_nsfw = $('#nsfw');

	// Init Bootstrap-switch (stylized checkboxes)
	input_nsfw.bootstrapSwitch();
	input_nsfw.bootstrapSwitch('setOnLabel', 'NSFW');
	input_nsfw.bootstrapSwitch('setOffLabel', 'SFW');

	// Btn click & Htting the enter button.
	btn_go.on('click', function() {
		submitUrl(input_url, input_nsfw);
	});
	input_url.keypress(function(e) {
		if (e.which == 13) {
			e.preventDefault();
			submitUrl(input_url, input_nsfw);
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