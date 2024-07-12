function listenForClicks() {
    document.addEventListener("click", (e) => {
        function buttonToURL(button) {
            if (button.includes("accept")) {
                return button;
            } else if (button == "Local") {
                return "local";
            } else if (button == "Live") {
                return "www";
            } else {
                return "error";
            }
        }

        function changeEnv(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "changeEnv",
                env: buttonToURL(e.target.textContent)
            });
            console.log(browser.tabs.url);
        }

        function reportError(error) {
            console.error(`Could not change environment: ${error}`);
        }

        if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
            return;
        }
        browser.tabs.query({active: true, currentWindow: true})
            .then(changeEnv)
            .catch(reportError);
    });
}

function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute beastify content script: ${error.message}`);
}

browser.tabs
    .executeScript({file: "/content_scripts/changeEnv.js"})
    .then(listenForClicks)
    .catch(reportExecuteScriptError);