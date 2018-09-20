$("#scrape").on("click", function() {
    $.ajax({
        method: "GET",
        url: "/scrape"
    }).done(function(data) {
        console.log(data);
        window.location = "/"
    });
});

$("#submitbtn").on("click", function(event) {
    event.preventDefault();
    let thisId = $(".title").attr("data-id");

    $.ajax({
        method: "POST",
        url: "/article/" + thisId,
        data: {
            title: $("#title").val(),
            body: $("#body").val()
        }
    }).then(function(data) {
        console.log(data);
        
        $("#title").val("");
        $("#body").val("");
        location.reload();
    })
})