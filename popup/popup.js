let tab = 0;

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
        }

        function reportError(error) {
            console.error(`Could not change environment: ${error}`);
        }

        if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
            return;
        }
        browser.tabs.query({ active: true, currentWindow: true })
            .then(changeEnv)
            .catch(reportError);
    });
}

function mainThread(tabs) {
    for (let tab of tabs) {
        console.log(tab);
    }
    let envs = browser.storage.sync.get("environments");
    envs.then((result) => {
        let envs = JSON.parse(result.environments);
        let switches = document.querySelector("#switches");
        if (envs) {
            document.querySelector("#no-switch").classList.add("hidden");
            for (let env of envs) {
                console.log(env);
                for (let origin of env.allowedOrigins) {
                    if (tab.url.includes(origin)) {
                        let clone = document.getElementById("switch-template").content.cloneNode(true);
                        let button = clone.querySelector("button");
                        button.textContent = env.name;
                        button.dataset.envUrl = env.url;
                        button.addEventListener("click", () => {
                            browser.tabs.sendMessage(tab.id, {
                                command: "changeEnv",
                                env: env.url
                            });
                        });
                        switches.appendChild(clone);
                        break;
                    }
                }
            }
        }
    });

    document.querySelector("#settings-button").addEventListener("click", () => {
        browser.runtime.openOptionsPage();
    });
}
function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute env switcher content script: ${error.message}`);
}

browser.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => {
        tab = tabs[0];
        mainThread(tabs);
    })
    .catch(reportExecuteScriptError);

