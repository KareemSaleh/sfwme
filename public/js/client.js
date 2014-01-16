$(document).ready(function() {
	var input_url = $('#input-url');
	var btn_go = $('#btn-go');
	var div_options = $('#options');

	// Btn click
	btn_go.on('click', function() {
		input_url.addClass('loading');

		$.post("save", { url: $('#input-url').val(), source: "web" }, function(data, textStatus, jqXHR) {
			console.log("success");
		}).fail(function() {
			console.log("fail");
		}).always(function() {
			input_url.removeClass('loading');
		});
	});

	// On key Press show the options if something is in the field
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