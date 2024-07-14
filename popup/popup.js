function mainThread(url, tabId) {
    let envs = browser.storage.local.get("environments");
    envs.then((result) => {
        let envs = JSON.parse(result.environments);
        let switches = document.querySelector("#switches");
        if (envs) {
            document.querySelector("#no-switch").classList.add("hidden");
            for (let env of envs) {
                for (let origin of env.allowedOrigins) {
                    if (url.includes(origin)) {
                        let clone = document.getElementById("switch-template").content.cloneNode(true);
                        let button = clone.querySelector("button");
                        button.textContent = env.name;
                        button.dataset.envUrl = env.url;
                        button.addEventListener("click", () => {
                            browser.tabs.sendMessage(tabId, {
                                command: "changeEnv",
                                env: env.url
                            });
                            switches.innerHTML = "";
                            mainThread(env.url, tabId);
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
        mainThread(tabs[0].url, tabs[0].id);
    })
    .catch(reportExecuteScriptError);

