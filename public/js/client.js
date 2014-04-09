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
	var inputs = $('#input-url, #nsfw, #btn-go');

	// Populate the redirect
	if (data.status == "OK") {
		div_redirect_url.text(data.data.base + "/" + data.data.token);
		div_result.fadeIn();
		toggleError("", false);
	} else {
		toggleError(data.msg, true);
	}
};

var validateProtocol = function(url) {
	var input_url = $('#input-url'),
		protocol = $('#protocol');

	if (url.indexOf('http://') != -1) {
		input_url.val(url.replace('http://', ''));
		protocol.text('http://');
	} else if (url.indexOf('https://') != -1) {
		input_url.val(url.replace('https://', ''));
		protocol.text('https://');
	}
}

/*
 * Submit the URL to the SFWMe API
 */
var submitUrl = function(input_url, nsfw, protocol) {
	input_url.addClass('loading');

	$.post("save", {
		url: input_url.val(), 
		nsfw: nsfw, 
		source: "web",
		protocol: protocol }, 
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
	var input_url = $('#input-url'),
		btn_go = $('#btn-go'),
		div_options = $('#options'),
		input_nsfw = $('#nsfw'),
		protocol = $('#protocol'),
		nav = $('.nav > li');

	// Update the navigation bar to reflect the page we're on
	var pathname = window.location.pathname;
	switch (pathname.toLowerCase()) {
		case '/about':
			$('#nav_about').addClass('active');
			break;
		default:
			$('#nav_home').addClass('active');
	}

	// Init Bootstrap-switch (stylized checkboxes)
	input_nsfw.bootstrapSwitch();
	input_nsfw.bootstrapSwitch('setOnLabel', 'NSFW');
	input_nsfw.bootstrapSwitch('setOffLabel', 'SFW');

	// Btn click & Htting the enter button.
	btn_go.on('click', function() {
		submitUrl(input_url, input_nsfw.is(':checked'), protocol.text());
	});
	input_url.keypress(function(e) {
		if (e.which == 13) {
			e.preventDefault();
			submitUrl(input_url, input_nsfw.is(':checked'), protocol.text());
		} else {
			toggleError("", false);
		}
	});

	// On key Up show the options if something is in the field
	input_url.keyup(function(e) {
		var value = $(this).val();

		validateProtocol(value);

		if (value && value.length > 0 && e.which != 13) {
			div_options.removeClass('hidden');
			div_options.fadeIn();
			btn_go.removeClass('disabled');
			$('#error-msg, #result').hide();
		} else {
			div_options.addClass('hidden');
		}
	});
});