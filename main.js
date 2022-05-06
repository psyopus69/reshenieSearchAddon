let searchPanel = document.createElement('div');
let searchBtn = document.createElement('div');
let answerDiv = document.createElement('div');
let answerBlock = document.createElement('div');
let clearBtn = document.createElement('div');
const input = document.createElement("input");

let loadTreads = [];
let loadThreadsCounter = 0;
let enableSearch = false;

document.addEventListener("DOMContentLoaded", ready);

function ready() {
    searchPanel.setAttribute("id", "mainSearchPanel");

    searchBtn.setAttribute("id", "mainSearchBtn");
    searchBtn.innerHTML = "Поиск";
	
	
	clearBtn.setAttribute("id", "clearBtn");
    clearBtn.innerHTML = "Очистить";
    clearBtn.addEventListener("click", () => {onClear();});
	
    answerBlock.innerHTML = "Результаты поиска:";
    answerBlock.setAttribute("id", "answer");
	
	answerBlock.appendChild(answerDiv);

    searchBtn.addEventListener("click", () => {onSearchClick(input.value);});
    searchBtn.classList.add("searchBlock");

    input.setAttribute("id", "mainInput");
    input.type = "text";
    input.name = "SEARCH_INPUT";
    searchPanel.appendChild(searchBtn);
    searchPanel.appendChild(clearBtn);
    searchPanel.appendChild(input);
    searchPanel.appendChild(answerBlock);

    const elements = document.getElementsByTagName("*");
    elements[0].prepend(searchPanel);
    startAll();
}

function onClear() {
	answerDiv.innerHTML = "";
	input.value = "";
	}

function onSearchClick(substring) {
    if (!enableSearch) return;
	let counter = loadTreads.length;
	answerDiv.innerHTML = "";
	//substring = substring.replaceAll(" ", "%20");
    for (let i = 0; i < loadTreads.length; i++) {
       // console.log("\r\n\r\nURL: " + loadTreads[i][1] + "\r\n" + substring.toUpperCase() + "  \r\nIN (i: " + i + ")\r\n " + loadTreads[i][2].toUpperCase());
        if (loadTreads[i][3].toUpperCase().includes(substring.toUpperCase())) {
       //     console.log("нашлось! " + substring + " по адресу" + loadTreads[i][1] + ", orig: " + loadTreads[i][2]);		  
            answerDiv.innerHTML += "<div>" + loadTreads[i][2] + " (" + loadTreads[i][1] + ")</div>";
            answerBlock.appendChild(answerDiv);
        }
    }

}

const parseAllUrlds = (documentText) => {
    documentText = documentText.getElementsByTagName("td");
    let massHtml = "";
    for (let i = 0; i < documentText.length; i++) {
        if (documentText[i].innerHTML.includes("-->")) continue;
        massHtml += documentText[i].innerHTML;
        // console.log(documentText[i].innerHTML);
    }
    let str = "<script>";
    const allSearchedBtns = massHtml.split(str + "btnL");
    // console.log(allSearchedBtns);
    for (let i = 0; i < allSearchedBtns.length; i++) {
      //  console.log(allSearchedBtns[i]);
        if (allSearchedBtns[i].length === 0) continue;
        let splitByBtn2 = allSearchedBtns[i].split(")</script>");
      //  console.log(splitByBtn2[0]);
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
        // console.log(loadTreads[i][1]);
        getDocumentByUrl(loadTreads[i][1], insertDocument, {threadNum: i});
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
            // console.log("\r\n" + url + "\r\n");
            callback(xhr.response, argsOb);
        }
    }
    xhr.responseType = "document";
    xhr.open('GET', url, true);
    xhr.send('');
}