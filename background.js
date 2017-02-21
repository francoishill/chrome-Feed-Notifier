var updateIntervalMinutes = 5;

var updateInterval = updateIntervalMinutes * 1000 * 60;
var Cache = localStorage['allCache'] ? JSON.parse(localStorage['allCache']) : {};

function updateFeed(config, options) {
  console.log('updateFeed', config);

  options = options || {};

  var url = config.url;
  var dataType = url.length > 0 && url.substring(url.lastIndexOf('.') + 1);

  var promise = new Promise(function (resolve, reject) {
    $.ajax(url, { dataType: dataType })
      .done(function (doc) {
        var oldCache = Cache[url];
        var newCache = Cache[url] = {};

        var $doc = $(doc);
        var feedType = $doc.find('feed:root').length ? Atom
          : $doc.find('RDF:root').length ? RSS
          : $doc.find('rss:root').length ? RSS
          : url.indexOf('coreos.com/releases/releases.json') !== -1 ? CoreOSReleasesJSON
          : null;

        if (!feedType) {
          reject('unknown feed type');
          console.error('updateFeed', 'unknown feed type', url, doc);
          return;
        }

        var feed = new feedType($doc);
        $.each(feed.entries(), function () {
          var entry = this;
          // console.log("entry", entry);

          var id = entry.id();
          newCache[id] = true;
          if (oldCache && oldCache[id]) return;

          if (options.dontNotify) return;

          var notificationOptions = {
            iconUrl: entry.image() || 'https://www.iconfinder.com/icons/341106/download/png/48',
            title: config.title || feed.title(),
            message: entry.title(),
            requireInteraction: true, //Since Chrome 50. Indicates that the notification should remain visible on screen until the user activates or dismisses the notification. This defaults to false.
            isClickable: true,
            type: 'basic',
            /*type: 'list',
            items: [
                { title: 'Title 1', message: 'Message 1'},
                { title: 'Title 2', message: 'Message 2'},
                { title: 'Title 3', message: 'Message 3'},
            ]*/
          };

          var additionalContext = {
            entryUrl: entry.url(),
          };

          showNewNotification(notificationOptions, additionalContext);
        });

        resolve({});
      })
      .fail(function (err) {
        console.error('updateFeed', config, err);
        reject(['updateFeed', config, err]);
      });
    });

    return promise;
}

function updateFeeds(options) {
  var urls = (localStorage['urls'] || '').split(/\n/);
  var promises = $.map(urls, function (url) {
    if (url.length === 0) return;

    var feed = { url: url };
    var m = feed.url.match(/^([^#]+)#(.+)$/);
    if (m) {
      feed.url = m[1];
      feed.title = m[2];
    }

    return updateFeed(feed, options);
  });

  Promise.all(promises)
    /*.then((results) => {
      console.log("ALL", results);
    })*/
    .catch((err) =>  {
      console.error("Failure(s)", err);
    })
    .then(() => {
      console.log("All feeds loaded, saving cache");
      localStorage['allCache'] = JSON.stringify(Cache);
      setTimeout(updateFeeds, updateInterval);
    });
}

// updateFeeds({ dontNotify: true });
updateFeeds();
