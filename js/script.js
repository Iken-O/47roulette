var sketch;//出力するファイルの名前を定義
let isRotating = false;
let startTime = 0;
let rotationAngle = 0;
let targetRotation = 0;
const rotationDuration = 15000;
let radius = 175;
const result = document.querySelector("#result")
let resizeRatio;
let startButton;
let frontGuard = "null"
let button = "null"
const buttonTexts = ["抽選中.", "抽選中..", "抽選中..."];

let previousRotationMethod = null; // 前回の回転方法を記憶する変数

//変数
let segments = prefectures.length;
// ↓↓↓↓↓↓↓↓↓↓↓↓↓設定変数の受け取り↓↓↓↓↓↓↓↓↓↓↓↓↓

// default value
let pointerChange = false;
let wheelColor = "twoTone";
let rotationMethod = "wheelRotate";
let borderVisibility = false;
let backgroundColorChange = false;
let backgroundColor = "#0000ff";
let exclusionList = "";
let exclusionArray = [];
let filteredPrefectures = [];

// 設定をローカルストレージに保存する関数
function saveSettings() {
    const settings = {
        pointerChange,
        wheelColor,
        rotationMethod,
        borderVisibility,
        backgroundColorChange,
        backgroundColor,
        exclusionList
    };
    localStorage.setItem('rouletteSettings', JSON.stringify(settings));
}

// ローカルストレージから設定を読み込む関数
function loadSettings() {
    const savedSettings = localStorage.getItem('rouletteSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        pointerChange = settings.pointerChange;
        wheelColor = settings.wheelColor;
        rotationMethod = settings.rotationMethod;
        borderVisibility = settings.borderVisibility;
        backgroundColorChange = settings.backgroundColorChange;
        backgroundColor = settings.backgroundColor;
        exclusionList = settings.exclusionList;

        // UIを更新
        document.querySelector('input[name="pointerChange"]').checked = pointerChange;
        document.querySelector(`input[name="wheelColor"][value="${wheelColor}"]`).checked = true;
        document.querySelector(`input[name="rotationMethod"][value="${rotationMethod}"]`).checked = true;
        document.querySelector('input[name="borderVisibility"]').checked = borderVisibility;
        document.querySelector('input[name="backgroundColorChange"]').checked = backgroundColorChange;
        document.querySelector('input[type="color"]').value = backgroundColor;
        document.querySelector('textarea[name="exclusionList"]').value = exclusionList;
    }
}


window.addEventListener('load', () => {
    loadSettings();
    updateValues(); // UIの更新後に値を処理
});



function updateValues() {
    const pointerCheckbox = document.querySelector('input[name="pointerChange"]');
    pointerChange = pointerCheckbox.checked;


    const wheelColorRadios = document.querySelectorAll('input[name="wheelColor"]');
    wheelColorRadios.forEach(radio => {
        if (radio.checked) {
            wheelColor = radio.value;
        }
    });


    const rotationMethodRadios = document.querySelectorAll('input[name="rotationMethod"]');
    rotationMethodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                const selectedRotationMethod = radio.value;

                // 前回の選択値と現在の選択値が異なる場合のみ回転角度をリセット
                if (selectedRotationMethod !== previousRotationMethod) {
                    rotationAngle = 0;
                    previousRotationMethod = selectedRotationMethod; // 新しい選択値を記憶
                }

                rotationMethod = selectedRotationMethod; // 現在の回転方法を更新
            }
        });
    });


    const borderCheckbox = document.querySelector('input[name="borderVisibility"]');
    borderVisibility = borderCheckbox.checked;


    const backgroundCheckbox = document.querySelector('input[name="backgroundColorChange"]');
    backgroundColorChange = backgroundCheckbox.checked;


    const colorInput = document.querySelector('input[type="color"]');
    backgroundColor = colorInput.value;

    const exclusionTextarea = document.querySelector('textarea[name="exclusionList"]');
    exclusionList = exclusionTextarea.value;

    // console.log({
    //     pointerChange,
    //     wheelColor,
    //     rotationMethod,
    //     borderVisibility,
    //     backgroundColorChange,
    //     backgroundColor,
    //     exclusionList
    // });

    saveSettings();
    dataProcessing();
    updateBorder()
}


function updateBorder() {
    const roulette = document.getElementById('roulette');
    const main = document.querySelector("main")
    if (borderVisibility) {
        roulette.classList.remove('redBorder'); // true の時は剥奪
        main.style.backgroundColor = "#FFF9EF";
        if (backgroundColorChange) {
            main.style.backgroundColor = backgroundColor;
        }
    } else {
        roulette.classList.add('redBorder'); // false の時は追加
        main.style.backgroundColor = "#FFD4D7";
    }
}


document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
    input.addEventListener('change', updateValues);
});


const colorInput = document.querySelector('input[type="color"]');
colorInput.addEventListener('input', updateValues);


const exclusionTextarea = document.querySelector('textarea[name="exclusionList"]');
exclusionTextarea.addEventListener('input', updateValues);
// ↓↓↓↓↓↓↓↓↓↓↓↓↓受け取った変数の関数↓↓↓↓↓↓↓↓↓↓↓↓↓
function dataProcessing() {
    // if (!exclusionList.endsWith(",")) {
    exclusionArray = exclusionList.split(",").map(Number).filter(num => num !== 0);
    // }
    filteredPrefectures = prefectures.filter(prefecture => !exclusionArray.includes(prefecture.id));
    segments = filteredPrefectures.length;
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓描写関数↓↓↓↓↓↓↓↓↓↓↓↓↓
let img;
function preload() {
    img = loadImage('./img/root.png');
}

function resizeCanvasBasedOnWindow() {
    if (window.innerWidth <= 550) {
        // 画面横幅が550以下の場合
        resizeCanvas(windowWidth * 0.9, windowWidth * 0.9 * 620 / 510);
        resizeRatio = windowWidth * 0.9 / 510;
    } else {
        // それ以外の場合
        resizeCanvas(windowHeight * 0.7 * 510 / 620, windowHeight * 0.7);
        console.log((windowHeight*0.7)/620 )
        resizeRatio = (windowHeight*0.7)/620;
    }
    radius = 175 * resizeRatio;
}
function windowResized() {
    resizeCanvasBasedOnWindow();
    createStartButton();
}

function setup() {
    resizeCanvasBasedOnWindow();
    createStartButton();
}

function draw() {

    if (backgroundColorChange) {
        background(backgroundColor);
    } else {
        background("#FFF9EF");
    }

    translate(width / 2, height / 2);
    rotate(-PI / 4);


    if (isRotating) {
        updateRotation();
        hideOption();
    } else {
        showOption();
    }

    if (rotationMethod === "wheelRotate") {
        push()
        rotate(rotationAngle);
        drawWheel();
        pop()

        drawPointer();
    } else if (rotationMethod === "pointerRotate") {
        drawWheel();
        push()
        rotate(rotationAngle);
        drawPointer();
        pop()
    }

    // 現在の回転角度を度数法で表示
    let angleInDegrees = degrees(rotationAngle) % 360;
    if (angleInDegrees < 0) angleInDegrees += 360; // 負の値を修正

    let currentPizza = getPizzaAtZero(angleInDegrees);
    let lastCurrentPizza = filteredPrefectures[currentPizza - 1].id;
    let idWithLeadingZero = String(lastCurrentPizza).padStart(2, '0');
    let lastprefectureName = filteredPrefectures[currentPizza - 1].name;
    result.textContent = `${idWithLeadingZero}： ${lastprefectureName}`;
}

function createStartButton() {
    if (startButton) {
        startButton.remove();
    }
    startButton = createButton('スタート');
    startButton.parent("roulette");
    startButton.position(width / 2 - 105 * resizeRatio, height - 100 * resizeRatio, 'relative');
    startButton.size(100 * resizeRatio, 30 * resizeRatio);
    startButton.style('font-size', 24 * resizeRatio + 'px'); 
    startButton.mousePressed(startRotation);

    //ボタンが作成されたら読み込み
    frontGuard = document.querySelector(".frontGuard");
    button = document.querySelector('#roulette button');
    // if (frontGuard && button) {  // null チェック
    //     console.log(123)
    // }
}

function updateRotation() {
    let elapsed = millis() - startTime;
    let progress = min(elapsed / rotationDuration, 1);


    let eased = easeOutCubic(progress);

    rotationAngle = eased * targetRotation;

    if (progress >= 1) {
        isRotating = false;
    }
}

function easeOutCubic(t) {
    return 2 - Math.pow(1.3 - t, 6);
}

function drawWheel() {
    let angle = TWO_PI / segments;

    noStroke();
    for (let i = 0; i < segments; i++) {

        if (wheelColor === "twoTone") {
            fill(colors[0][i % 2]);
        } else if (wheelColor === "multiColor") {
            fill(colors[1][i % colors[1].length]);
        }

        drawSegment(i, angle);
        drawSegmentLabel(i, angle);
    }
}

function drawSegment(i, angle) {
    arc(0, 0, radius * 2, radius * 2, angle * i, angle * (i + 1), PIE);
}

function drawSegmentLabel(i, angle) {
    let textX = cos(angle * (i + 0.5)) * (radius - 25);
    let textY = sin(angle * (i + 0.5)) * (radius - 25);

    push();
    translate(textX, textY);
    rotate(angle * (i + 0.5));

    if (wheelColor === "twoTone") {
        fill(textColors[i % 2]);
    } else if (wheelColor === "multiColor") {
        fill(textColors[0]);
    }
    textSize(32 * resizeRatio);
    textAlign(CENTER, CENTER);
    let idWithLeadingZero = String(filteredPrefectures[i].id).padStart(2, '0');
    text(idWithLeadingZero, 0, 0);
    pop();
    // console.log(filteredPrefectures[i].id)
}

function startRotation() {
    if (!isRotating) {
        isRotating = true;
        startTime = millis();
        targetRotation = TWO_PI * 2 + random(TWO_PI); // 2-3 full rotations
    }
}

// どのピザが0度にあるかを計算する関数
function getPizzaAtZero(angleInDegrees) {
    let segmentAngle = 360 / segments; // 各セグメントの角度（45度）
    let adjustedAngle = angleInDegrees % 360; // 回転角度を360度以内に収める
    // ピザの番号はセグメント角度で割って、切り上げて求める
    let segmentIndex = Math.floor(adjustedAngle / segmentAngle);

    if (rotationMethod === "wheelRotate") {
        let pizzaNumber = (segments - segmentIndex) % segments;
        return pizzaNumber === 0 ? segments : pizzaNumber;
    } else if (rotationMethod === "pointerRotate") {
        return (segmentIndex + 1) % segments === 0 ? segments : (segmentIndex + 1) % segments;

    }
}

// 時計の3時の位置にポインターを描画する関数
function drawPointer() {
    if (pointerChange === false) {
        noStroke();
        fill("#EB6A6E");
        triangle(radius + 40 * resizeRatio, -20 * resizeRatio, radius + 40 * resizeRatio, 20 * resizeRatio, radius - 30 * resizeRatio, 0);
    } else if (pointerChange === true) {
        image(img, radius - 30 * resizeRatio, -50 * resizeRatio, 100 * resizeRatio, 100 * resizeRatio);
    }

}

function hideOption() {
    if (frontGuard && button) {  // null チェック
        frontGuard.style.opacity = "0.7";
        frontGuard.style.pointerEvents="auto"
        button.style.backgroundColor = "#B7E064";
        button.style.color = "#FFF";
        button.textContent = "抽選中...";
        button.disabled = true;
    }
}

function showOption() {
    if (frontGuard && button) {  // null チェック
        frontGuard.style.opacity = "0";
        frontGuard.style.pointerEvents="none"
        button.style.backgroundColor = "#FFF";
        button.style.color = "#B7E064";
        button.textContent = "スタート";
        button.disabled = false;
    }
}
new p5(sketch, "roulette");