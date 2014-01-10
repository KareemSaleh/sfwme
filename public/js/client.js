$(document).ready(function() {
	
	// Btn click
	$('#btn-go').on('click', function() {
		$.post("save", { url: $('#input-url').val(), source: "web" }, function(data, textStatus, jqXHR) {
			console.log("success");
		}).fail(function() {
			console.log("fail");
		})
	});
});