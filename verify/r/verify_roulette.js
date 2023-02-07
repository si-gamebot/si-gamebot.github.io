// @ts-ignore
import PFRNG from "../pfrng.js";
/////////////////
///////////
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
    // game functions
    function getSpin() {
        const spinInputStr = `${client_seed}`;
        console.log('spinInputStr:', spinInputStr);
        const spinHash = RNG.getHMAC(spinInputStr, RNG.serverSeed);
        const spinInteger = RNG.hashToInt(spinHash, 0, 37);
        console.log('spinInteger:', spinInteger, 'spinInputStr:', spinInputStr);
        if (spinInteger == 37 || spinInteger == 0) {
            return "00";
        }
        else {
            if (spinInteger < 10) {
                return "0" + String(spinInteger); // never underestimate the importance of aesthetics!
            }
            else {
                return String(spinInteger);
            }
        }
    }
    // verification
    output1 = ''; // reset;
    const { ss, cs } = getParams();
    if (typeof ss === "undefined")
        return error_missing_params();
    if (typeof cs === "undefined")
        return error_missing_params();
    const server_seed = ss;
    const client_seed = cs;
    const RNG = new PFRNG(server_seed);
    const server_seed_hashed = RNG.getHash(server_seed);
    msg1('Server Seed: ' + server_seed);
    msg2('Server Seed Hashed: ' + server_seed_hashed);
    msg2('');
    msg1('Client Seed: ' + client_seed);
    // game-specific verification code
    const spin = getSpin();
    // show results
    msg2('Spin: ' + spin);
    document.getElementById('output1').innerHTML = output1;
}
function verify2() {
    document.getElementById('output2').innerHTML = output2;
}
verify1(); // automatic
// @ts-ignore
window.verify2 = verify2;
// verify2(); // user clicks button
