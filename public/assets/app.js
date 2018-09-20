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

$("#delete").on("click", function() {
    let comment_id = $(".comment").attr("data-id");
    let article_id = $(".title").attr("data-id")
    $.ajax({
        method: "DELETE",
        url: "/article/" + article_id + "/comment/" + comment_id
    }).then(function(data) {
        console.log(data);
        location.reload();
    })
})