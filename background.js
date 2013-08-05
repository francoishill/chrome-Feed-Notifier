var Cache = {};

function updateFeed (feed) {
    $.ajax(feed.url, { dataType: 'xml' }).done(function (doc) {
        var oldCache = Cache[feed.url];
        var newCache = Cache[feed.url] = {};

        var $doc = $(doc);
        $doc.find('entry').each(function () {
            var $entry = $(this);

            var id = $entry.find('id').text();

            newCache[id] = true;
            if (oldCache && oldCache[id]) return;

            var url = $entry.find('link').attr('href');
            var notification = webkitNotifications.createNotification(
                $entry.find('thumbnail').attr('url'),
                feed.title || $doc.find('title:first').text(),
                $entry.find('title').text()
            );
            notification.onclick = function () {
                chrome.tabs.create({ url: url });
                notification.close();
            };
            notification.onshow = function () {
                // setTimeout(function () { notification.close() }, 5 * 1000);
            };

            notification.show();
        });
    }).fail(function (err) {
        console.error('updateFeed', err);
    });
}

function updateFeeds () {
    var urls = (localStorage['urls'] || '').split(/\n/);
    $.each(urls, function () {
        var feed = { url: this };
        var m = feed.url.match(/^([^#]+)#(.+)$/);
        if (m) {
            feed.url   = m[1];
            feed.title = m[2];
        }

        updateFeed(feed);
    });
}

updateFeeds();

setInterval(function () {
    updateFeeds();
}, 5 * 60 * 1000);
