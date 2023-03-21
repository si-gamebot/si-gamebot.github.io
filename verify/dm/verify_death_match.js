// @ts-ignore
import PFRNG from "../pfrng.js"; // this will be copied by the build system // TODO set up WebPack
// import DeathMatch from "./death_match_web.js";
import DeathMatch from "./death_match_web.terse.js";

/*
    What do we need to pass into the verifier?
    - server seed (hash will be generated on the page)
    - player1_clientseed
    - player2_clientseed
    - player1_name
    - player2_name
    - replay string
    - cur (currency)
    - bet
*/
class Channel {
    say(msg) {
        msg2(msg);
    }
    sayTo(to, msg) {
        msg2(`${to}: ${msg}`);
    }
    notice(msg) {
        this.say(msg);
    }
    noticeTo(to, msg) {
        this.sayTo(to, msg);
    }
    findNick(nick) {
        return nick; // lol
    }
    endMIGame(_players, _gameKey) {
        // void
    }
}
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
    // function getRoll(nonce: number, diceID: number, clientSeed: string) {
    //     const rollInput = `${nonce}:${diceID}:${clientSeed}`;
    //     // msg2('// roll input: ' + rollInput);
    //     const rollHash = RNG.getHMAC(rollInput, RNG.serverSeed);
    //     const roll = RNG.hashToInt(rollHash, 1, 6);
    //     // msg2('// roll output: ' + roll);
    //     return roll;
    // }
    // function getTurn(player_name: string, player_clientseed: string, turn: number) {
    //     let dice1 = getRoll(turn, 1, player_clientseed);
    //     let dice2 = getRoll(turn, 2, player_clientseed);
    //     return `${player_name} rolls ${dice1+dice2} (${dice1} + ${dice2})`;
    // }
    output1 = ''; // reset;
    const { ss, p1cs, p2cs, p1n, p2n, cur, bet, replay } = getParams();
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
    if (typeof cur === "undefined")
        return error_missing_params();
    if (typeof bet === "undefined")
        return error_missing_params();
    if (typeof replay === "undefined")
        return error_missing_params();
    const server_seed = ss;
    const player1_clientseed = p1cs;
    const player2_clientseed = p2cs;
    const player1_name = p1n;
    const player2_name = p2n;
    const RNG = new PFRNG(server_seed);
    const server_seed_hashed = RNG.getHash(server_seed);
    msg1('Server Seed: ' + server_seed);
    msg2('Server Seed Hashed: ' + server_seed_hashed);
    msg2('');
    msg1('Player 1: ' + player1_name);
    msg1('Player 2: ' + player2_name);
    msg1('Player 1 Client Seed: ' + player1_clientseed);
    msg1('Player 2 Client Seed: ' + player2_clientseed);
    // let i = 1;
    // while (i <= max_nonce) {
    //     msg2(`Turn: ` + i)
    //     msg2( getTurn(player1_name, player1_clientseed, i) );
    //     msg2( getTurn(player2_name, player2_clientseed, i) );
    //     msg2('');
    //     i++;
    // }
    const channel = new Channel();
    const players = [player1_name, player2_name];
    const from = 'server';
    const args = [player1_name, player2_name, bet, cur];
    // @ts-ignore // Channel is a fake stub, so TS doesn't like it. We could fix this by making an interface or superclass... but eh.
    const instance = DeathMatch.factory(channel, players, from, args);
    if (instance == null) {
        alert('error: failed to create instance');
    }
    instance.session.RNG = RNG; // give the instance the same server seed!
    instance.session.weapons['!poly'].enabled = true; // just so the replays work, otherwise we'd have to pass in the weapon enable/disable args too... hassle
    instance.replaySetSeeds(player1_clientseed, player2_clientseed);
    // ^also calls startGame() which selects the first player and sets the state to PLAYING 
    for (const ch of replay) {
        instance.replayWeapon(ch);
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
