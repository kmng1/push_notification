(function() {
	var WebPushApp = angular.module("WebPushApp", []);

	var WebPushSvc = function($http) {

		var webPushSvc = this;

		webPushSvc.vapidPublicKey = null;

		webPushSvc.base64ToUintArray = function(base64String) {
			//Copied from https://github.com/web-push-libs/web-push
			var padding = '='.repeat((4 - base64String.length % 4) % 4);
  			var base64 = (base64String + padding)
    			.replace(/\-/g, '+')
    			.replace(/_/g, '/');

  			var rawData = window.atob(base64);
  			var outputArray = new Uint8Array(rawData.length);

  			for (var i = 0; i < rawData.length; ++i)
    			outputArray[i] = rawData.charCodeAt(i);
  			return outputArray;
		}

		webPushSvc.getApplicationKey = function() {
			$http.get("/publickey")
				.then(function(result) {
					console.info(">> public key = %s", result.data);
					webPushSvc.vapidPublicKey = webPushSvc.base64ToUintArray(result.data);
				});
		}

		webPushSvc.register = function(subscription) {
			var clientId = subscription.endpoint.split("gcm/send/")[1];
			return ($http.post("/register", { clientId: clientId, subscription: JSON.stringify(subscription) }))
		}
	}

	var WebPushCtrl = function($scope, $http, WebPushSvc) {
		var webPushCtrl = this;

		webPushCtrl.endpoint = "not registered";
		webPushCtrl.p256dh = "not registered";
		webPushCtrl.auth = "not registered";

		webPushCtrl.register = function() {
			navigator.serviceWorker.ready
				.then(function(registration) { 
					return (registration.pushManager.getSubscription()); 

				}).then(function(subscription) {
					if (!subscription)
						return (navigator.serviceWorker.ready); 
					return (subscription);

				}).then(function(registration) {
					if (registration.pushManager)
						return (registration.pushManager.subscribe({
							userVisibleOnly: true,
							applictionServerKey: WebPushSvc.vapidPublicKey
						}));
					return (registration);

				}).then(function(subscription) {
					var clientId = subscription.endpoint.split("gcm/send/")[1];
					var sub = subscription.toJSON();
					console.log(">> sub: %s", JSON.stringify(sub));
					$scope.$apply(function() {
						webPushCtrl.endpoint = clientId;
						webPushCtrl.p256dh = sub.keys.p256dh || "";
						webPushCtrl.auth = sub.keys.auth || "";
					});
					return ($http.post("/register", { clientId: clientId, subscription: JSON.stringify(sub) }))

				}).then(function() {
					$scope.$apply(function() {
						console.info("Registered");
					});
				});
		};

		WebPushSvc.getApplicationKey();

	}

	WebPushApp.service("WebPushSvc", [ "$http", WebPushSvc ]);

	WebPushApp.controller("WebPushCtrl", [ "$scope", "$http", "WebPushSvc", WebPushCtrl ]);
})();
