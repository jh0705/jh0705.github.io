var panel = document.getElementById('panel');
var content = document.getElementById('content');
var viewer = document.getElementById('viewer');

var expandButton = document.getElementById('expandButton');
expandButton.addEventListener('click', function (event) {
    event.preventDefault();
    panel.classList.toggle('collapsed');
});

// iOS iframe auto-resize workaround
if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
    viewer.style.width = getComputedStyle(viewer).width;
    viewer.style.height = getComputedStyle(viewer).height;
    viewer.setAttribute('scrolling', 'no');
}

var container = document.createElement('div');
content.appendChild(container);

var viewSrcButton = document.createElement('a');
viewSrcButton.id = 'viewSrcButton';
viewSrcButton.target = '_blank';
viewSrcButton.textContent = 'View source';
viewSrcButton.style.display = 'none';
document.body.appendChild(viewSrcButton);

var links = {};
var selected = null;

function createLink(file) {
    var link = document.createElement('a');
    link.className = 'link';
    link.href = getAnchorLink(file);
    link.textContent = getName(file);
    link.setAttribute('target', 'viewer');

    link.addEventListener('click', function (event) {
        if (event.button === 0) {
            selectFile(file);
        }
    });
    return link;
}

for (var key in file_names) {
    var section = file_names[key];

    var header = document.createElement('h2');
    header.textContent = key;
    header.setAttribute('data-category', key);
    container.appendChild(header);

    for (var i = 0; i < section.length; i++) {
        var file = section[i];
        var link = createLink(file);
        container.appendChild(link);
        links[file] = link;
    }
}

function loadFile(file) {
    selectFile(file);
    viewer.src = getAnchorLink(file);
}

function selectFile(file) {
    if (selected !== null) links[selected].classList.remove('selected');

    links[file].classList.add('selected');
    window.location.hash = file;
    viewer.focus();
    panel.classList.add('collapsed');
    selected = file;
}

if (window.location.hash !== '') {
    loadFile(window.location.hash.substring(1));
}

function getName(file) {
    var name = file.split('_');
    name.shift();
    return name.join(' / ');
}

function getAnchorLink(file) {
    return file + '.html';
}