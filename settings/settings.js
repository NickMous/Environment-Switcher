function saveSettings(e) {
    e.preventDefault();
    let url = document.getElementById("envUrl").value;
    let [valid, error] = verifyUrl(url.trim());
    if (!valid) {
        alert(error);
        return;
    }
    var settings = {
        "name": document.getElementById("envName").value,
        "url": document.getElementById("envUrl").value.trim(),
        "allowedOrigins": document.getElementById("envOrigins").value.split(",").map((origin) => origin.trim()),
    };
    let existingSettings = browser.storage.local.get("environments");
    existingSettings.then((result) => {
        existingSettings = result.environments;
        if (existingSettings === undefined) {
            existingSettings = [];
        } else {
            existingSettings = JSON.parse(existingSettings);
        }
        existingSettings.push(settings);
        
        json = JSON.stringify(existingSettings);
        browser.storage.local.set({ "environments": json });
        let envList = document.querySelector("#envList tbody");
        let clone = document.getElementById("envTemplate").content.cloneNode(true);
        clone.querySelector("tr").setAttribute("data-index", existingSettings.length - 1);
        clone.querySelector(".name").textContent = settings.name;
        clone.querySelector(".url").textContent = settings.url;
        clone.querySelector(".origins").textContent = settings.allowedOrigins.join(", ");
        clone.querySelector("button.delete").addEventListener("click", onDelete);
        clone.querySelector("button.edit").addEventListener("click", onEdit);
        envList.appendChild(clone);
    });
}

function loadSettings() {
    let existingSettings = browser.storage.local.get("environments");
    existingSettings.then((result) => {
        existingSettings = result.environments;
        if (existingSettings === undefined) {
            existingSettings = [];
            return;
        }
        existingSettings = JSON.parse(existingSettings);
        let envList = document.querySelector("#envList tbody");
        for (let i = 0; i < existingSettings.length; i++) {
            let settings = existingSettings[i];
            let clone = document.getElementById("envTemplate").content.cloneNode(true);
            clone.querySelector("tr").setAttribute("data-index", i);
            clone.querySelector(".name").textContent = settings.name;
            clone.querySelector(".url").textContent = settings.url;
            clone.querySelector(".origins").textContent = settings.allowedOrigins.join(", ");
            clone.querySelector("button.delete").addEventListener("click", onDelete);
            clone.querySelector("button.edit").addEventListener("click", onEdit);
            envList.appendChild(clone);
        }
    });
}

function onDelete(e) {
    let index = e.target.parentElement.parentElement.getAttribute("data-index");
    let existingSettings = browser.storage.local.get("environments");
    existingSettings.then((result) => {
        existingSettings = result.environments;
        existingSettings = JSON.parse(existingSettings);
        existingSettings.splice(index, 1);
        json = JSON.stringify(existingSettings);
        browser.storage.local.set({ "environments": json });
        e.target.parentElement.parentElement.remove();
    });
}

function onEdit(e) {
    let index = e.target.parentElement.parentElement.getAttribute("data-index");
    let existingSettings = browser.storage.local.get("environments");
    existingSettings.then((result) => {
        existingSettings = result.environments;
        existingSettings = JSON.parse(existingSettings);
        let clone = document.getElementById("editEnvTemplate").content.cloneNode(true);
        let settings = existingSettings[index];
        clone.querySelector("tr").setAttribute("data-index", index);
        clone.querySelector(".name").value = settings.name;
        clone.querySelector(".url").value = settings.url;
        clone.querySelector(".origins").value = settings.allowedOrigins.join(",");
        clone.querySelector("button.save").addEventListener("click", onEditSubmit);
        clone.querySelector("button.cancel").addEventListener("click", onEditCancel);
        e.target.parentElement.parentElement.replaceWith(clone);
    });
}

function onEditSubmit(e) {
    let index = e.target.parentElement.parentElement.getAttribute("data-index");
    let [valid, error] = verifyUrl(e.target.parentElement.parentElement.querySelector(".url").value.trim());
    if (!valid) {
        alert(error);
        return;
    }
    var settings = {
        "name": e.target.parentElement.parentElement.querySelector(".name").value,
        "url": e.target.parentElement.parentElement.querySelector(".url").value.trim(),
        "allowedOrigins": e.target.parentElement.parentElement.querySelector(".origins").value.split(",").map((origin) => origin.trim()),
    };
    let existingSettings = browser.storage.local.get("environments");
    existingSettings.then((result) => {
        existingSettings = result.environments;
        existingSettings = JSON.parse(existingSettings);
        existingSettings[index] = settings;
        json = JSON.stringify(existingSettings);
        browser.storage.local.set({ "environments": json });
        let envList = document.querySelector("#envList tbody");
        let clone = document.getElementById("envTemplate").content.cloneNode(true);
        clone.querySelector("tr").setAttribute("data-index", index);
        clone.querySelector(".name").textContent = settings.name;
        clone.querySelector(".url").textContent = settings.url;
        clone.querySelector(".origins").textContent = settings.allowedOrigins.join(", ");
        clone.querySelector("button.delete").addEventListener("click", onDelete);
        clone.querySelector("button.edit").addEventListener("click", onEdit);
        e.target.parentElement.parentElement.replaceWith(clone);
    });
}

function onEditCancel(e) {
    let index = e.target.parentElement.parentElement.getAttribute("data-index");
    let existingSettings = browser.storage.local.get("environments");
    existingSettings.then((result) => {
        existingSettings = JSON.parse(result.environments);
        let clone = document.getElementById("envTemplate").content.cloneNode(true);
        let settings = existingSettings[index];
        clone.querySelector("tr").setAttribute("data-index", index);
        clone.querySelector(".name").textContent = settings.name;
        clone.querySelector(".url").textContent = settings.url;
        clone.querySelector(".origins").textContent = settings.allowedOrigins.join(", ");
        clone.querySelector("button.delete").addEventListener("click", onDelete);
        clone.querySelector("button.edit").addEventListener("click", onEdit);
        e.target.parentElement.parentElement.replaceWith(clone);
    });
}

function verifyUrl(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return [false, "URL must start with http:// or https://"];
    } else if (url.endsWith("/")) {
        return [false, "URL must not end with a forward slash"];
    } else if (!url.includes(".")) {
        return [false, "URL must contain a period to be valid"];
    }
    return [true, "passed"];
}

function exportSettings() {
    let existingSettings = browser.storage.local.get("environments");
    existingSettings.then((result) => {
        existingSettings = result.environments;
        if (existingSettings === undefined) {
            existingSettings = [];
            return;
        }
        existingSettings = JSON.parse(existingSettings);
        let blob = new Blob([JSON.stringify(existingSettings)], { type: "application/json" });
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "environments.json";
        a.click();
    });
}

function importSettings() {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = function(e) {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
            let data = JSON.parse(e.target.result);
            let existingSettings = browser.storage.local.get("environments");
            existingSettings.then((result) => {
                existingSettings = result.environments;
                if (existingSettings === undefined) {
                    existingSettings = [];
                } else {
                    existingSettings = JSON.parse(existingSettings);
                }
                existingSettings = existingSettings.concat(data);
                json = JSON.stringify(existingSettings);
                browser.storage.local.set({ "environments": json });
                let envList = document.querySelector("#envList tbody");
                for (let i = 0; i < data.length; i++) {
                    let settings = data[i];
                    let clone = document.getElementById("envTemplate").content.cloneNode(true);
                    clone.querySelector("tr").setAttribute("data-index", existingSettings.length - 1);
                    clone.querySelector(".name").textContent = settings.name;
                    clone.querySelector(".url").textContent = settings.url;
                    clone.querySelector(".origins").textContent = settings.allowedOrigins.join(", ");
                    clone.querySelector("button.delete").addEventListener("click", onDelete);
                    clone.querySelector("button.edit").addEventListener("click", onEdit);
                    envList.appendChild(clone);
                }
            });
        }
        reader.readAsText(file);
    };
    input.click();
}

document.getElementById("newEnvForm").addEventListener("submit", saveSettings);
document.addEventListener("DOMContentLoaded", loadSettings);
document.getElementById("export").addEventListener("click", exportSettings);
document.getElementById("import").addEventListener("click", importSettings);