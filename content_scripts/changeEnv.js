(() => {
    console.log("changeEnv.js loaded");
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    function changeURL(env) {
        let url = window.location.href;
        let newURL = url.replace(/(local|www|accept\d\d)/, env);
        newURL = newURL.replace(/(http:\/\/|https:\/\/)/, env === "local" ? "http://" : "https://");
        window.location.href = newURL;
    }

    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "changeEnv") {
            changeURL(message.env);
        }
    });
})();