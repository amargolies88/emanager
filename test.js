let alphabet = "abcdefghijklmnopqrstuvwxyz"

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const countAsync = async function (n) {
    for (let i = 0; i < n; i++) {
        wait(10000).then(console.log(i));
    }
}

const spellAsync = async function (word) {
    for (let i = 0; i < word.length; i++) {
        console.log(word[i]);
    }
}



countAsync(10);