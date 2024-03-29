// @ts-ignore
import PFRNG from "../pfrng.js"; // this will be copied by the build system // TODO set up WebPack
/*
    What do we need to pass into the verifier?
    - server seed (hash will be generated on the page)
    - player_clientseed
    - player_name
*/
function getParams() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = {};
    for (let key of urlSearchParams.keys()) {
        params[key] = urlSearchParams.get(key);
    }
    return params;
}
function error_missing_params() {
    return alert('Invalid URL, missing data.');
}
let output1 = '';
function msg1(m) {
    output1 += m + '<br>\n';
}
let output2 = '';
function msg2(m) {
    output2 += m + '<br>\n';
}
function verify1() {
    output1 = ''; // reset;
    const { ss, cs, p, b, bc } = getParams();
    if (typeof ss === "undefined")
        return error_missing_params();
    if (typeof cs === "undefined")
        return error_missing_params();
    if (typeof p === "undefined")
        return error_missing_params();
    if (typeof b === "undefined")
        return error_missing_params();
    if (typeof bc === "undefined")
        return error_missing_params();
    const server_seed = ss;
    const client_seed = cs;
    const player_name = p;
    const burns = b;
    const burnCounter = bc;
    const RNG = new PFRNG(server_seed);
    const server_seed_hashed = RNG.getHash(server_seed);
    msg1('Server Seed: ' + server_seed);
    msg2('Server Seed Hashed: ' + server_seed_hashed);
    msg2('');
    msg1('Player: ' + player_name);
    msg1('Client Seed: ' + client_seed);
    // Note: we use burnCounter to show the actually rolled number of rolls
    // while burns represents the total possible rolls for this game
    for (let nonce = 1; nonce <= burnCounter; nonce++) {
        const rollInput = `${client_seed}:${nonce}`;
        const rollHash = RNG.getHMAC(rollInput, server_seed);
        const roll = RNG.hashToInt(rollHash, 0, 10000) / 100; // 0.00 - 100.00
        if (burns == 1) {
            msg2(`Roll: ${roll}`);
        }
        else {
            msg2(`Roll #${nonce}: ${roll}`);
        }
    }
    document.getElementById('output1').innerHTML = output1;
}
function verify2() {
    document.getElementById('output2').innerHTML = output2;
}
verify1(); // automatic
// @ts-ignore
window.verify2 = verify2;
// verify2(); // user clicks button
