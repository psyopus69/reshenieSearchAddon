let searchPanel = document.createElement('div');
let searchBtn = document.createElement('input');
let answerDiv = document.createElement('div');
let answerBlock = document.createElement('div');
let clearBtn = document.createElement('input');
const input = document.createElement('input');
let iframe = document.createElement('iframe');
let divFrame = document.createElement('div');

let loadTreads = [];
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
    clearBtn.addEventListener("click", () => { onClear(); });

    answerBlock.setAttribute("id", "answer");
    answerBlock.appendChild(answerDiv);
    answerDiv.setAttribute('class', 'block-answer');

    divFrame.className = 'block-frame';
    divFrame.appendChild(iframe);
    iframe.name = "iframe_link";
    iframe.className = "block-frame__iframe"

    searchBtn.addEventListener("click", () => { onSearchClick(input.value); });
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
    let counter = loadTreads.length;
    answerBlock.innerHTML = "";
    let x = 0;
    answerDiv.innerHTML = "";
    answerBlock.style.paddingBottom = '0';
    //substring = substring.replaceAll(" ", "%20");
    for (let i = 0; i < loadTreads.length; i++) {
        //  console.log("\r\n\r\nURL: " + loadTreads[i][1] + "\r\n" + substring.toUpperCase() + "  \r\nIN (i: " + i + ")\r\n " + loadTreads[i][2].toUpperCase());

        if (loadTreads[i][3].toUpperCase().includes(substring.toUpperCase())) {
            // console.log("нашлось! " + substring + " по адресу" + loadTreads[i][1] + ", orig: " + loadTreads[i][2]);
            x += 1;
            if (x == 1) {
                answerBlock.innerHTML += "<p>Результаты поиска:</p>";
                answerBlock.style.paddingBottom = '20px';
            }
            answerDiv.innerHTML += '<div class="block-link"><a class="link" href="' + window.location.href + encodeURI(loadTreads[i][1].replace(/%20/g, '+')) + "\r\n" + '"target="iframe_link">' + loadTreads[i][2] + ' (' + loadTreads[i][1] + ')</a></div>';
            answerBlock.appendChild(answerDiv);
            if (x == 1) {
                divFrame.style.display = b;
                iframe.style.display = b;
                iframe.setAttribute("src", window.location.href + encodeURI(loadTreads[i][1].replace(/%20/g, '+')) + "\r\n")
            }
        }
    }
    if (x == 0) {
        answerBlock.innerHTML += "<p>По запросу <b>" + substring + "</b> ничего не найдено.</p>";
        answerBlock.style.paddingBottom = '0';
        // iframe.style.display = "none";

    }

}

const parseAllUrlds = (documentText) => {
    documentText = documentText.getElementsByTagName("td");
    // console.log(documentText);
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
    let str = "<script>";
    const allSearchedBtns = massHtml.split(str + "btnL");
    // console.log(allSearchedBtns);
    for (let i = 0; i < allSearchedBtns.length; i++) {
        //   console.log(allSearchedBtns[i]);
        if (allSearchedBtns[i].length === 0) continue;
        let splitByBtn2 = allSearchedBtns[i].split(")</script>");
        //   console.log(splitByBtn2[0]);
        if (splitByBtn2.length < 2) continue;
        let newUrl = splitByBtn2[0].split("\", \"");
        //console.log("\r\n\r\n*******\r\nName :" + newUrl[1] + "\r\n\r\n");
        let origLinkText = newUrl[1];
        newUrl = newUrl[2].split("\"")[0];

        if (newUrl.length !== 0) {
            loadTreads[loadTreads.length] = [loadTreads.length, newUrl, origLinkText];
            loadThreadsCounter++;
        }
    }

    parseAllUrldsCounter--;

    if (parseAllUrldsCounter == 0)
        for (let i = 0; i < loadTreads.length; i++) {
            //console.log(loadTreads[i][1]);
            getDocumentByUrl(loadTreads[i][1], insertDocument, { threadNum: i });
            //console.log(window.location.href + encodeURI(loadTreads[i][1].replace(/%20/g, '+')) + "\r\n");
        }
}

const insertDocument = (document, threadNumObj) => {
    loadTreads[threadNumObj.threadNum][3] = document.getElementsByTagName("html")[0].innerHTML;
    // console.log("searched!@#" + document.getElementsByTagName("html")[0].innerHTML);
    if (--loadThreadsCounter === 0) searchReady();
};

const searchReady = () => {
    // alert("searchReady!");
    enableSearch = true;
    searchBtn.classList.remove("searchBlock");
    searchBtn.classList.add("searchReady");
};

let parseAllUrldsCounter = 0;
function startAll() {
    parseAllUrldsCounter++;
    getDocumentByUrl("https://reshenie-soft.ru/doc/left_1.htm", parseAllUrlds, {});
    parseAllUrldsCounter++;
    getDocumentByUrl("https://reshenie-soft.ru/doc/left_2.htm", parseAllUrlds, {});
}

function getDocumentByUrl(url, callback, argsOb) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            //  console.log( "\r\n" + url + "\r\n");
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
    answerBlock.style.display = "block";
}
//поиск при нажатии клавиши ENTER
input.onkeydown = function runScript(e) {
    if (e.which == 13 || e.keyCode == 13) {
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
    if (e.which == 27 || e.keyCode == 27) {
        answerBlock.style.display = n;
        divFrame.style.display = n;
        iframe.style.display = n;
    }
    return true;
}
//скрытие блокирующего элемента под фремом(модального окна) при нажатии
divFrame.onclick = function (e) {
    divFrame.style.display = n;
}
//при клике по ссылкам поиска
document.addEventListener("click", (e) => {
    target = e.target
    if (target.className == 'link') {
        divFrame.style.display = b;
        frame = document.getElementsByTagName('iframe')[0];
        searchIframe(frame, input.value.trim());
        // let idoc = iframe.contentDocument || iframe.contentWindow.document;
    }
});
const searchIframe = (frame, text) => {
    textUpper = text.toUpperCase();
    frame.onload = function () {
        let iframeDoc = frame.contentWindow.document;
        // iframeDoc.body.style.backgroundColor = 'red';
        elem = iframeDoc.getElementsByTagName('p');
        // console.log(elem);
        for (let i = 0; i < elem.length; i++) {
            // console.log(elem[i].innerText);
            if (elem[i].innerText.toUpperCase().includes(textUpper)) {
                // console.log('Нашёл ' + elem[i].outerHTML);
                if (textUpper !== '' && textUpper.length > 1) {
                    elem[i].style.backgroundColor = '#fcfc6d';
                }
            }
        }

    }

}