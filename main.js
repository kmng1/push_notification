const path = require("path");
const webPush = require("web-push");
const bodyParser = require("body-parser");
const express = require("express");

const serverKey = "AAAA9-owCcU:APA91bHwveapdCUPCCBF8zJTF4upKhpBjnA9nmbAK_zLmX955bV6emuixlk8vLDXx2l6p-tfarthyvVpnUlMdUxKZuJIu7K1Vefjr8y-Ab4vn1vSOh2dIGgnbKb2IPVmm7d88U8dzIkg";

const app = express();
const vapidDetails = webPush.generateVAPIDKeys();

webPush.setGCMAPIKey(serverKey);
webPush.setVapidDetails("mailto:fred@acme.com", vapidDetails.publicKey, vapidDetails.privateKey);

console.log("public key: %s", vapidDetails.publicKey);
console.log("private key: %s", vapidDetails.privateKey);

const messageOptions = {
	gcmAPIKey: serverKey,
	vapidDetails: vapidDetails,
	TTL: 180
};

const regs = [];

app.use(bodyParser.json());

app.post("/register", function(req, res) {
	console.log("subscription: %s", req.body.subscription);
	var subscription = JSON.parse(req.body.subscription);
	regs.push({
		clientId: req.body.clientId,
		p256dh: subscription.keys.p256dh,
		auth: subscription.keys.auth,
		subscription: subscription
	});
	res.status(201).end();
});

app.get("/publickey", function(req, res) {
	res.type("text/plain");
	res.status(200);
	res.end(vapidDetails.publicKey);
});

app.get("/push", function(req, res) {

	console.info(">>> message: %s", req.query.message);

	var msgTemplate = {
		to: "",
		collapse_key: "abc",
		data: { key0: "some_pointer: " + new Date() },
		tag: { key0: "another link: " + new Date() },
		notification: {
			title: "You've got message",
			body: req.query.message,
			data: { key0: "some_pointer: " + new Date() },
		}
	}

	for (var i in regs) {
		var message = JSON.parse(JSON.stringify(msgTemplate));
		message.to = regs[i].clientId;
		console.log("Pushing to: %s", message.to);
		webPush.sendNotification(regs[i].subscription, JSON.stringify(message), messageOptions)
			.then(function(response) {
				console.info("---- pushed ----");
				res.status(201)
					.type("text/plain")
					.send(response);
				console.info("---- end ----");
			}).catch(function(err) {
				console.info("---- failed ----");
				console.error(">>> %s", err);
				res.status(400)
					.type("text/plain")
					.send(err);
				console.info("---- end ----");
			});
	}

});

app.use(express.static(path.join(__dirname, "public")));
app.use("/bower_components", express.static(path.join(__dirname, "bower_components")));

app.set("port", process.env.APP_PORT || 3000);

app.listen(app.get("port"), function() {
	console.info("Application started on port %d", app.get("port"));
});
