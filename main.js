const searchPanel = document.createElement('div');
const searchBtn = document.createElement('input');
const answerDiv = document.createElement('div');
const answerBlock = document.createElement('div');
const clearBtn = document.createElement('input');
const input = document.createElement('input');
const iframe = document.createElement('iframe');
const divFrame = document.createElement('div');

const loadTreads = [];
let loadThreadsCounter = 0;
let enableSearch = false;

document.addEventListener("DOMContentLoaded", ready);

function ready() {
    searchPanel.setAttribute("id", "mainSearchPanel");
    searchBtn.setAttribute("id", "mainSearchBtn");
    searchBtn.type = 'button';
    searchBtn.value = "Поиск";

    clearBtn.setAttribute("id", "clearBtn");
    clearBtn.type = 'button';
    clearBtn.value = "X";
    clearBtn.title = "Очистить/вернуться к ручному поиску";
    clearBtn.addEventListener("click", () => {
        onClear();
    });

    answerBlock.setAttribute("id", "answer");
    answerBlock.appendChild(answerDiv);
    answerDiv.setAttribute('class', 'block-answer');

    divFrame.className = 'block-frame';
    divFrame.appendChild(iframe);
    iframe.name = "iframe_link";
    iframe.className = "block-frame__iframe"

    searchBtn.addEventListener("click", () => {
        onSearchClick(input.value);
    });
    searchBtn.classList.add("searchBlock");
    input.setAttribute("id", "mainInput");
    input.setAttribute("placeholder", "Введите что-нибудь");
    input.type = "text";
    input.name = "SEARCH_INPUT";
    searchPanel.appendChild(searchBtn);
    searchPanel.appendChild(clearBtn);
    searchPanel.appendChild(input);
    searchPanel.appendChild(answerBlock);

    const elements = document.getElementsByTagName("*");
    elements[0].prepend(divFrame);
    elements[0].prepend(searchPanel);

    startAll();
}

const n = 'none';
const b = 'block';

function onClear() {
    answerDiv.innerHTML = "";
    answerBlock.innerHTML = "";
    input.value = "";
    answerBlock.style.paddingBottom = '0';
    divFrame.style.display = n;
    iframe.style.display = n;
}

function onSearchClick(substring) {
    if (!enableSearch) return;
    let searchCounter = 0;
    answerBlock.innerHTML = "";
    answerDiv.innerHTML = "";
    answerBlock.style.paddingBottom = '0';
    for (let i = 0; i < loadTreads.length; i++) {

        const elem = loadTreads[i][3];
        if (elem.toUpperCase().includes(substring.toUpperCase())) {
            searchCounter += 1;
            if (searchCounter === 1) {
                answerBlock.innerHTML += "<p>Результаты поиска:</p>";
                answerBlock.style.paddingBottom = '20px';
            }
            answerDiv.innerHTML += '<div class="block-link"><a class="link" href= "' + window.location.href + encodeURI(loadTreads[i][1].replace(/%20/g, '+')) + "\r\n" + '" target="iframe_link">' + loadTreads[i][2]  /*+ loadTreads[i][1]*/ + '</a></div>';
            answerBlock.appendChild(answerDiv);
            if (searchCounter === 1) {
                divFrame.style.display = b;
                iframe.style.display = b;
                iframe.setAttribute("src", window.location.href + encodeURI(loadTreads[i][1].replace(/%20/g, '+')) + "\r\n")
            }
        }
    }
    if (searchCounter === 0) {
        answerBlock.innerHTML += "<p>По запросу <b>" + substring + "</b> ничего не найдено.</p>";
        answerBlock.style.paddingBottom = '0';

    }

}

const parseAllUrls = (documentText) => {
    documentText = documentText.getElementsByTagName("td");
    let massHtml = "";
    for (let i = 0; i < documentText.length; i++) {
        let elem = documentText[i].innerHTML
        //убираем все комментарии в элементе 
        while (elem.search("<!--") > 0) {
            elem = elem.replace(elem.slice(elem.search("<!--"), elem.search("-->") + 3), '');
        }

        if (elem.includes("<tbody>")) continue;
        massHtml += elem;
    }
    const str = "<script>";
    const allSearchedBtns = massHtml.split(str + "btnL");
    for (let i = 0; i < allSearchedBtns.length; i++) {
        if (allSearchedBtns[i].length === 0) continue;
        const splitByBtn2 = allSearchedBtns[i].split(")</script>");
        if (splitByBtn2.length < 2) continue;
        let newUrl = splitByBtn2[0].split("\", \"");
        const origLinkText = newUrl[1];
        newUrl = newUrl[2].split("\"")[0];

        if (newUrl.length !== 0) {
            loadTreads[loadTreads.length] = [loadTreads.length, newUrl, origLinkText];
            loadThreadsCounter++;
        }
    }

    parseAllUrlsCounter--;

    if (parseAllUrlsCounter === 0)
        for (let i = 0; i < loadTreads.length; i++) {
            getDocumentByUrl(loadTreads[i][1], insertDocument, {threadNum: i});

        }
}

const insertDocument = (document, threadNumObj) => {
    loadTreads[threadNumObj.threadNum][3] = document.getElementsByTagName("html")[0].textContent;
    if (--loadThreadsCounter === 0) searchReady();
};

const searchReady = () => {
    enableSearch = true;
    searchBtn.classList.remove("searchBlock");
    searchBtn.classList.add("searchReady");
};

let parseAllUrlsCounter = 0;

function startAll() {
    parseAllUrlsCounter++;
    getDocumentByUrl("https://reshenie-soft.ru/doc/left_1.htm", parseAllUrls, {});
    parseAllUrlsCounter++;
    getDocumentByUrl("https://reshenie-soft.ru/doc/left_2.htm", parseAllUrls, {});
    parseAllUrlsCounter++;
    getDocumentByUrl("https://reshenie-soft.ru/doc/left_4.htm", parseAllUrls, {});
    parseAllUrlsCounter++;
    getDocumentByUrl("https://reshenie-soft.ru/doc/left_5.htm", parseAllUrls, {});
    parseAllUrlsCounter++;
    getDocumentByUrl("https://reshenie-soft.ru/doc/left_6.htm", parseAllUrls, {});
}

function getDocumentByUrl(url, callback, argsOb) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            callback(xhr.response, argsOb);
        }
    }
    xhr.responseType = "document";
    xhr.open('GET', url, true);
    xhr.send('');
}

//событие при изменении input
input.oninput = function changeInp() {
    onSearchClick(input.value);
    searchIframe(iframe, input.value.trim())
    answerBlock.style.display = b;
}
//поиск при нажатии клавиши ENTER
input.onkeydown = function runScript(e) {
    if (e.key === "Enter") {
        onSearchClick(input.value);
        return false;
    }
    return true;
}
//отображение списка найденных результатов при наведении
searchPanel.onmouseover = function (e) {
    answerBlock.style.display = b;
    e.scrollTop = e.scrollHeight;
}
//скрытие списка найденных результатов при отводе курсора от элемента
searchPanel.onmouseout = function (e) {
    answerBlock.style.display = n;
    e.scrollTop = e.scrollHeight;
}
//скрытие элементов при нажатии ESC
window.onkeydown = function (e) {
    if (e.key === "Esc" || e.key === "Escape") {
        answerBlock.style.display = n;
        divFrame.style.display = n;
        iframe.style.display = n;
    }
    return true;
}
//скрытие блокирующего элемента под фремом(модального окна) при нажатии
divFrame.onclick = () => {
    divFrame.style.display = n;
};
//при клике по ссылкам поиска
document.addEventListener("click", (e) => {
    const target = e.target
    let frame;
    if (target.className === 'link') {
        divFrame.style.display = b;
        iframe.style.display = b;
        frame = document.getElementsByTagName('iframe')[0];
        searchIframe(frame, input.value.trim());
    }
});
const searchIframe = (frame, text) => {
    const textUpper = text.toUpperCase();
    frame.onload = function () {
        const iframeDoc = frame.contentWindow.document;
        const elem = iframeDoc.getElementsByTagName('p');
        for (let i = 0; i < elem.length; i++) {
            if (elem[i].innerText.toUpperCase().includes(textUpper)) {
                if (textUpper !== '' && textUpper.length > 1) {
                    if (elem[i].className === 'h1' || elem[i].className === 'text' || elem[i].className === 'MsoIndex1' || elem[i].className === 'MsoMessageHeader') {
                        elem[i].style.display = 'table'
                        if (elem[i].className === 'MsoIndex1' || elem[i].className === 'MsoMessageHeader') {
                            elem[i].style.color = '#4157f5'
                        }
                    }
                    elem[i].style.backgroundColor = '#fcfc6d';
                }
            }
        }
        const elemA = iframeDoc.getElementsByTagName('a');
        for (let i = 0; i < elemA.length; i++) {
            if (elemA[i].innerText.toUpperCase().includes(textUpper)) {
                if (textUpper !== '' && textUpper.length > 1) {
                    elemA[i].style.backgroundColor = '#fcfc6d';
                }
            }
        }
    }

}