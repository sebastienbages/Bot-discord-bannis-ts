/* eslint-disable */
const Service = require("node-windows").Service;

// Create a new service object
const svc = new Service({
    name: 'Bot Discord',
    script: "E:\\Dépôt Perso\\Sébastien\\Coding\\Projets\\Bot-discord-bannis-ts\\bin\\src\\app.js",
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("uninstall", function() {
    console.log("Uninstall complete");
});

svc.uninstall();