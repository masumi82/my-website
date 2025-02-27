const tileOrder = ["1","2","3","4","5","6","7","8","9","東","南","西","北","白","発","中"];
let hand = [];

function addTile(tile) {
  hand.push(tile);
  updateHandDisplay();
}

function updateHandDisplay() {
  hand.sort((a, b) => tileOrder.indexOf(a) - tileOrder.indexOf(b));
  const handDisplay = document.getElementById("handDisplay");
  handDisplay.innerHTML = "";
  if (hand.length === 0) {
    handDisplay.innerText = "※ここに配牌が表示されます";
  } else {
    hand.forEach((tile, index) => {
      const span = document.createElement("span");
      span.innerText = tile;
      span.className = "hand-tile";
      span.onclick = () => removeTile(index);
      handDisplay.appendChild(span);
    });
  }
  checkWait();
}

function removeTile(index) {
  hand.splice(index, 1);
  updateHandDisplay();
}

function clearHand() {
  hand = [];
  updateHandDisplay();
  document.getElementById("result").innerText = "待ち牌がここに表示されます";
}

function checkWait() {
  const resultDiv = document.getElementById("result");
  if (![1, 4, 7, 10, 13].includes(hand.length)) {
    resultDiv.innerText = "入力枚数が不正です（1,4,7,10,13枚のいずれか）";
    return;
  }
  const candidates = tileOrder;
  let waits = [];
  candidates.forEach(tile => {
    let newHand = hand.slice();
    newHand.push(tile);
    if (isWinning(newHand)) waits.push(tile);
  });
  resultDiv.innerText = waits.length === 0 ? "待ちがありません" : "待ち: " + waits.join(" ");
}

function isWinning(tiles) {
  return tiles.length % 3 === 2;
}
