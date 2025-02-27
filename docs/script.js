/*===============================
  タブ切替機能
===============================*/
document.getElementById("checkerTab").addEventListener("click", function() {
  showMode("checker");
});
document.getElementById("quizTab").addEventListener("click", function() {
  showMode("quiz");
});
function showMode(mode) {
  if (mode === "checker") {
    document.getElementById("checkerMode").style.display = "block";
    document.getElementById("quizMode").style.display = "none";
    document.getElementById("checkerTab").classList.add("active");
    document.getElementById("quizTab").classList.remove("active");
  } else if (mode === "quiz") {
    document.getElementById("checkerMode").style.display = "none";
    document.getElementById("quizMode").style.display = "block";
    document.getElementById("checkerTab").classList.remove("active");
    document.getElementById("quizTab").classList.add("active");
  }
}

/*===============================
  待ち牌チェッカー機能
===============================*/
// 待ち牌チェッカー用のタイル順序（数字1～9と「字」）
const checkerTileOrder = ["1","2","3","4","5","6","7","8","9","字"];
let checkerHand = [];

// タイル追加（チェッカー）
function addCheckerTile(tile) {
  checkerHand.push(tile);
  updateCheckerDisplay();
}

// 配牌表示の更新（ソートして表示）
function updateCheckerDisplay() {
  // ソート（checkerTileOrder順）
  checkerHand.sort((a, b) => checkerTileOrder.indexOf(a) - checkerTileOrder.indexOf(b));
  const display = document.getElementById("checkerHandDisplay");
  display.innerHTML = "";
  if (checkerHand.length === 0) {
    display.innerText = "※ここに配牌が表示されます";
  } else {
    checkerHand.forEach((tile, index) => {
      const span = document.createElement("span");
      span.innerText = tile;
      span.className = "hand-tile";
      span.onclick = () => removeCheckerTile(index);
      display.appendChild(span);
    });
  }
  checkCheckerWait();
}

// タイル削除（チェッカー）
function removeCheckerTile(index) {
  checkerHand.splice(index, 1);
  updateCheckerDisplay();
}

// 配牌クリア（チェッカー）
function clearChecker() {
  checkerHand = [];
  updateCheckerDisplay();
  document.getElementById("checkerResult").innerText = "待ち牌がここに表示されます";
}

// 待ち牌判定（チェッカー）
// 入力枚数が 1,4,7,10,13 枚の場合、各候補牌を追加して和了形になれるか判定
function checkCheckerWait() {
  const allowedCounts = [1, 4, 7, 10, 13];
  const resultDiv = document.getElementById("checkerResult");
  if (!allowedCounts.includes(checkerHand.length)) {
    resultDiv.innerText = "入力枚数が不正です（1,4,7,10,13枚のいずれか）";
    return;
  }
  let waits = [];
  checkerTileOrder.forEach(tile => {
    let newHand = checkerHand.slice();
    newHand.push(tile);
    if (isCheckerWinning(newHand)) waits.push(tile);
  });
  resultDiv.innerText = waits.length === 0 ? "待ちがありません" : "待ち: " + waits.join(" ");
}

// 和了判定（チェッカー用）
// 完成形は対子＋残りが3枚単位の面子（刻子または順子）に分解可能
function isCheckerWinning(tiles) {
  const validCounts = [2, 5, 8, 11, 14];
  if (!validCounts.includes(tiles.length)) return false;
  let counts = {};
  tiles.forEach(tile => {
    counts[tile] = (counts[tile] || 0) + 1;
  });
  for (let tile of checkerTileOrder) {
    if (counts[tile] >= 2) {
      counts[tile] -= 2;
      if (canFormMelds(counts, checkerTileOrder)) {
        counts[tile] += 2;
        return true;
      }
      counts[tile] += 2;
    }
  }
  return false;
}

// 面子（メンツ）に分解可能か再帰チェック
function canFormMelds(counts, order) {
  let done = true;
  for (let key in counts) {
    if (counts[key] > 0) { done = false; break; }
  }
  if (done) return true;
  for (let tile of order) {
    if (counts[tile] && counts[tile] > 0) {
      // 刻子チェック
      if (counts[tile] >= 3) {
        counts[tile] -= 3;
        if (canFormMelds(counts, order)) {
          counts[tile] += 3;
          return true;
        }
        counts[tile] += 3;
      }
      // 数牌の場合、順子チェック（「字」は対象外）
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

/*===============================
  クイズ機能（清一色：ランダム生成版）
===============================*/
// クイズ用タイル順序（数字のみ）
const quizTileOrder = ["1","2","3","4","5","6","7","8","9"];
let quizCurrentAnswer = "";

// 新しいクイズ生成関数
function generateQuiz() {
  // 乱数で、各タイルの出現数が最大4枚までのランダムな13枚の手牌を生成
  let hand = [];
  let counts = {};
  quizTileOrder.forEach(tile => { counts[tile] = 0; });
  while (hand.length < 13) {
    let tile = quizTileOrder[Math.floor(Math.random() * quizTileOrder.length)];
    if (counts[tile] < 4) {
      hand.push(tile);
      counts[tile]++;
    }
  }
  // ソートして表示（定義順）
  hand.sort((a, b) => quizTileOrder.indexOf(a) - quizTileOrder.indexOf(b));
  document.getElementById("quizHand").innerText = hand.join(" ");
  document.getElementById("quizAnswer").innerText = "";
  
  // 待ち牌を判定
  let waits = [];
  quizTileOrder.forEach(tile => {
    let newHand = hand.slice();
    newHand.push(tile);
    if (isQuizWinning(newHand)) {
      waits.push(tile);
    }
  });
  
  quizCurrentAnswer = waits.length === 0 ? "待ちがありません" : waits.join(" ");
}

// 新しい和了判定関数（クイズ用）
// （チェッカーと同じアルゴリズムを利用）
function isQuizWinning(tiles) {
  const validCounts = [2, 5, 8, 11, 14];
  if (!validCounts.includes(tiles.length)) return false;
  let counts = {};
  tiles.forEach(tile => {
    counts[tile] = (counts[tile] || 0) + 1;
  });
  for (let tile of quizTileOrder) {
    if (counts[tile] >= 2) {
      counts[tile] -= 2;
      if (canFormMelds(counts, quizTileOrder)) {
        counts[tile] += 2;
        return true;
      }
      counts[tile] += 2;
    }
  }
  return false;
}

// クイズ結果表示
function showQuizResult() {
  document.getElementById("quizAnswer").innerText = "正解: " + quizCurrentAnswer;
}

// 次のクイズ
function nextQuiz() {
  generateQuiz();
}

// 初回クイズ生成
window.addEventListener("load", function() {
  generateQuiz();
});
document.getElementById("showResultBtn").addEventListener("click", showQuizResult);
document.getElementById("nextBtn").addEventListener("click", nextQuiz);
