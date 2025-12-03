console.log("Worker started...");

// Keep the process alive
setInterval(() => {
    console.log("Worker heartbeat");
}, 10000);
