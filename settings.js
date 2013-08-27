jQuery.fn.contractWith = function (deferred, done) {
    var _this = this;
    deferred.done(function () { done.apply(_this, arguments) });
};

function loadOPML (url) {
    return $.ajax(url, {
        dataType: 'xml'
    }).pipe(function (doc) {
        return $(doc).find('outline').map(function () {
            return $(this).attr('xmlUrl');
        }).toArray();
    });
}

function toast (message) {
    var $toast = $('#toast');

    if ($toast.length === 0) {
        $toast = $('<div id="toast">').appendTo(document.body);
    }

    $toast.hide().text(message).fadeIn('fast');
    setTimeout(function () { $toast.fadeOut('fast') }, 1000);
}

$(function () {
    $('textarea#urls').val(localStorage['urls']);

    $('button#update').click(function () {
        localStorage['urls'] = $('textarea#urls').val();
    });
});

$(function () {
    var $dialog = $('#import-opml-dialog'),
        $form   = $dialog.find('form');

    $form.find('#opml-import').click(function () {
        $form.find('input, button').attr('disabled', true);

        var $opmlURL = $('#opml-url');
        loadOPML($opmlURL.val()).done(function (urls) {
            $('#urls').val(function (i, val) {
                return _.unique(val.split(/\n/).concat(urls)).join("\n");
            });
            $opmlURL.val('');
            toast('OPML loaded');
        }).fail(function () {
            toast('Loading OPML failed');
        }).always(function () {
            $dialog.data('dialog:mode').resolve();
            $form.find('input, button').attr('disabled', null);
        });

        return false;
    });
})

$(function () {
    $('[data-dialog]').click(function () {
        var dialogMode = $.Deferred();

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

        $background.click(function () {
            dialogMode.resolve();
        }).fadeIn('fast', $.proxy($dialog, 'trigger', 'dialog:show')).contractWith(
            dialogMode, function () { this.fadeOut('fast', $.proxy(this, 'remove')) }
        );

        $dialog.on('dialog:show', function () {
            $dialog.addClass('active')
                .contractWith(dialogMode, _.partial($.fn.removeClass, 'active'));

            $(this).find('input').focus();
        });

        $dialog.data('dialog:mode', dialogMode);
    });
});
