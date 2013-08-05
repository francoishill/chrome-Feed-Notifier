var Cache = {};

function Atom ($doc) {
    this.$doc = $doc;
}

Atom.prototype = {
    title: function () {
        return this.$doc.find('title:first').text();
    },
    entries: function () {
        return this.$doc.find('entry').map(function () {
            return new Atom.Entry($(this));
        });
    }
};

Atom.Entry = function ($entry) {
    this.$entry = $entry;
};

Atom.Entry.prototype = {
    id: function () {
        return this.$entry.find('id').text();
    },
    url: function () {
        return this.$entry.find('link').attr('href');
    },
    title: function () {
        return this.$entry.find('title').text();
    },
    image: function () {
        return this.$entry.find('thumbnail').attr('url')
    }
};

function RSS ($doc) {
    this.$doc = $doc;
}

RSS.prototype = {
    title: function () {
        return this.$doc.find('channel title').text();
    },
    entries: function () {
        return this.$doc.find('item').map(function () {
            return new RSS.Entry($(this));
        });
    }
};


RSS.Entry = function ($entry) {
    this.$entry = $entry;
}

RSS.Entry.prototype = {
    id: function () {
        var $guid = this.$entry.find('guid');
        if ($guid.length > 0) {
            return $guid.text();
        } else {
            return this.url() + ' ' + this.$entry.find('date').text();
        }
    },
    url: function () {
        return this.$entry.find('link').text();
    },
    title: function () {
        return this.$entry.find('title').text();
    },
    image: function () {
        return null;
    }
};

function updateFeed (config) {
    console.log('updateFeed', config);

    $.ajax(config.url, { dataType: 'xml' }).done(function (doc) {
        var oldCache = Cache[config.url];
        var newCache = Cache[config.url] = {};

        var $doc = $(doc);
        var feedType = $doc.find('feed:root').length ? Atom
                     : $doc.find('RDF:root').length  ? RSS
                     : null;

        if (!feedType) {
            console.error('updateFeed', 'unknown feed type', doc);
            return;
        }

        var feed = new feedType($doc);
        $.each(feed.entries(), function () {
            var entry = this;

            var id = entry.id();
            newCache[id] = true;
            if (oldCache && oldCache[id]) return;

            var notification = webkitNotifications.createNotification(
                entry.image(),
                config.title || feed.title(),
                entry.title()
            );
            notification.onclick = function () {
                chrome.tabs.create({ url: entry.url() });
                notification.close();
            };
            notification.onshow = function () {
                // setTimeout(function () { notification.close() }, 5 * 1000);
            };

            notification.show();
        });
    }).fail(function () {
        console.error('updateFeed', config);
    });
}

function updateFeeds () {
    var urls = (localStorage['urls'] || '').split(/\n/);
    $.each(urls, function () {
        var url = ''+this;
        if (this.length === 0) return;

        var feed = { url: url };
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
