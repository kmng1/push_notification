var version = 2;
var cacheName = "notification-v" + version;
var fileList = [
	"/",
	"/index.html",
	"/index.js",
	"/images/notification.png",
	"/bower_components/jquery/dist/jquery.js",
	"/bower_components/angular/angular.js"
];

var dumpHeader = function(e) {
	for (var i in e)
		console.log("%s = %s", i, e[i]);
}

self.addEventListener("install", function(e) {
	console.info("[service-worker] install");
	e.waitUntil(
		caches.open(cacheName)
			.then(function(cache) {
				console.info("[service-worker] adding files");
				return (cache.addAll(fileList));
			})
	);
});

self.addEventListener("activate", function(e) {
	console.info("[service-worker] activate");
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return (Promise.all(keyList.map(function(key) {
				console.info("keys: %s", key);
				if (key != cacheName)
					caches.delete(key);
			})))
		})
	)
})

self.addEventListener("fetch", function(e) {
	//Pass through
	console.info("[service-worker] fetch: %s", e.request.url);
	e.respondWith(
		caches.match(e.request.url)
			.then(function(response) {
				return (response || fetch(e.request));
			})
	)
});

self.addEventListener("push", function(e) {
	console.info("[service-worker] push event ==========");
	var data = e.data.json();

	var options = {
		body: data.body || "*** This is a push message ***",
		icon: "images/notification.png",
		badge: "images/badge.png"
	};

	console.info(">>> data = ", data);

	dumpHeader(e);

	e.waitUntil(self.registration.showNotification("Push demo", options));
});

self.addEventListener("notificationclick", function(e) {
	console.info("[service-worker] clicked notification");

	dumpHeader(e);

	console.info("\n========================");

	dumpHeader(e.notification);

	e.notification.close();

});
