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
	var redirect_result = $('#input-redirect-result');
	var inputs = $('#input-url, #nsfw, #btn-go');

	// Populate the redirect
	if (data.status == "OK") {
		redirect_result.val(data.data.base + "/" + data.data.token);
		if (data.data.nsfw == 'true') {
			redirect_result.removeClass('sfw');
			redirect_result.addClass('nsfw');
		} else {
			redirect_result.removeClass('nsfw');
			redirect_result.addClass('sfw');
		}
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
 * Reset the alert for the result
 */
var resetAlert = function() {
	$('#result-alert').html('Below is your shortened URL! Copy to share!');
	$('#result-alert').removeClass('alert-success');
	$('#result-alert').addClass('alert-info');
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

	// zClip Config
	$('#copy-url-btn').zclip({ 
		path: '//cdnjs.cloudflare.com/ajax/libs/zclip/1.1.2/ZeroClipboard.swf', 
		copy: function() { return $('#input-redirect-result').val(); },
		afterCopy: function() {
			$('#result-alert').html('Copied!');
			$('#result-alert').removeClass('alert-info');
			$('#result-alert').addClass('alert-success');
		}
	});

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
		div_options.addClass('hidden');
		submitUrl(input_url, input_nsfw.is(':checked'), protocol.text());
		resetAlert();
	});
	input_url.keypress(function(e) {
		if (e.which == 13) {
			e.preventDefault();
			submitUrl(input_url, input_nsfw.is(':checked'), protocol.text());
		} else {
			toggleError("", false);
		}
		resetAlert();
	});

	// On key Up show the options if something is in the field
	input_url.keyup(function(e) {
		var value = $(this).val();

		validateProtocol(value);

		if (value.length == 0) {
			btn_go.addClass('disabled');
			div_options.removeClass('hidden');
		} else if (e.which != 13) {
			div_options.removeClass('hidden');
			div_options.fadeIn();
			btn_go.removeClass('disabled');
			$('#error-msg, #result').hide();
		} else if (e.which == 13) {
			div_options.addClass('hidden');
		} 
	});
});