// Api urls

const ProxyApi = "https://wispy-truth-ac6b.kayyumkhan342001.workers.dev/?u=";
const animeapi = "/anime/";
const episodeapi = "/episode/";
const dlapi = "/download/";

// Api Server Manager

const AvailableServers = [
    "https://api3.kayyumkhan342001.workers.dev/",
];

function getApiServer() {
    return AvailableServers[Math.floor(Math.random() * AvailableServers.length)];
}

// Usefull functions

async function getJson(path, errCount = 0) {
    const ApiServer = getApiServer();
    let url = ApiServer + path;

    if (errCount > 2) {
        throw `Too many errors while fetching ${url}`;
    }

    if (errCount > 0) {
        // Retry fetch using proxy
        console.log("Retrying fetch using proxy");
        url = ProxyApi + url;
    }

    try {
        const response = await fetch(url);
        return await response.json();
    } catch (errors) {
        console.error(errors);
        return getJson(path, errCount + 1);
    }
}

function sentenceCase(str) {
    if (str === null || str === "") return false;
    else str = str.toString();

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to get m3u8 url of episode
async function loadVideo(name, stream) {
    const episodeid =
        urlParams.get("anime") + "-episode-" + urlParams.get("episode");

    try {
        document.getElementById("ep-name").innerHTML = name;
        const serversbtn = document.getElementById("serversbtn");

        let url = stream["sources"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn sactive" onclick="selectServer(this)" data-value="./embed.html?url=${url}&id=${episodeid}">AD Free 1</a> </div>`;
        document.getElementsByClassName("sactive")[0].click();

        url = stream["sources_bk"][0]["file"];
        serversbtn.innerHTML += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="./embed.html?url=${url}&id=${episodeid}">AD Free 2</a> </div>`;

        return true;
    } catch (err) {
        return false;
    }
}

// Function to available servers
async function loadServers(servers, success = true) {
    const serversbtn = document.getElementById("serversbtn");

    html = "";

    for (let [key, value] of Object.entries(servers)) {
        key = capitalizeFirstLetter(key);
        html += `<div class="sitem"> <a class="sobtn" onclick="selectServer(this)" data-value="${value}">${key}</a> </div>`;
    }
    serversbtn.innerHTML += html;

    if (success == false) {
        document.getElementsByClassName("sobtn")[0].click();
    }
}

// Function to select server
function selectServer(btn) {
    const buttons = document.getElementsByClassName("sobtn");
    const iframe = document.getElementById("AnimeDexFrame");
    iframe.src = btn.getAttribute("data-value");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].className = "sobtn";
    }
    btn.className = "sobtn sactive";
}

// Function to show download links
function showDownload() {
    document.getElementById("showdl").style.display = "none";
    document.getElementById("dldiv").classList.toggle("show");

    getDownloadLinks(urlParams.get("anime"), urlParams.get("episode")).then(
        () => {
            console.log("Download links loaded");
        }
    );
}

// Function to get episode list
async function getEpList(anime_id) {
    const data = (await getJson(animeapi + anime_id))["results"];
    const eplist = data["episodes"];
    let ephtml = "";

    for (let i = 0; i < eplist.length; i++) {
        anime_id = eplist[i][1].split("-episode-")[0];
        ep_num = eplist[i][0];
        ephtml += `<a class="ep-btn" href="./episode.html?anime=${anime_id}&episode=${ep_num}">${ep_num}</a>`;
    }
    document.getElementById("ephtmldiv").innerHTML = ephtml;
    return eplist;
}

// Function to get download links
async function getDownloadLinks(anime, episode) {
    const data = (await getJson(dlapi + anime + "-episode-" + episode))[
        "results"
    ];
    let html = "";

    for (const [key, value] of Object.entries(data)) {
        const quality = key.split("x")[1];
        const url = value;
        html += `<div class="sitem"> <a class="sobtn download" target="_blank" href="${url}"><i class="fa fa-download"></i>${quality}p</a> </div>`;
    }
    document.getElementById("dllinks").innerHTML = html;
}


// Function to get episode Slider
async function getEpSlider(total, current) {
    current = Number(current);
    let ephtml = "";

    for (let i = 0; i < total.length; i++) {
        let episodeId = total[i][1]
        let epNum = total[i][0]
        let x = episodeId.split("-episode-");
        if (epNum == current) {
            if (current < 20) {
                ephtml += `<div class="ep-slide ep-slider-playing"><a href="./episode.html?anime=${x[0]}&episode=${x[1]}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=https://thumb.anime-dex.workers.dev/thumb/${episodeId}><div class=ep-title><span>Episode ${epNum} - Playing</span></div></a></div>`;
            }
            else {
                ephtml += `<div class="ep-slide ep-slider-playing"><a href="./episode.html?anime=${x[0]}&episode=${x[1]}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=https://thumb.anime-dex.workers.dev/thumb/${episodeId}><div class=ep-title><span>Ep ${epNum} - Playing</span></div></a></div>`;
            }
        }
        else {
            ephtml += `<div class=ep-slide><a href="./episode.html?anime=${x[0]}&episode=${x[1]}"><img onerror="retryImageLoad(this)" class="lzy_img" src="./static/loading1.gif" data-src=https://thumb.anime-dex.workers.dev/thumb/${episodeId}><div class=ep-title><span>Episode ${epNum}</span></div></a></div>`;
        }
    }
    document.getElementById("ep-slider").innerHTML = ephtml;
    document.getElementById("slider-main").style.display = "block";
    RefreshLazyLoader();

    // Scroll to playing episode
    document.getElementById('main-section').style.display = "block";
    document.getElementsByClassName("ep-slider-playing")[0].scrollIntoView({ behavior: "instant", inline: "start", block: 'end' });
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
    });

    setTimeout(() => {
        document.getElementById('main-section').style.opacity = 1;
        document.getElementById('load').style.display = "none";
    }, 100);

}

// Retry image load
function retryImageLoad(img) {
    const ImageUrl = img.src
    img.src = "./static/loading1.gif";

    // load after 3 second

    setTimeout(() => {

        if (ImageUrl.includes("?t=")) {
            const t = Number(ImageUrl.split("?t=")[1]) + 1;

            // Retry 10 times
            if (t < 5) {
                img.src = ImageUrl.split("?t=")[0] + "?t=" + String(t);
            }
        }
        else {
            img.src = ImageUrl + "?t=1";
        }

    }, 3000);

}


// Function to scroll episode slider
function plusSlides(n) {
    if (n === 1) {
        document.getElementById("slider-carousel").scrollLeft += 600;
    }
    else if (n === -1) {
        document.getElementById("slider-carousel").scrollLeft -= 600;
    }
}

async function RefreshLazyLoader() {
    const imageObserver = new IntersectionObserver((entries, imgObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const lazyImage = entry.target;
                lazyImage.src = lazyImage.dataset.src;
            }
        });
    });
    const arr = document.querySelectorAll("img.lzy_img");
    arr.forEach((v) => {
        imageObserver.observe(v);
    });
}



const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (urlParams.get("anime") == null || urlParams.get("episode") == null) {
    window.location = "./index.html";
}

// Running functions

async function loadEpisodeData(data) {
    data = data["results"];
    const name = data["name"];
    const episodes = data["episodes"];
    const stream = data["stream"];
    const servers = data["servers"];

    document.documentElement.innerHTML =
        document.documentElement.innerHTML.replaceAll("{{ title }}", name);

    try {
        loadVideo(name, stream).then(() => {
            console.log("Video loaded");
            loadServers(servers, true).then(() => {
                console.log("Servers loaded");
            });
        });
    } catch (err) {
        loadServers(servers, false).then(() => {
            console.log("Servers loaded");
        });
    }
}

async function loadData() {
    try {
        let data = await getJson(
            episodeapi +
            urlParams.get("anime") +
            "-episode-" +
            urlParams.get("episode")
        );

        await loadEpisodeData(data)
        const eplist = await getEpList(urlParams.get("anime"))
        console.log("Episode list loaded");
        await getEpSlider(eplist, urlParams.get("episode"))
        console.log("Episode Slider loaded");
    } catch (err) {
        document.getElementById("main-section").style.display = "none";
        document.getElementById("error-page").style.display = "block";
        document.getElementById("error-desc").innerHTML = err;
        console.error(err);
    }
}

loadData();
