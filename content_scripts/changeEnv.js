(() => {
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    function changeURL(env) {
        window.location.href = env + window.location.pathname;
        console.warn("Changed URL to " + env + ", redirecting...");
    }

    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "changeEnv") {
            changeURL(message.env);
        }
    });
})();