function CoreOSReleasesJSON ($doc) {
    this.$doc = $doc;
}

CoreOSReleasesJSON.prototype = {
    title: function () {
        return 'CoreOS Releases';
    },
    entries: function () {
        var entriesMap = this.$doc[0];
        return $.map(this.$doc[0], function (val, key) {
            val['version_number'] = key;
            return new CoreOSReleasesJSON.Entry(val);
        });
    }
};


CoreOSReleasesJSON.Entry = function ($entry) {
    this.$entry = $entry;
}

CoreOSReleasesJSON.Entry.prototype = {
    id: function () {
        return this.$entry.version_number;
    },
    url: function () {
        return 'https://coreos.com/releases/#' + this.$entry.version_number;
    },
    date: function() {
        return this.$entry.release_date;
    },
    title: function () {
        var fields = [
            // { field: 'Date', value: this.$entry.release_date }, // date already returned above
            { field: 'Kernel', value: this.$entry.major_software.kernel },
            { field: 'Docker', value: this.$entry.major_software.docker },
            { field: 'Etcd', value: this.$entry.major_software.etcd },
            { field: 'Fleet', value: this.$entry.major_software.fleet },
        ]
        var combinedFields = fields.map(f => f.field + ': ' + f.value).join('\n');
        return 'CoreOS version ' + this.$entry.version_number + '\n' + combinedFields;
    },
    image: function () {
        return 'https://coreos.com/assets/ico/favicon.png';
    }
};