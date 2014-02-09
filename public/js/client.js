/*
 * Deals with dispaying the error or hiding it
 */
var toggleError = function(msg, on) {
	var div_error = $('#error-msg');
	var span_msg = $('#error-msg span');

	if (on) {
		span_msg.text(msg);
		div_error.fadeIn();
	} else {
		div_error.hide();
	}
};

/*
 * Handle when the AJAX fails
 */
var handleFailure = function() {
	toggleError("Something has gone terribly wrong.", true);
};

/*
 * Handle when the AJAX is successful
 */
var handleSuccess = function(data, textStatus, jqXHR) {
	var div_result = $('#result');
	var div_redirect_url = $('#redirect-url');


	// Populate the redirect
	if (data.status == "OK") {
		div_redirect_url.text(data.data.token);
		div_result.fadeIn();
		toggleError("", false);
	} else {
		toggleError(data.msg, true);
	}
};

/*
 * Submit the URL to the SFWMe API
 */
var submitUrl = function(input_url, nsfw) {
	input_url.addClass('loading');

	$.post("save", {
		url: input_url.val(), 
		nsfw: nsfw, 
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
		submitUrl(input_url, input_nsfw.is(':checked'));
	});
	input_url.keypress(function(e) {
		if (e.which == 13) {
			e.preventDefault();
			submitUrl(input_url, input_nsfw.is(':checked'));
		} else {
			toggleError("", false);
		}
	});

	// On key Up show the options if something is in the field
	input_url.keyup(function() {
		var value = $(this).val();
		if(value && value.length > 0) {
			div_options.removeClass('hidden');
			div_options.fadeIn();
			btn_go.removeClass('disabled');
		} else {
			div_options.fadeOut();
			btn_go.addClass('disabled');
		}
	});
});