// When you click the savenote button
$(document).on("click", "#comment", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/comment/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
    });
});



$("#showComments").on("click", function() {

	var thisId = $(this).attr("data-id");

	$.ajax({
		method: "GET",
		url: "/article/" + thisId,
	}).done(function(data) {
		console.log(data);

		$("#commentSection").val(data.comment.body);
	});
});