$(document.body).append(
    '<img src="https://cdn.discordapp.com/attachments/1016886077124001823/1048804095588323358/background.gif" style="display: none;">'
);

document.body.addEventListener("keydown", async function (event) {
    if (
        event.key === "e" &&
        event.metaKey &&
        !event.shiftKey &&
        !event.ctrlKey
    ) {
        // cmd + e, creates shortcut when on a page

        console.log("works");
        event.preventDefault();

        let sub = await Swal.fire({
            title: "Shortcut:",
            input: "text",
            color: "white",
            inputAttributes: {
                autocapitalize: "off",
            },
            showCancelButton: true,
            background:
                "#000 url(https://cdn.discordapp.com/attachments/1016886077124001823/1048804095588323358/background.gif)",
            confirmButtonText: "Confirm",
            allowOutsideClick: () => !Swal.isLoading(),
        });

        if (!sub.isConfirmed) return;

        sub = sub.value;

        browser.storage.sync
            .get({ shortcuts: {} })
            .then((storage) => {
                storage.shortcuts[sub] = window.location
                    .toString()
                    .toLowerCase()
                    .trim();

                browser.storage.sync
                    .set(storage)
                    .then(() => console.log("Updated shortcuts."))
                    .catch(() => console.log("Failed to update shortcuts."));
            })
            .catch((error) =>
                console.log("Error retrieving shortcuts.", error)
            );
    }

    if (event.key == "e" && event.shiftKey && event.metaKey) {
        // shift + cmd + e to delete all shortcuts for the given page
        event.preventDefault();

        browser.storage.sync.get({ shortcuts: {} }).then((storage) => {
            const keys = Object.keys(storage.shortcuts).filter(
                (key) =>
                    storage.shortcuts[key] ===
                    window.location.toString().toLowerCase().trim()
            );

            keys.forEach((key) => delete storage.shortcuts[key]);

            Swal.fire({
                title: "Shortcuts Deleted",
                text: keys.join(", "),
                background:
                    "#000 url(https://cdn.discordapp.com/attachments/1016886077124001823/1048804095588323358/background.gif)",
                color: "white",
                width: "25em",
            });

            browser.storage.sync
                .set(storage)
                .then(() => console.log("Updated shortcuts."))
                .catch(() => console.log("Failed to update shortcuts."));
        });
    }

    if (event.key == "e" && event.ctrlKey && event.metaKey) {
        // ctrl + cmd + e to list all the shortcuts for the current page
        event.preventDefault();

        browser.storage.sync.get({ shortcuts: {} }).then((storage) => {
            const keys = Object.keys(storage.shortcuts).filter(
                (key) =>
                    storage.shortcuts[key] ===
                    window.location.toString().toLowerCase().trim()
            );

            Swal.fire({
                title: "Current Shortcuts",
                text: keys.join(", "),
                background:
                    "#000 url(https://cdn.discordapp.com/attachments/1016886077124001823/1048804095588323358/background.gif)",
                color: "white",
                width: "25em",
            });

            browser.storage.sync
                .set(storage)
                .then(() => console.log("Updated shortcuts."))
                .catch(() => console.log("Failed to update shortcuts."));
        });
    }
});
