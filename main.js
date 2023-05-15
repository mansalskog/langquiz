async function all_langs() {
    const common_page = "Earth"; // Name of a page that hopefully exists on all Wikipedias
    const api_url = `https://api.wikimedia.org/core/v1/wikipedia/en/page/${common_page}/links/language`;
    const dn = new Intl.DisplayNames(["en"], {type: "language"});
    let ls = await fetch(api_url).then(r => r.json())
    ls.forEach(l => {
        if (l.code === "zh-classical") {
            // For some reason the Intl function does not know this language
            l.en_name = "Classical Chinese";
        } else {
            l.en_name = dn.of(l.code)
        }
    });
    // filter out the languages that Intl doesn't know, partly to make the
    // game easier, partly to skip the trouble of finding out their names
    ls = ls.filter(l => !(l.en_name.toLowerCase() === l.en_name && (l.en_name.length === 2 || l.en_name.length === 3)));
    return ls;
}

async function rand_art_text(lang) {
    const api_url = `https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`;
    return await fetch(api_url).then(r => r.json()).then(o => o.extract);
}

// Globals...
let langs = [];
let guess = null;
let answer = null;
let score = 0;
let count = 0;

async function new_quest() {
    answer = langs[Math.floor(Math.random() * langs.length)];
    document.getElementById("summary").textContent = await rand_art_text(answer.code);
}

async function upd_score(win) {
    let msg = "";
    if (win) {
        score++;
        msg = "Correct!"
    } else {
        msg = `Wrong, it was ${answer.en_name} (${answer.name})!`;
    }
    count++;
    document.getElementById("score").textContent = `${msg} Score: ${score} / ${count}`;
}

async function upd_guess(e) {

}

async function try_guess(e) {
    document.getElementById("guess").value = "";
    upd_score(guess === answer.en_name);
    new_quest();
}

async function main() {
    langs = await all_langs();
    langs.forEach(l => {
        const c = document.createElement("option");
        c.value = l.en_name;
        document.getElementById("langs").appendChild(c);
    });
    document.getElementById("guess").addEventListener("input",
        e => guess = e.target.value);
    document.getElementById("guess").addEventListener("keypress",
        e => e.key === "Enter" && try_guess());
    document.getElementById("tryit").addEventListener("click", try_guess);
    new_quest();
}

window.addEventListener("load", main);
