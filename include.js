// canvas設定
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const playerWidth = 40;
const playerHeight = 40;
const enemyWidth = 40;
const enemyHeight = 40;
let playerSpeed = 3;
canvas.width = 800;
canvas.height = 600;
const MAX_ENEMY = 5;
const backgroundMusic = new Audio("music/background-music.mp3");
let xp_Z = 0;   //レベルアップ時に余った経験値
let statusPoint = 0;
let frameCount = 0;
let gameStarted = false;
let battleStarted = false;
let ONorOFF = false;
const speed = 1; // 敵の移動速度
let lastEnemyAttackTime = 0; // 最後に攻撃した時間
const ENEMY_ATTACK_COOLDOWN = 1000; // 1秒 (1000ミリ秒)
var animx = 0;
var animy = 0;
let maptip;
let map;
let posx = posy = 5;
let MapWidth = 40;
let MapHeight = 40;
const DrawSize = 64; // マップタイルのサイズ
const MapDrawWidth = 15; // 描画するタイルの横幅
const MapDrawHeight = 15; // 描画するタイルの縦幅
let AnimationNum = 16;
let scrollX = scrollY = 0;
const tileSize = 60;
let lastSpawnTime = 0;
const SPAWN_INTERVAL = 5000; // 敵の出現間隔 (ミリ秒)
let player = {
    x: canvas.width / 2 - playerWidth / 2, // 初期位置は画面の中央
    y: canvas.height / 2 - playerHeight / 2,  // プレイヤーを画面中央に配置
    width: playerWidth,
    height: playerHeight,
    img: new Image(), // プレイヤーの画像
    dx: 0,
    dy: 0,
    level: 1,
    XP: 0,
    maxXp: 200,
    HP: 100,
    maxHealth: 100,
    MP: 100,
    maxMp: 100,
    strength: 1,
    attackSpeed: 1,
    resistance: 1,
    int: 1,
    luck: 1,
    statusPoint,
    profession: "",
};


let lastKeyPressTime = {
    space: 0,
    q: 0,
    w: 0,
    e: 0,
    r: 0,
    t: 0,
    y: 0,
    u: 0
};
const keyCooldown = 100; // ミリ秒単位（500ms = 0.5秒）

let enemies = [];  // 複数の敵を管理する配列
let backgroundimg = new Image();
let titleimg = new Image();
let keys = {
    up: false,
    right: false,
    down: false,
    left: false,
    space: false,
    enter: false,
    q: false,
    w: false,
    e: false,
    r: false,
    t: false,
    y: false,
    u: false,
    l: false,
    s: false,
    
};
imgPlayer = [];
imgPlayer[0] = new Image();
imgPlayer[0].src = "./image/player0.png";
imgPlayer[1] = new Image();
imgPlayer[1].src = "./image/player1.png";
backgroundimg.src = "image/background.png";
titleimg.src = "image/title.png";
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5; // 音量を50%に設定
scrollX = 0;
scrollY = 0;
// ゲームの初期化
function init() {
    if(gameStarted) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        mapinit();
        drawMap();
        updateScreen();
        drawPlayer();
        playerMove();
        statusBar();
        checkGameOver();
        regenerate();
        // 敵の状態確認
        checkEnemyHealth();
        drawSkillUI();
        drawEffects();
        updateEffects();
    
        // 画面描画
        frameCount++;

        if(battleStarted) {
            enemyAttack();
        }

        drawQuestUI();
        
        
        if(frameCount % 100 == 0) {
            if(player.MP < player.maxMp)
                player.MP += 2*player.int;
            if(player.MP >= player.maxMp) {
                player.MP = player.maxMp;
            }
        }
        }else {
            backgroundMusic.pause();
            return;
        }
        requestAnimationFrame(init);
}

function startGameLoop() {
    init();  // 60FPS (1000ms / 60 ≈ 16.67ms)
}

//ゲームの保存
function saveGame() {
    const playerData = {
        level: player.level,
        XP: player.XP,
        maxXp: player.maxXp,
        HP: player.HP,
        maxHealth: player.maxHealth,
        MP: player.MP,
        maxMp: player.maxMp,
        strength: player.strength,
        attackSpeed: player.attackSpeed,
        resistance: player.resistance,
        int: player.int,
        luck: player.luck,
        statusPoint: player.statusPoint,
        profession: player.profession,
    };
    localStorage.setItem("playerData", JSON.stringify(playerData));
    console.log("Game saved");
}

function newGame() {
    player = {
        x: canvas.width / 2 - playerWidth / 2,
        y: canvas.height / 2 - playerHeight / 2,
        width: playerWidth,
        height: playerHeight,
        img: new Image(),
        level: 1,
        XP: 0,
        maxXp: 200,
        HP: 100,
        maxHealth: 100,
        MP: 100,
        maxMp: 100,
        strength: 1,
        attackSpeed: 1,
        resistance: 1,
        int: 1,
        luck: 1,
        statusPoint: 0,
        dx: 0,
        dy: 0,
    };
    enemies = []; // 敵リスト初期化
    console.log("新しいゲームを開始しました。");
    spawnEnemy();
    spawnEnemy();
}

//ゲームのロード
function loadGame() {
    const savedData = localStorage.getItem("playerData");
    if (savedData) {
        const playerData = JSON.parse(savedData);
        player.level = playerData.level;
        player.XP = playerData.XP;
        player.maxXp = playerData.maxXp;
        player.HP = playerData.HP;
        player.maxHealth = playerData.maxHealth;
        player.MP = playerData.MP;
        player.maxMp = playerData.maxMp;
        player.strength = playerData.strength;
        player.attackSpeed = playerData.attackSpeed;
        player.resistance = playerData.resistance;
        player.int = playerData.int;
        player.luck = playerData.luck;
        player.statusPoint = playerData.statusPoint;
        player.profession = playerData.profession;
        console.log("Game loaded.");
        gameStarted = true; // ゲーム開始フラグをセット
        professionSelected = true;
        startGameLoop(); // ゲームループを開始
        spawnEnemy();
        spawnEnemy();
    } else {
        console.log("No saved game found.");
    }
}

// マップの定義
function mapinit() {
    map = [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 2],
      [2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2],
      [2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [2, 2, 2, 2, 2, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0],
      [2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
      [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0],
      [2, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 3, 3, 3, 2, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 3, 3, 3, 2, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 2, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 2, 2],
    ];
  
    // マップチップの読み込み
    maptip = [];
    for (var i = 0; i < 4; i++) {
      maptip[i] = new Image();
      maptip[i].src = "./image/maptip" + i + ".png";
    }
  
    // 初期スクロール量をマップの中心に設定
    scrollX = (posx - Math.floor(MapDrawWidth / 2)) * DrawSize;
    scrollY = (posy - Math.floor(MapDrawHeight / 2)) * DrawSize;
  }
  
  // スクロールの更新
  function updateScreen() {
    scrollX = Math.max(
      0,
      Math.min(
        player.x - canvas.width / 2,
        map[0].length * DrawSize - canvas.width
      )
    );
    scrollY = Math.max(
      0,
      Math.min(
        player.y - canvas.height / 2,
        map.length * DrawSize - canvas.height
      )
    );
     // // マップの描画
     drawMap();
  
    // // プレイヤーや敵の描画
    if (enemies.length < MAX_ENEMY && frameCount % 1000 === 0) {
      spawnEnemy();
      spawnEnemy();
  }
     drawEnemies();
     enemyStatusBar();
     handleEnemyCollisions();
     drawNPC();
     for (let i = 0; i < enemies.length; i++) {
      enemyAI(enemies[i]);
  }
     npcTalking();
     battle();
  }
  
  // マップの描画
  function drawMap() {
    // マップの描画範囲（キャンバス内に描画する部分）
    const startX = Math.floor(scrollX / DrawSize);
    const startY = Math.floor(scrollY / DrawSize);
    const endX = Math.min(
      startX + Math.ceil(canvas.width / DrawSize) + 1,
      map[0].length
    );
    const endY = Math.min(
      startY + Math.ceil(canvas.height / DrawSize) + 1,
      map.length
    );
    
  
    // マップ範囲内を描画
    for (let i = startY; i < endY; i++) {
      for (let j = startX; j < endX; j++) {
        const screenX = (j - startX) * DrawSize - (scrollX % DrawSize);
        const screenY = (i - startY) * DrawSize - (scrollY % DrawSize);
  
        // 地形に応じたタイルを描画
        if (map[i] && map[i][j] !== undefined) {
          ctx.drawImage(maptip[map[i][j]], screenX, screenY, DrawSize, DrawSize);
        }
      }
    }
  }
  
  let npc = {
    x: 180, // マップ上で通行不可能な位置に配置
    y: 120,
    width: 40,
    height: 40,
    img: new Image(),
    isTalking: false,
};
npc.img.src = "./image/player0.png"; // NPCの画像

// NPCを描画する関数
function drawNPC() {
    const drawnpcX = npc.x - scrollX;
    const drawnpcY = npc.y - scrollY;

    // NPCの描画
    ctx.drawImage(npc.img, drawnpcX, drawnpcY, npc.width, npc.height);

    // プレイヤーが近ければ通知を表示
    if (checkInteraction() && !npc.isTalking) {
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Press Enter to talk", drawnpcX, drawnpcY - 10);
    }
}


// プレイヤーがNPCの近くにいるかを確認
function checkInteraction() {
    const distanceX = Math.abs(player.x - npc.x);
    const distanceY = Math.abs(player.y - npc.y);
    const interactionRange = 50; // インタラクト可能な距離

    return distanceX <= interactionRange && distanceY <= interactionRange;
}
// Enterキーが押された場合の処理
window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (checkInteraction()) {
            if (!npc.isTalking) {
                npc.isTalking = true; // 会話開始
                //npc.id = "questGiver";
                // 会話中の処理をここに追加できます
            } else {
                npc.isTalking = false; // 会話終了
            }
        }
    }
});

const professions = {
    Warrior: {
        baseHealth: 150,
        baseMp: 30,
        strengthGrowth: 3,
        resistanceGrowth: 2,
        intGrowth: 1,
        skills: ["Power Strike", "Shield Block"],
    },
    Mage: {
        baseHealth: 80,
        baseMp: 100,
        strengthGrowth: 1,
        resistanceGrowth: 1,
        intGrowth: 5,
        skills: ["Fireball", "Mana Shield"],
    },
    Thief: {
        baseHealth: 100,
        baseMp: 50,
        strengthGrowth: 2,
        resistanceGrowth: 1,
        luckGrowth: 3,
        skills: ["Backstab", "Evasion"],
    },
};



// プレイヤーの描画

function drawPlayer() {
    if (frameCount % 15 < 7) {
        ctx.drawImage(imgPlayer[0], player.x, player.y, player.width, player.height);
    } else {
        ctx.drawImage(imgPlayer[1], player.x, player.y, player.width, player.height);
    }
}

// プレイヤーの移動
function playerMove() {
    if(!npc.isTalking) {
        if (keys.up && player.y > 0) {
            player.y -= playerSpeed; // 上に移動
            posy--;
        }
        if (keys.down && player.y + player.height < canvas.height) {
            player.y += playerSpeed; // 下に移動
            posy++;
        }
        if (keys.left && player.x > 0) {
            player.x -= playerSpeed; // 左に移動
            posx--;
        }
        if (keys.right && player.x + player.width < canvas.width) {
            player.x += playerSpeed; // 右に移動
            posx++;
        }
        updateScroll();  
    }
}

function updateScroll() {
    const offsetX = (posx - Math.floor(MapDrawWidth / 2)); // プレイヤーを画面中央に表示
    const offsetY = (posy - Math.floor(MapDrawHeight / 2));

    // スクロール位置がマップの範囲外に出ないように制限
    scrollX = Math.max(0, Math.min(offsetX, map[0].length * canvas.width));
    scrollY = Math.max(0, Math.min(offsetY, map.length * canvas.height));
}

function levelEvent() {
    while (player.XP >= player.maxXp) {
        player.XP -= player.maxXp;
        if (player.level < 100) {
            player.level++;
            player.maxXp = Math.ceil(player.maxXp * 1.3);
            player.maxHealth += 10 + player.resistance * 2;
            player.maxMp += 5 + player.int;
            player.attackSpeed++;
            player.statusPoint += 3;
            player.HP = player.maxHealth;
            player.MP = player.maxMp;
        } else {
            player.level = 100;
        }
    }
}


function statusBar() {
    const barX = 80;
    const barWidth = 300;
    const healthBarHeight = 20;
    const mpBarHeight = 20;
    const xpBarHeight = 10;
    ctx.font = "15px Arial";

    // HPバー
    ctx.fillStyle = "black";
    ctx.fillRect(barX, 5, barWidth, healthBarHeight);
    ctx.fillStyle = "rgb(30, 255, 30)";
    ctx.fillRect(barX, 5, (player.HP / player.maxHealth) * barWidth, healthBarHeight);
    ctx.fillStyle = "white";
    ctx.fillText(`HP: ${player.HP} / ${player.maxHealth}`, barX + 10, 20);

    // MPバー
    ctx.fillStyle = "black";
    ctx.fillRect(barX, 30, barWidth, mpBarHeight);
    ctx.fillStyle = "blue";
    ctx.fillRect(barX, 30, (player.MP / player.maxMp) * barWidth, mpBarHeight);
    ctx.fillStyle = "white";
    ctx.fillText(`MP: ${player.MP} / ${player.maxMp}`, barX + 10, 43);

    // XPバー
    ctx.fillStyle = "black";
    ctx.fillRect(barX, 55, barWidth, xpBarHeight);
    ctx.fillStyle = "yellow";
    ctx.fillRect(barX, 55, (player.XP / player.maxXp) * barWidth, xpBarHeight);
    ctx.fillStyle = "green";
    ctx.fillText(`XP: ${player.XP} / ${player.maxXp}`, barX + 10, 65);

    // レベル表示
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`LV.${player.level}`, barX - 70, 35);

    if (ONorOFF) {
        statusScreen();
        powerUp();
    }
}

//ポイント振り分け
function powerUp() {
    if (player.statusPoint > 0) {
        const upgrades = [
            { key: 'q', effect: () => { player.maxHealth += 10; }, desc: "Health +10" },
            { key: 'w', effect: () => { player.maxMp += 10; }, desc: "MP +10" },
            { key: 'e', effect: () => { player.strength += 2; }, desc: "Strength +2" },
            { key: 'r', effect: () => { player.attackSpeed++; }, desc: "Attack Speed +1" },
            { key: 't', effect: () => { player.resistance++; player.maxHealth += player.resistance * 5; }, desc: "Resistance +1" },
            { key: 'y', effect: () => { player.int++; player.maxMp += player.int * 3; }, desc: "Intelligence +1" },
            { key: 'u', effect: () => { player.luck++; }, desc: "Luck +1" },
        ];

        const currentTime = Date.now();

        for (const upgrade of upgrades) {
            if (keys[upgrade.key] && currentTime - lastKeyPressTime[upgrade.key] > keyCooldown) {
                upgrade.effect();
                player.statusPoint--;
                lastKeyPressTime[upgrade.key] = currentTime;
                console.log(`Upgraded: ${upgrade.desc}`);
            }
        }
    }
}

function regenerate() {
    const currentTime = Date.now();
    if (keys.space && keys.r && !battleStarted && currentTime - lastKeyPressTime.space > keyCooldown) {
        if (player.MP >= 2 && player.HP < player.maxHealth) {
            player.MP -= 2;
            player.HP = Math.min(player.HP + 50 * player.int / 2, player.maxHealth); // 回復量を制限
            lastKeyPressTime.space = currentTime;
        }
    }
}

function defeatEnemy(enemy) {
    updateQuestProgress("kill", 1);
    player.XP += Math.floor((enemy.level * 80) + (player.luck*1.2)); // 敵のレベルに応じてXPを付与
    levelEvent();
    enemies = enemies.filter(e => e !== enemy); // 敵をリストから削除
}

function collectItem(item) {
    if (item.type === "herb") {
        updateQuestProgress("collect", 1);
    }
}

function escortNPCComplete() {
    updateQuestProgress("escort", 1);
}

function spawnEnemy() {
    const currentTime = Date.now();
    // 一定時間経過後にのみ敵を生成
    if (currentTime - lastSpawnTime >= SPAWN_INTERVAL) {
        let enemyLevel = Math.floor(Math.random() * (player.level + 5)) + 1;
        let baseAttack = 5;
        let levelAttackBonus = 2;
        let enemyAttack = baseAttack + (enemyLevel - 1) * levelAttackBonus;

        let x, y;
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height; // 通行可能な場所が見つかるまで繰り返し

        let newEnemy = {
            x,
            y,
            width: enemyWidth,
            height: enemyHeight,
            img: new Image(),
            level: enemyLevel,
            strength: enemyAttack,
            health: 80 * enemyLevel,
            maxHealth: 80 * enemyLevel,
            resistance: 10 * enemyLevel,
        };
        newEnemy.img.src = "image/enemy.png";
        enemies.push(newEnemy);

        lastSpawnTime = currentTime; // 敵の生成時間を更新
    }
}

// 敵AI (プレイヤーに向かって移動)
function enemyAI(enemy) {
    const speed = 2; // 敵の移動速度
    let targetX = enemy.x;
    let targetY = enemy.y;

    if (enemy.x < player.x) targetX += speed;
    if (enemy.x > player.x) targetX -= speed;
    if (enemy.y < player.y) targetY += speed;
    if (enemy.y > player.y) targetY -= speed;

    // 移動先が通行可能かを確認
        enemy.x = targetX;
        enemy.y = targetY;
}

// 敵の描画
function drawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
  
      // 敵の位置をスクロール量を考慮して計算
      let drawenemyX = enemy.x - scrollX;
      let drawenemyY = enemy.y - scrollY;
      // 敵が画面外にいる場合は描画しない
      if (drawenemyX + enemy.width < 0 || drawenemyX > canvas.width || drawenemyY + enemy.height < 0 || drawenemyY > canvas.height) {
        //continue; // 描画しない
      }
  
      // 敵の描画
      ctx.drawImage(enemy.img, drawenemyX, drawenemyY, enemy.width, enemy.height);
    }
  }

// 敵との衝突判定（接触時バトル開始）
function handleEnemyCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        drawenemyX = enemy.x - scrollX;
        drawenemyY = enemy.y - scrollY;
        if (
            player.x < drawenemyX + enemy.width &&
            player.x + player.width > drawenemyX &&
            player.y < drawenemyY + enemy.height &&
            player.y + player.height > drawenemyY
        ) {
            battleStarted = true;
            return;
        }
    }
    battleStarted = false;
}

//敵のステータス調整
function enemyLevel(enemy) {
    enemy.level = player.level;
    enemy.maxHealth = 100 + 50 * enemy.level; // 基本体力 + レベルごとの体力ボーナス
    enemy.health = enemy.maxHealth; // 現在の体力も更新
    enemy.strength = Math.ceil(enemy.level * 2.5); // レベルごとの攻撃力
    enemy.resistance = Math.ceil(enemy.level * 1.5); // レベルごとの耐性
}

function enemyAttack() {
    const currentTime = Date.now();
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (currentTime - lastEnemyAttackTime >= ENEMY_ATTACK_COOLDOWN) {
            const damage = Math.max(1, enemy.strength - player.resistance);
            player.HP -= damage; // プレイヤーにダメージを与える
            console.log(`敵が攻撃: ${damage} ダメージ`);

            lastEnemyAttackTime = currentTime; // 攻撃時間を更新
        }

        if (player.HP <= 0) {
            console.log("ゲームオーバー");
            player.HP = 0; // HPを0に固定
            battleStarted = false; // 戦闘を終了
            return;
        }
    }
}


function checkEnemyHealth() {
    enemies.forEach((enemy, index) => {
        if (enemy.health <= 0) {
            enemies.splice(index, 1); // 敵を配列から削除
            if (targetedEnemy === enemy) {
                targetedEnemy = null; // ターゲットをリセット
            }
        }
    });
}

// 敵のステータスバー
function enemyStatusBar() {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
  
      // 敵の位置をスクロール量を考慮して計算
      const enemyScreenX = enemy.x - scrollX;
      const enemyScreenY = enemy.y - scrollY;
  
      // 敵が画面外にいる場合はステータスバーを描画しない
      if (enemyScreenX + enemy.width < 0 || enemyScreenX > canvas.width || enemyScreenY + enemy.height < 0 || enemyScreenY > canvas.height) {
        //continue; // ステータスバーを描画しない
      }
  
      // スクロール量を考慮してステータスバーの位置を計算
      const barWidth = 100;
      const barHeight = 10;
      const barX = enemyScreenX - 25;  // スクロールを考慮した位置
      const barY = enemyScreenY - 15;  // スクロールを考慮した位置
  
      // 背景バー（HPバーの背景）
      ctx.fillStyle = "black";
      ctx.fillRect(barX, barY, barWidth, barHeight);
  
      // HPバー（現在のHP）
      ctx.fillStyle = "red";
      ctx.fillRect(barX, barY, (enemy.health / enemy.maxHealth) * barWidth, barHeight);
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.fillText(`HP: ${enemy.health} / ${enemy.maxHealth}`, barX, barY+7);
      // レベル表示
      ctx.font = "10px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`Lv.${enemy.level}`, barX + barWidth / 2 - 10, barY - 2);
    }
  }

  const skills = [
    {
        id: "fireball",
        name: "ファイアボール",
        mpCost: 10,
        damageMultiplier: 2.0,
        cooldown: 5,
        lastUsed: 0,
        icon: "image/skillIcon/fireball.png", // アイコン画像パス
    },
    {
        id: "Power Strike",
        name: "パワーストライク",
        damageMultiplier: 3.0,
        cooldown: 8,
        ladtUsed: 0,
        icon: "image/skillIcon/slash.png",
    }
    
];

let activeEffects = []; // 発動中のスキルエフェクトを管理

// スキルエフェクトのクラス
function updateEffects() {
    activeEffects.forEach(effect => effect.update());
    activeEffects = activeEffects.filter(effect => effect.isActive); // 無効化エフェクト削除
}

function drawEffects() {
    activeEffects.forEach(effect => effect.draw());
}

class SkillEffect {
    constructor(skill, x, y, target) {
        this.skill = skill;
        this.x = x;
        this.y = y;
        this.target = target;
        this.speed = 5; 
        this.isActive = true;
    }

    update() {
        if (!this.isActive) return;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            this.hitTarget();
        } else {
            const stepX = (dx / distance) * this.speed;
            const stepY = (dy / distance) * this.speed;
            this.x += stepX;
            this.y += stepY;
        }
    }

    hitTarget() {
        console.log(`${this.skill.name} が ${this.target.name} にヒットしました！`);
        this.target.health -= this.skill.damageMultiplier * player.int;
        if (this.target.health <= 0) {
            console.log(`${this.target.name} を倒しました！`);
            defeatEnemy(this.target);
        }
        this.isActive = false;
    }

    draw() {
        if (!this.isActive) return;
        ctx.drawImage(this.skill.img, this.x, this.y, 100, 100);
    }
}


skills.forEach(skill => {
    const img = new Image();
    img.src = skill.icon;
    skill.img = img;
});

function skillEffect(skill) {
    // スキルのエフェクトを表示
    if (skill.img.complete) {
        //ctx.drawImage(skill.img, player.x, player.y, 100, 100);
        console.log(`${skill.name} のエフェクトを表示しました`);
    } else {
        console.log("スキル画像がまだ読み込まれていません");
    }
}

function createSkillEffect(skill, target) {
    if (Array.isArray(target)) {
        // 範囲スキル用
        target.forEach(t => {
            if (!t) {
                console.error("ターゲットが無効です:", t);
                return;
            }
            const effect = new SkillEffect(skill, player.x, player.y, t);
            activeEffects.push(effect);
        });
    } else if (target) {
        // 単体スキル用
        const effect = new SkillEffect(skill, player.x, player.y, target);
        activeEffects.push(effect);
    } else {
        console.error("ターゲットが未定義です！");
    }
}



function useSkill(skillId, target) {
    const skill = skills.find(s => s.id === skillId);
    const now = Date.now() / 1000; // 現在時刻（秒単位）
    if (!skill) {
        console.log("スキルが存在しません！");
        return;
    }

    // クールダウン中の場合
    if (now - skill.lastUsed < skill.cooldown) {
        console.log(`${skill.name} はまだクールダウン中です！`);
        return;
    }
    // MPが足りない場合
    if (player.MP < skill.mpCost) {
        console.log("MPが足りません！");
        return;
    }

    if (skill.damageMultiplier) {
        if (Array.isArray(target)) {
            target.forEach(t => createSkillEffect(skill, t)); // ターゲットごとにエフェクトを作成
        } else if (target) {
            createSkillEffect(skill, target); // 単体ターゲットにエフェクトを作成
        }
    }
    
        // スキルの効果を適用
        if (skill.damageMultiplier) {
            let damage = skill.damageMultiplier;
            if (skill.id === "fireball") {
                damage *= player.int; // 知力でダメージ計算
            } else if (skill.id === "slash") {
                damage *= player.strength; // 力でダメージ計算
            }
    
            // 敵への効果を適用（単体 or 複数）
            if (Array.isArray(target)) {
                target.forEach(enemy => {
                    enemy.health -= damage;
                    console.log(`${skill.name} を使用し、${damage} のダメージを与えました！`);
                    if (enemy.health <= 0) defeatEnemy(enemy);
                });
            } else if (target) {
                target.health -= damage;
                console.log(`${skill.name} を使用し、${damage} のダメージを与えました！`);
                if (target.health <= 0) defeatEnemy(target);
            }
        }
    
        if (skill.healAmount) {
            player.HP = Math.min(player.HP + skill.healAmount, player.maxHealth);
            console.log(`${skill.name} を使用し、${skill.healAmount} 回復しました！`);
        }
    
        // MPを消費し、最後に使用した時間を更新
        player.MP -= skill.mpCost;
        skill.lastUsed = now;
}

function drawSkillUI() {
    const sx = 500; // UI の開始位置 X 座標
    const sy = canvas.height - 100; // UI の開始位置 Y 座標
    const iconSize = 50; // アイコンの描画サイズ
    const padding = 10; // アイコン間のスペース

    if (!npc.isTalking) {
        // 背景を描画
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(sx - 20, sy - 50, skills.length * (iconSize + padding) + 40, 80);

        skills.forEach((skill, index) => {
            const x = sx + index * (iconSize + padding); // アイコンの描画位置 X
            const y = sy - iconSize / 2; // アイコンの描画位置 Y
            const now = Date.now() / 1000;
            const remainingCooldown = Math.max(0, skill.cooldown - (now - skill.lastUsed));
            const isOnCooldown = remainingCooldown > 0;

            // スキルアイコンを描画
            if (skill.img.complete) {
                ctx.globalAlpha = isOnCooldown ? 0.5 : 1; // クールダウン中は透明度を下げる
                ctx.drawImage(skill.img, x, y, iconSize, iconSize);
                ctx.globalAlpha = 1; // 描画後に透明度をリセット
            }

            // クールダウンタイマーを描画
            if (isOnCooldown) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.beginPath();
                ctx.moveTo(x + iconSize / 2, y + iconSize / 2);
                const cooldownAngle = (Math.PI * 2) * (remainingCooldown / skill.cooldown);
                ctx.arc(
                    x + iconSize / 2,
                    y + iconSize / 2,
                    iconSize / 2,
                    -Math.PI / 2,
                    -Math.PI / 2 + cooldownAngle,
                    false
                );
                ctx.closePath();
                ctx.fill();

                // 残り時間を表示
                ctx.save();
                ctx.fillStyle = "red";
                ctx.font = "12px Arial";
                ctx.textAlign = "center";
                ctx.fillText(
                    `${remainingCooldown.toFixed(1)}s`,
                    x + iconSize / 2,
                    y + iconSize + 10
                );
                ctx.restore();
            }

            // スキル番号を描画
            ctx.save();
            ctx.fillStyle = "yellow";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(index + 1, x + iconSize / 2, y - 10);
            ctx.restore();
        });
    }
}

// キー入力でスキル使用
document.addEventListener("keydown", (e) => {
    if (!npc.isTalking && professionSelected) {
        for(let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            if(professions.Warrior) {
                if(e.key === "1") {
                    console.log(professions.Warrior.skills[0]);
                }
           }
           if (e.key === "1") {
            useSkill("fireball", enemy); // 範囲攻撃スキル
        }
        if (e.key === "2") {
            useSkill("heal"); // 自分にヒールを使用
        }
        if (e.key === "3") {
            const target = enemies[i]; // 例: 最初の敵をターゲット
            useSkill("Power Strike", target); // 単体攻撃スキル
        }
        }
    }
});

// キーイベントの設定
document.addEventListener("keydown", (e) => {
    if (!professionSelected) return;
    if (e.key === "ArrowUp") {
        keys.up = true;
    }
    if (e.key === "ArrowRight") {
        keys.right = true;
    }
    if (e.key === "ArrowDown") {
        keys.down = true;
    }
    if (e.key === "ArrowLeft") {
        keys.left = true;
    }
    if (e.key === " ") {
        keys.space = true;
    }
    if (e.key === "Enter") {
        keys.enter = true;
    }
    if(e.key === "f") {
        keys.f = true;
        ONorOFF = !ONorOFF;
    }
    if(e.key === "q") {
        keys.q = true;
    }
    if(e.key === "w") {
        keys.w = true;
    }    
    if(e.key === "e") {
        keys.e = true;
    }
    if(e.key === "r") {
        keys.r = true;
    }
    if(e.key === "t") {
        keys.t = true;
    }
    if(e.key === "y") {
        keys.y = true;
    }
    if(e.key === "u") {
        keys.u = true;
    }
    if(e.key === "l") {
        keys.l = true;
    }
    if(e.key === "s") {
        saveGame();
    }
    if (e.key === "m") { // Mキーで音楽のオン/オフを切り替え
        if (backgroundMusic.paused) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    }
    if (e.key === "r" && !gameStarted) {
        newGame();
        gameStarted = true;
    }
});
document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") {
        keys.up = false;
    }
    if (e.key === "ArrowRight") {
        keys.right = false;
    }
    if (e.key === "ArrowDown") {
        keys.down = false;
    }
    if (e.key === "ArrowLeft") {
        keys.left = false;
    }
    if (e.key === " ") {
        keys.space = false;
    }
    if (e.key === "Enter") {
        keys.enter = false;
    }
    if(e.key === "f") {
        keys.f = false;
    }
    if(e.key === "q") {
        keys.q = false;
    }
    if(e.key === "w") {
        keys.w = false;
    }    
    if(e.key === "e") {
        keys.e = false;
    }
    if(e.key === "r") {
        keys.r = false;
    }
    if(e.key === "t") {
        keys.t = false;
    }
    if(e.key === "y") {
        keys.y = false;
    }
    if(e.key === "u") {
        keys.u = false;
    }
    if(e.key === "l") {
        keys.l = false;
    }
    if(e.key === "s") {
        keys.s = false;
    }
});

let professionSelected = false;
window.onload = function() {
    titleScreen();
}

// タイトル画面を描画する関数
function titleScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "36px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("ゲームタイトル", canvas.width / 2 - 100, canvas.height / 2 - 100);

    ctx.font = "20px Arial";
    ctx.fillText("[Enter] ゲームを開始", canvas.width / 2 - 100, canvas.height / 2 - 20);
    ctx.fillText("[L] セーブデータをロード", canvas.width / 2 - 100, canvas.height / 2 + 20);

    // イベントリスナーを登録して、タイトル画面での入力を処理
    window.addEventListener("keydown", handleTitleScreenInput);
}


function handleTitleScreenInput(e) {  // ゲームが始まっていないときだけ反応
        if (e.key === "Enter") {
            window.removeEventListener("keydown", handleTitleScreenInput); // イベントリスナーを削除
            newGame();
            selectProfessionScreen();
        } else if (e.key === "l") {  // Lキーの処理
            window.removeEventListener("keydown", handleTitleScreenInput); // イベントリスナーを削除
            loadGame();
        }
    }
// ゲーム開始画面
function gameScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    backgroundMusic.play();
    init();
}

// 職業選択画面
function selectProfessionScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("職業を選択してください:", canvas.width / 2 - 100, canvas.height / 2 - 50);
    ctx.fillText("[1] 戦士 (高HP, 高攻撃力)", canvas.width / 2 - 100, canvas.height / 2 - 20);
    ctx.fillText("[2] 魔法使い (高MP, 高知能)", canvas.width / 2 - 100, canvas.height / 2 + 10);
    ctx.fillText("[3] 弓使い (高素早さ, 高運)", canvas.width / 2 - 100, canvas.height / 2 + 40);
    window.addEventListener("keydown", handleProfessionSelection);
}

// 職業選択時の入力処理
function handleProfessionSelection(e) {
    if (!professionSelected) {
        if (e.key === "1") {
            selectProfession("warrior");
        } else if (e.key === "2") {
            selectProfession("mage");
        } else if (e.key === "3") {
            selectProfession("archer");
        }

        if (professionSelected) {
            window.removeEventListener("keydown", handleProfessionSelection); // 入力リスナーを解除
            gameStarted = true; // ゲーム開始フラグをセット
            startGameLoop(); // ゲームループを開始
        }
    }
}

// 職業選択処理
function selectProfession(profession) {
    const professions = {
        warrior: { baseHealth: 150, baseMp: 50, strength: 10, int: 2, attackSpeed: 5, resistance: 8, luck: 3 },
        mage: { baseHealth: 80, baseMp: 150, strength: 3, int: 10, attackSpeed: 4, resistance: 5, luck: 5 },
        archer: { baseHealth: 100, baseMp: 80, strength: 6, int: 5, attackSpeed: 8, resistance: 6, luck: 10 },
    };
    if (professions[profession]) {
        professionSelected = true;
        player.profession = profession;
        const prof = professions[profession];
        player.maxHealth = prof.baseHealth;
        player.maxMp = prof.baseMp;
        player.HP = player.maxHealth;
        player.MP = player.maxMp;
        player.strength = prof.strength;
        player.int = prof.int;
        player.attackSpeed = prof.attackSpeed;
        player.resistance = prof.resistance;
        player.luck = prof.luck;
        console.log(`${profession}を選択しました！`);
    }
}

//ステータス画面
function statusScreen() {
    const sx = 200;
    const sy = 100;
    const gx = 400;
    const gy = 300;
    const away = 30;
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(sx,sy,gx,gy)
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText("☒", gx+200, sy+15);
    ctx.fillStyle = "white";
    ctx.fillText(`HP : ${player.HP}/${player.maxHealth}`, sx+10, sy+20);
    ctx.fillText(`MP : ${player.MP}/${player.maxMp}`, sx+10, sy+50);
    ctx.fillText(`力 : ${player.strength}`, sx+10, sy+80);
    ctx.fillText(`素早さ : ${player.attackSpeed}`, sx+10, sy+110);
    ctx.fillText(`体力 : ${player.resistance}`, sx+10, sy+140);
    ctx.fillText(`知能 : ${player.int}`, sx+10, sy+170);
    ctx.fillText(`運 : ${player.luck}`, sx+10, sy+200);
    ctx.fillText(`ステータスポイント : ${player.statusPoint}`, gx-20, gy+30);
    ctx.fillText(`職業 : ${player.profession}`, sx+10, sy+230)
    ctx.fillText("qボタンで追加", sx+200, sy + 20);
    ctx.fillText("wボタンで追加", sx+200, sy + 50);
    ctx.fillText("eボタンで追加", sx+200, sy + 80);
    ctx.fillText("rボタンで追加", sx+200, sy + 110);
    ctx.fillText("tボタンで追加", sx+200, sy + 140);
    ctx.fillText("yボタンで追加", sx+200, sy + 170);
    ctx.fillText("uボタンで追加", sx+200, sy + 200);

}

//バトル
function battle() {
    if (battleStarted) {
        if (keys.space && player.HP > 0) {
            // プレイヤーが攻撃
            for (let i = 0; i < enemies.length; i++) {
                const enemy = enemies[i];
                drawenemyX = enemy.x - scrollX;
                drawenemyY = enemy.y - scrollY;
                let playerDamage;
                if (player.x < drawenemyX + enemy.width && 
                    player.x + player.width > drawenemyX && 
                    player.y < drawenemyY + enemy.height && 
                    player.y + player.height >drawenemyY) {
                    if(player.strength >= enemy.resistance) {
                        playerDamage = Math.abs(player.strength-enemy.resistance)+player.attackSpeed*1.1;
                    }else {
                        playerDamage = 1;
                    }
                    enemy.health -= playerDamage;
                    if (enemy.health <= 0) {
                        enemies.splice(i, 1);  // 体力が0以下なら敵を配列から削除
                        i--; // インデックス調整
                        defeatEnemy(enemy);
                        levelEvent();
                        
                    }
                }
            }
        }
        // 敵からの攻撃
        if (frameCount % 100 == 0 && player.HP > 0) {
            for (let i = 0; i < enemies.length; i++) {
                const enemy = enemies[i];
                let enemyDamage = Math.abs(enemy.strength-player.resistance);
                if (enemies.health > 0) {
                    if (player.HP <= 0) {
                        return;   
                    }
                }
            }
        }
    }
}
const quests = [
    { id: "defeatEnemies", description: "敵を5体倒す", goal: 5, progress: 0, type: "kill", reward: { exp: 1000, gold: 50 } },
    { id: "collectItems", description: "薬草を3つ集める", goal: 3, progress: 0, type: "collect", reward: { exp: 50, item: "Potion" } },
    { id: "escortNPC", description: "村人を村まで護衛する", goal: 1, progress: 0, type: "escort", reward: { exp: 150, item: "Shield" } },
    { id: "findTreasure", description: "洞窟で宝を探す", goal: 1, progress: 0, type: "explore", reward: { exp: 200, gold: 100 } }
];

let activeQuest = null;

//会話
// クエスト完了フラグ
let questCompleted = false;

// NPC会話時の修正
function npcTalking() {
    if (npc.isTalking) {
        ctx.font = "15px Arial";
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(20, canvas.height - 110, canvas.width - 40, 90);

        if (questCompleted) {
            // クエスト完了報告
            ctx.fillStyle = "white";
            ctx.fillText("クエストを報告しますか？ [R]キーを押してください。", 30, canvas.height - 55);
        } else if (!activeQuest && !questCompleted) {
            // 新しいクエストの受注
            ctx.fillStyle = "white";
            ctx.fillText("どのクエストに挑戦しますか？", 30, canvas.height - 55);
            quests.forEach((quest, index) => {
                ctx.fillText(`[${index + 1}] ${quest.description}`, 250, canvas.height - 30 - index * 20);
            });
        } else if (activeQuest) {
            // 進行中のクエスト情報
            ctx.fillStyle = "white";
            ctx.fillText(`進行中のクエスト: ${activeQuest.description}`, 30, canvas.height - 60);
            ctx.fillText(`進捗: ${activeQuest.progress}/${activeQuest.goal}`, 30, canvas.height - 30);
        }

        document.addEventListener("keydown", handleNPCInput);
    }
}

function handleNPCInput(e) {
    if (npc.isTalking) {
        if (questCompleted && e.key === "r") {
            reportQuest(); // クエスト報告
            //ctx.fillText(`クエスト "${activeQuest.description}" を報告しました！`, canvas.width/2-100, canvas.height/2);
        } else if (!questCompleted && !activeQuest) {
            // 新しいクエストの受注
            if (e.key >= "1" && e.key <= String(quests.length)) {
                const questIndex = parseInt(e.key) - 1;
                activeQuest = { ...quests[questIndex] };
                npc.isTalking = false; // 会話終了
                console.log(`クエスト "${activeQuest.description}" を受注しました！`);
            }
        }
    }
}

function reportQuest() {
    player.XP += activeQuest.reward.exp;
    if (activeQuest.reward.gold) player.gold += activeQuest.reward.gold;
    if (activeQuest.reward.item) player.inventory.push(activeQuest.reward.item);

    // 経験値処理
    levelEvent();
    // 状態リセット
    activeQuest = null;
    questCompleted = false; // 完了状態を解除
    npc.isTalking = false; // 会話終了
    console.log("次のクエストが受けられるようになりました。");
}


// クエスト完了時の報告処理

// updateQuestProgress関数の修正
function updateQuestProgress(type, amount = 1) {
    if (activeQuest && activeQuest.type === type) {
        activeQuest.progress += amount;
        if (activeQuest.progress >= activeQuest.goal) {
            questCompleted = true; // クエスト完了フラグを立てる
            console.log(`クエスト "${activeQuest.description}" を達成しました！NPCに報告してください。`);
        }
    }
}


function drawQuestUI() {
    if (activeQuest) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.font = "16px Arial";
        ctx.fillRect(10, canvas.height/2-10, 300, 70);
        if(!questCompleted) {
            ctx.fillStyle = "white";
        }else {
            ctx.fillStyle = "green";
        }
        ctx.fillText(`クエスト: ${activeQuest.description}`, 20, canvas.height/2+20);
        ctx.fillText(`進捗: ${activeQuest.progress}/${activeQuest.goal}`, 20, canvas.height/2+50);
    }
}

//ゲームオーバーを表示
function showGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    titleScreen();
}

// ゲームオーバー処理
function checkGameOver() {
    if (player.HP <= 0) {
        gameStarted = false;
        showGameOver();  // ゲームオーバー画面を表示
    }
}