$(function () {
    $('textarea#urls').val(localStorage['urls']);

    $('button#update').click(function () {
        localStorage['urls'] = $('textarea#urls').val();
    });
});
