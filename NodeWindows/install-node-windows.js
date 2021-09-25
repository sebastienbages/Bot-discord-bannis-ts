/* eslint-disable */
const Service = require("node-windows").Service;

// Create a new service object
const svc = new Service({
  name: 'Bot Discord',
  description: 'Bot discord de test des Bannis',
  script: 'E:\\Dépôt Perso\\Sébastien\\Coding\\Projets\\Bot-discord-bannis-ts\\bin\\src\\app.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  wait: 2,
  grow: .5,
  maxRestarts: 10,
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("install", function() {
  svc.start();
});

svc.install();