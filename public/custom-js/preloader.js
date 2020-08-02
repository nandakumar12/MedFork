$(document).ready(function () {
    setTimeout(function () {
        $("body").addClass("loaded");
        $("h1").css("color", "#222222");
    }, 500);
});
console.log("inside preloader")