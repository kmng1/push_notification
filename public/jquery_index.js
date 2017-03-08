$(function() {
	console.info("Application started");

	checkNotification();

	$("#regButton").on("click", function() {
		console.log(">> click: %s", new Date());
		navigator.serviceWorker.ready
			.then(function(registration) {
				return (registration.pushManager.getSubscription());
			})
			.then(function(subscription) {
				console.log(">> subscription: %s", subscription);
				if (!subscription)
					return (navigator.serviceWorker.ready)
			})
			.then(function(registration) {
				console.info("subscribing to push");
				return (registration.pushManager.subscribe({
					userVisibleOnly: true
				}));
			})
			.then(function(subscription) {
				var gcmRegId = subscription.endpoint.split("gcm/send")[1];
				console.info(">> subscription: %s", subscription.endpoint);
			})
			.catch(function(err) {
				console.error("Push registration error: %s", err);
			});
	});
});

var checkNotification = function() {

	console.info("Notification permission: %s", Notification.permission);

	switch (Notification.permission) {
		case "granted":
			console.info("Permission granted");
			break;

		case "denied":
			console.info("Permission denied");
			break;

		default:
			Notification.requestPermission(function(permission) {
				console.info("User has granted permission: %s", permission);
			});
	}
}
