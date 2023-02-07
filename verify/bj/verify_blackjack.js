// @ts-ignore
import PFRNG from "../pfrng.js";
class BJCard {
    // cardNo: number; // 1..13
    suit;
    value;
    shortName;
    longName;
    cardASCII; // e.g. [2♥️] 
    fullName; // e.g. 2 of Hearts
    constructor(cardNo, suitNo) {
        console.log(typeof cardNo, typeof suitNo);
        console.log('cardNo:', cardNo, 'suitNo:', suitNo);
        // this.cardNo = cardNo;
        this.suit = this.getSuit(suitNo);
        // Note: We use 1 for the ace, and treat it as 11 when appropriate
        let value = cardNo;
        if (value > 10)
            value = 10;
        this.value = value;
        if (cardNo === 1) {
            this.shortName = "A";
            this.longName = "Ace";
        }
        else if ((cardNo >= 2) && (cardNo <= 10)) {
            this.shortName = String(cardNo);
            this.longName = String(cardNo);
        }
        else {
            switch (cardNo) {
                case 11:
                    this.shortName = "J";
                    this.longName = "Jack";
                    break;
                case 12:
                    this.shortName = "Q";
                    this.longName = "Queen";
                    break;
                case 13:
                    this.shortName = "K";
                    this.longName = "King";
                    break;
                default: throw "unknown cardNo";
            }
        }
        this.cardASCII = this.getCardASCII(this.shortName, this.suit);
        this.fullName = this.getFullName(this.longName, this.suit);
    }
    getSuit(suitNo) {
        switch (suitNo) {
            case 1: return "♥️";
            case 2: return "♣️";
            case 3: return "♦️";
            case 4: return "♠️";
            default: throw "unknown suitNo";
        }
    }
    getSuitName(suit) {
        switch (suit) {
            case "♥️": return "Hearts";
            case "♣️": return "Clubs";
            case "♦️": return "Diamonds";
            case "♠️": return "Spades";
            default: throw "unknown suit";
        }
    }
    getCardASCII(name, suit) {
        return '[' + name + suit + ']';
    }
    getFullName(name, suit) {
        return name + " of " + this.getSuitName(suit);
    }
}
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
    const playerCards = [];
    const dealerCards = [];
    let nonce = 0;
    function drawCard() {
        const cardNoStr = `${client_seed}:${nonce}`;
        console.log('cardNoStr:', cardNoStr);
        nonce++;
        const cardNoHash = RNG.getHMAC(cardNoStr, RNG.serverSeed);
        const cardNo = RNG.hashToInt(cardNoHash, 1, 13);
        console.log('cardNo:', cardNo, 'cardNoStr:', cardNoStr);
        const suitNoStr = `${client_seed}:${nonce}`;
        nonce++;
        const suitNoHash = RNG.getHMAC(suitNoStr, server_seed);
        const suitNo = RNG.hashToInt(suitNoHash, 1, 4);
        console.log('suitNo:', suitNo, 'suitNoStr:', suitNoStr);
        return new BJCard(cardNo, suitNo);
    }
    function deal_player() {
        playerCards.push(drawCard());
    }
    function deal_dealer() {
        dealerCards.push(drawCard());
    }
    function stay() {
        // nothing
    }
    function hit() {
        deal_player();
    }
    function doubleDown() {
        deal_player();
    }
    function getPlayerCardsValue() {
        return getCardsValue(playerCards);
    }
    function getDealerCardsValue() {
        return getCardsValue(dealerCards);
    }
    function getCardsValue(cards) {
        let value = 0;
        let aces = [];
        for (let card of cards) {
            if (card.value === 1) {
                aces.push(card); // we will handle aces below
            }
            else {
                value += card.value;
            }
        }
        for (let _ace of aces) {
            value += 11;
        }
        // convert 11s to 1s, but only if we overshot
        for (let _ace of aces) {
            if (value <= 21)
                break; // we stop as soon as we're back below bust territory 
            value -= 10;
        }
        return value;
    }
    function say_player_cards() {
        let cardsStr = '';
        for (const card of playerCards) {
            cardsStr += card.cardASCII + " ";
        }
        msg2("Your cards: " + cardsStr + " - Value: " + getPlayerCardsValue());
    }
    function show_dealer_all_cards() {
        let cardsStr = '';
        for (const card of dealerCards) {
            cardsStr += card.cardASCII + " ";
        }
        msg2("Dealer's cards: " + cardsStr + " - Value: " + getDealerCardsValue());
    }
    // verification
    output1 = ''; // reset;
    const { ss, cs, p, m } = getParams();
    if (typeof ss === "undefined")
        return error_missing_params();
    if (typeof cs === "undefined")
        return error_missing_params();
    if (typeof p === "undefined")
        return error_missing_params();
    if (typeof m === "undefined")
        return error_missing_params();
    const server_seed = ss;
    const client_seed = cs;
    const player_name = p;
    const moves = m;
    const RNG = new PFRNG(server_seed);
    const server_seed_hashed = RNG.getHash(server_seed);
    msg1('Server Seed: ' + server_seed);
    msg2('Server Seed Hashed: ' + server_seed_hashed);
    msg2('');
    msg1('Player: ' + player_name);
    msg1('Client Seed: ' + client_seed);
    // draw first cards:
    deal_player();
    deal_dealer();
    deal_player();
    deal_dealer();
    // players moves
    for (const move of moves) {
        switch (move) {
            case "S":
                stay();
                break;
            case "H":
                hit();
                break;
            case "D":
                doubleDown();
                break;
        }
    }
    // dealers moves
    if (getPlayerCardsValue() < 21) {
        while (getDealerCardsValue() < 17) {
            deal_dealer();
        }
    }
    // show results
    say_player_cards();
    show_dealer_all_cards();
    document.getElementById('output1').innerHTML = output1;
}
function verify2() {
    document.getElementById('output2').innerHTML = output2;
}
verify1(); // automatic
// @ts-ignore
window.verify2 = verify2;
// verify2(); // user clicks button
