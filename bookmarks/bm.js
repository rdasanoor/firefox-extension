const letters = 'abcdefghijklmnopqrstuvwxyz';

const faviconURL = 'https://s2.googleusercontent.com/s2/favicons?domain=';

function encodeBookmarks(bookmarks, alphabet) {
  const stack = bookmarks.slice();

  while (stack.length > 1) {
    const node = {children : stack.splice(-alphabet.length, alphabet.length)};

    stack.push(node);
  }

  const encoded = stack[0];

  return condenseBookmarks({}, encoded, alphabet, "");
}

function condenseBookmarks(obj, encoded, letters, prev) {
  for (let i = 0; i < encoded.children.length; ++i) {
    if (!encoded.children[i].children) obj[encoded.children[i]] = prev + letters[i];
    else condenseBookmarks(obj, encoded.children[i], letters, prev + letters[i]);
  }

  return obj;
}

function displayBookmarks(node) {
  text = '';

  $('.bookmarks').remove();

  const bmDiv = $('<div class="bookmarks"></div>');

  $(document.body).append(bmDiv);

  bookmarks.push(node);

  const codes = encodeBookmarks(node.children.map(child => child.id), letters);

  node.children.forEach(child => addBookmarkContainer(child, codes[child.id], child.url ? faviconURL + child.url : '../resources/folder.png', bmDiv));
}

function addBookmarkContainer(bookmark, code, icon, bmDiv) {
  $(bmDiv).append(`
    <div id=${bookmark.id} class="bookmark_container">
      <img class="icon" src="${icon}">
      <span>${bookmark.title}</span>
      <span class="code">${code}</span>
    </div>
  `);

  $('#' + bookmark.id).on('click', () => {
    $(this).velocity({
      rotateX: '45deg'
    }, {
      duration: 'slow'
    })
    if (bookmark.url) {
      return window.location = bookmark.url;
    }

    displayBookmarks(bookmark);
  })
}

let bookmarks = [];
let text = '';

$(document).ready(async () => {
  let totalBookmarks = await browser.bookmarks.getTree();

  totalBookmarks = totalBookmarks[0].children[1];

  displayBookmarks(totalBookmarks);

  $(document.body).on('keydown', async event => {
    let key = event.key.toLowerCase();

    if (key === 'backspace') {
      $('.bookmarks').children().children('.code').css('color', 'black');
      return text = '';
    };

    if (key === 'escape' && bookmarks.length > 1) {
      text = '';

      bookmarks.pop();

      return displayBookmarks(bookmarks.pop());
    }

    if (!letters.includes(key)) return;

    text += key;

    let codes = encodeBookmarks(bookmarks.at(-1).children.map(child => child.id), letters);

    Object.entries(codes).forEach(([k, v]) => {
      $('#' + k).children('.code').css('color', v.startsWith(text) ? 'blue' : 'red');
    })
  })

  $(document.body).on('keyup', async event => {
    if (!letters.includes(event.key.toLowerCase())) return;

    let codes = encodeBookmarks(bookmarks.at(-1).children.map(child => child.id), letters);

    const id = Object.entries(codes).find(([_k, v]) => v === text)?.[0];

    if (!id) return;

    const bm = bookmarks.at(-1).children.find(bm => bm.id === id);

    if (bm.url) return window.location = bm.url;

    displayBookmarks(bm);
  })
})
