function RSS ($doc) {
    this.$doc = $doc;
}

RSS.prototype = {
    title: function () {
        return this.$doc.find('channel > title').text();
    },
    entries: function () {
        return this.$doc.find('channel > item').map(function () {
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
            return this.url() + ' ' + this.$entry.find('date, pubDate').text();
        }
    },
    date: function() {
        return this.$entry.find('date, pubDate').text();
    },
    url: function () {
        return this.$entry.find('link').text();
    },
    title: function () {
        return this.$entry.find('title').text();
    },
    image: function () {
        return this.$entry.find('thumbnail').attr('url');
    }
};