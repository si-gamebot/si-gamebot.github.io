// @ts-ignore
import PFRNG from "./pfrng.js"; // this will be copied by the build system // TODO set up WebPack
function getParams() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = {};
    for (let key of urlSearchParams.keys()) {
        params[key] = urlSearchParams.get(key);
    }
    // TODO: is there a cleaner way to do this?
    // @ts-ignore
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
    function getRoll(from, nonce, diceID, clientSeed) {
        const rollInput = `${from}:${nonce}:${diceID}:${clientSeed}`;
        // msg2('// roll input: ' + rollInput);
        const rollHash = RNG.getHMAC(rollInput, RNG.serverSeed);
        const roll = RNG.hashToInt(rollHash, 1, 6);
        // msg2('// roll output: ' + roll);
        return roll;
    }
    function getTurn(player_name, player_clientseed, turn) {
        let dice1 = getRoll(player_name, turn, 1, player_clientseed);
        let dice2 = getRoll(player_name, turn, 2, player_clientseed);
        return `${player_name} rolls ${dice1 + dice2} (${dice1} + ${dice2})`;
    }
    output1 = ''; // reset;
    const { ss, p1cs, p2cs, p1n, p2n, n } = getParams();
    if (typeof ss === "undefined")
        return error_missing_params();
    if (typeof p1cs === "undefined")
        return error_missing_params();
    if (typeof p2cs === "undefined")
        return error_missing_params();
    if (typeof p1n === "undefined")
        return error_missing_params();
    if (typeof p2n === "undefined")
        return error_missing_params();
    if (typeof n === "undefined")
        return error_missing_params();
    const server_seed = ss;
    const player1_clientseed = p1cs;
    const player2_clientseed = p2cs;
    const player1_name = p1n;
    const player2_name = p2n;
    const max_nonce = Number(n);
    const RNG = new PFRNG(server_seed);
    const server_seed_hashed = RNG.getHash(server_seed);
    msg1('Server Seed: ' + server_seed);
    msg2('Server Seed Hashed: ' + server_seed_hashed);
    msg2('');
    msg1('Player 1: ' + player1_name);
    msg1('Player 2: ' + player2_name);
    msg1('Player 1 Client Seed: ' + player1_clientseed);
    msg1('Player 2 Client Seed: ' + player2_clientseed);
    let i = 1;
    while (i <= max_nonce) {
        msg2(`Turn: ` + i);
        msg2(getTurn(player1_name, player1_clientseed, i));
        msg2(getTurn(player2_name, player2_clientseed, i));
        msg2('');
        i++;
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
