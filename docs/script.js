const tileOrder = ["1","2","3","4","5","6","7","8","9","東","南","西","北","白","発","中"];
let hand = [];

// 牌を追加
function addTile(tile) {
  hand.push(tile);
  updateHandDisplay();
}

// 配牌表示の更新（ソートして、各牌はクリックで削除可能）
function updateHandDisplay() {
  // ソート: 定義した順序に従う
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
  // 配牌更新時に待ち判定も実行
  checkWait();
}

// 牌の削除
function removeTile(index) {
  hand.splice(index, 1);
  updateHandDisplay();
}

// 配牌のクリア
function clearHand() {
  hand = [];
  updateHandDisplay();
  document.getElementById("result").innerText = "待ち牌がここに表示されます";
}

// 待ち牌判定：各候補牌を追加して和了形になれるかチェック
function checkWait() {
  const allowedInputCounts = [1, 4, 7, 10, 13];
  const resultDiv = document.getElementById("result");
  if (!allowedInputCounts.includes(hand.length)) {
    resultDiv.innerText = "入力枚数が不正です（1,4,7,10,13枚のいずれか）";
    return;
  }
  let waits = [];
  // 定義済みの全候補牌についてチェック
  tileOrder.forEach(tile => {
    let newHand = hand.slice();
    newHand.push(tile);
    if (isWinning(newHand)) waits.push(tile);
  });
  resultDiv.innerText = waits.length === 0 ? "待ちがありません" : "待ち: " + waits.join(" ");
}

// 和了判定: 牌リストが対子＋3枚単位の面子に分解できるか
function isWinning(tiles) {
  const validCounts = [2, 5, 8, 11, 14]; // 完成形の牌枚数
  if (!validCounts.includes(tiles.length)) return false;
  let counts = {};
  tiles.forEach(tile => {
    counts[tile] = (counts[tile] || 0) + 1;
  });
  // 各牌を対子候補として試す
  for (let tile of tileOrder) {
    if (counts[tile] >= 2) {
      counts[tile] -= 2;
      if (canFormMelds(counts, tileOrder)) {
        counts[tile] += 2;
        return true;
      }
      counts[tile] += 2;
    }
  }
  return false;
}

// 再帰的に、残った牌群がすべて面子（刻子または順子）に分解できるかチェック
function canFormMelds(counts, order) {
  let done = true;
  for (let key in counts) {
    if (counts[key] > 0) { done = false; break; }
  }
  if (done) return true;

  for (let tile of order) {
    if (counts[tile] && counts[tile] > 0) {
      // 刻子（同一牌3枚）のチェック
      if (counts[tile] >= 3) {
        counts[tile] -= 3;
        if (canFormMelds(counts, order)) {
          counts[tile] += 3;
          return true;
        }
        counts[tile] += 3;
      }
      // 数牌の場合、順子（連続3枚）のチェック
      if ("123456789".includes(tile)) {
        let num = parseInt(tile);
        if (num <= 7) {
          let t2 = (num + 1).toString();
          let t3 = (num + 2).toString();
          if ((counts[t2] || 0) > 0 && (counts[t3] || 0) > 0) {
            counts[tile]--;
            counts[t2]--;
            counts[t3]--;
            if (canFormMelds(counts, order)) {
              counts[tile]++;
              counts[t2]++;
              counts[t3]++;
              return true;
            }
            counts[tile]++;
            counts[t2]++;
            counts[t3]++;
          }
        }
      }
      return false;
    }
  }
  return true;
}
