function Atom($doc) {
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
    date: function () {
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