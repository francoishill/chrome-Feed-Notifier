function loadOPML (url) {
    return $.ajax(url, {
        dataType: 'xml'
    }).pipe(function (doc) {
        return $(doc).find('outline').map(function () {
            return $(this).attr('xmlUrl');
        }).toArray();
    });
}

jQuery.fn.contractWith = function (deferred, done) {
    var _this = this;
    deferred.done(function () { done.apply(_this, arguments) });
};

$(function () {
    $('textarea#urls').val(localStorage['urls']);

    $('button#update').click(function () {
        localStorage['urls'] = $('textarea#urls').val();
    });

    $('[data-dialog]').click(function () {
        var mode = $.Deferred();

        var $dialog = $($(this).attr('data-dialog'));
        var $background = $('<div>').css({
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            opacity: 0.75,
        }).hide().appendTo(document.body);

        $dialog.addClass('active')
            .contractWith(mode, _.partial($.fn.removeClass, 'active'));

        $background.click(function () {
            mode.resolve();
        }).fadeIn('fast', $.proxy($dialog, 'trigger', 'dialog:show')).contractWith(
            mode, _.partial($.fn.fadeOut, 'fast')
        );

        $dialog.on('dialog:show', function () { $(this).find('input').focus() });

        $dialog.data('dialog:mode', mode);
    });

    $('#import-opml-dialog').each(function () {
        var $dialog = $(this);

        $dialog.find('form').each(function () {
            var $form = $(this);

            $form.find('#opml-import').click(function () {
                $form.find('input, button').attr('disabled', true);

                var $opmlURL = $('#opml-url');
                loadOPML($opmlURL.val()).done(function (urls) {
                    $('#urls').val(function (i, val) {
                        return val.split(/\n/).concat(urls).join("\n");
                    });
                    $opmlURL.val('');
                }).fail(function () {
                    alert('Loading OPML failed');
                }).always(function () {
                    $dialog.data('dialog:mode').resolve();
                    $form.find('input, button').attr('disabled', null);
                });
                return false;
            });
        });
    });
})
