const search = document.getElementById('search');
const suggest = document.getElementById('suggestions');

window.addEventListener('load', () => {
    search.focus();
});

const isValidUrl = urlString => {
    const regex = /.*\.(com|gov|co|us|me|dev|xyz|edu|net|org|run|vc|ly|io)\/?.*/;
    return !!regex.test(urlString);
}

const isFullUrl = urlString => {
    var urlPattern = new RegExp('^https?:\\/\\/.*');
    return !!urlPattern.test(urlString);
}

function shortenURL(url) {
    const domain = new URL(url);
    return domain.hostname.replace('www.', '');
}

function onGot(items) {
    let tmp = items.sort((a, b) => b.visitCount - a.visitCount).map(item => [item.url.startsWith('file') ? item.url : shortenURL(item.url), item.url]);
    let surls = tmp.map(item => item[0]);

    return tmp.filter((item, i) => surls.indexOf(item[0]) === i && item[0] !== 'google.com' && !item[0].startsWith('file')).slice(0, 3);
}

let suggestion_urls;

search.addEventListener('keydown', async event => {
    // key can be anything but an arrow key
    if (event.key.startsWith('Arrow')) return;

    const storage = await browser.storage.sync.get({ 'shortcuts': {} });
    const text = event.target.textContent.trim();

    if (!text) return $('#suggestions').empty();

    const shortcut = storage.shortcuts[text.toLowerCase()];

    event.target.style.fontStyle = shortcut ? 'italic' : 'normal';
    event.target.style.textDecoration = isValidUrl(text) ? 'underline' : 'initial';

    let content = '';

    browser.history
        .search({
            text: text,
            startTime: 0
        })
        .then(items => {
            const url = onGot(items);
            suggestion_urls = url;

            url.forEach(item => content += `<div class="suggestion" tabindex="0">${item[0]}</div>`);
            $('#suggestions').html(content);
        })
});

search.addEventListener('keydown', async event => {
    // key can only be Enter
    if (event.key !== 'Enter') return;
    event.preventDefault();

    const text = event.target.textContent.trim();

    if (text.toLowerCase() === 'bm') return browser.tabs.update({
        url: '../bookmarks/bm.html'
    })

    if (isValidUrl(text)) {
        if (isFullUrl(text)) {
            window.location = text;
        } else {
            window.location = `http://${text}`;
        }

        return;
    }

    const storage = await browser.storage.sync.get({ 'shortcuts': {} });
    const shortcut = storage.shortcuts[text];

    if (shortcut) return window.location = shortcut;

    window.location = `https://google.com/search?q=${encodeURIComponent(text)}`;
})

search.addEventListener('keydown', event => {
    // key can only be the down arrow
    if (event.key !== 'ArrowDown') return;

    document.activeElement.parentElement.nextElementSibling.childNodes[0].focus();
    document.activeElement.classList.add('selected');
});

function setCaret() {
    let range = document.createRange();
    let selection = window.getSelection();

    range.selectNodeContents(search);
    range.collapse(false);
    console.log(range);

    selection.removeAllRanges();
    selection.addRange(range);
}

suggest.addEventListener('keydown', event => {
    // key has to be an arrow key
    let inp = event.key;
    if (!inp.startsWith('Arrow')) return;

    let divs = $('#suggestions').children();
    let current = document.activeElement;

    if (inp === 'ArrowUp') {
        event.preventDefault();
        divs.removeClass('selected');
        search.focus();
        setCaret();
    }

    if (inp === 'ArrowRight' && current.nextElementSibling) {
        current.classList.remove('selected');
        current.nextElementSibling.focus();
        document.activeElement.classList.add('selected');
    }

    if (inp === 'ArrowLeft' && current.previousElementSibling) {
        current.classList.remove('selected');
        current.previousElementSibling.focus();
        document.activeElement.classList.add('selected');
    }
});

suggest.addEventListener('keydown', event => {
    // key has to be the enter key
    if (event.key !== 'Enter') return;

    const curr = document.activeElement;
    const index = Array.prototype.indexOf.call(curr.parentElement.children, curr);

    window.location = suggestion_urls[index][1];
})
