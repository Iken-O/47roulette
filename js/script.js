var sketch;//出力するファイルの名前を定義
let isRotating = false;
let startTime = 0;
let rotationAngle = 0; // Radians
let targetRotation = 0;
const rotationDuration = 15000; // 15 seconds
const radius = 175;
const result = document.querySelector("#result")

let previousRotationMethod = null; // 前回の回転方法を記憶する変数

//変数
let segments = prefectures.length;
// ↓↓↓↓↓↓↓↓↓↓↓↓↓設定変数の受け取り↓↓↓↓↓↓↓↓↓↓↓↓↓

// Declare variables to hold the values
let pointerChange = false;
let wheelColor = "twoTone"; // default value
let rotationMethod = "wheelRotate"; // default value
let borderVisibility = false;
let backgroundColorChange = false;
let backgroundColor = "#0000ff"; // default value
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

// Function to update variables when inputs change
function updateValues() {
    // Checkbox for pointer change
    const pointerCheckbox = document.querySelector('input[name="pointerChange"]');
    pointerChange = pointerCheckbox.checked;

    // Radio buttons for wheel color
    const wheelColorRadios = document.querySelectorAll('input[name="wheelColor"]');
    wheelColorRadios.forEach(radio => {
        if (radio.checked) {
            wheelColor = radio.value;
        }
    });

    // Radio buttons for rotation method
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

    // Checkbox for border visibility
    const borderCheckbox = document.querySelector('input[name="borderVisibility"]');
    borderVisibility = borderCheckbox.checked;

    // Checkbox for background color change
    const backgroundCheckbox = document.querySelector('input[name="backgroundColorChange"]');
    backgroundColorChange = backgroundCheckbox.checked;

    // Color input for background color
    const colorInput = document.querySelector('input[type="color"]');
    backgroundColor = colorInput.value;

    const exclusionTextarea = document.querySelector('textarea[name="exclusionList"]');
    exclusionList = exclusionTextarea.value;

    // Log the values (optional)
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

// Add event listeners to inputs to update variables on change
document.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(input => {
    input.addEventListener('change', updateValues);
});

// Add event listener for color input
const colorInput = document.querySelector('input[type="color"]');
colorInput.addEventListener('input', updateValues);

// Add event listener for textarea to update exclusion list in real-time
const exclusionTextarea = document.querySelector('textarea[name="exclusionList"]');
exclusionTextarea.addEventListener('input', updateValues);
// ↓↓↓↓↓↓↓↓↓↓↓↓↓受け取った変数の関数↓↓↓↓↓↓↓↓↓↓↓↓↓
function dataProcessing() {
    if (!exclusionList.endsWith(",")) {
        exclusionArray = exclusionList.split(",").map(Number)
    }
    filteredPrefectures = prefectures.filter(prefecture => !exclusionArray.includes(prefecture.id));
    console.log(filteredPrefectures.length)
    segments = filteredPrefectures.length;
}

// ↓↓↓↓↓↓↓↓↓↓↓↓↓描写関数↓↓↓↓↓↓↓↓↓↓↓↓↓
let img;
function preload() {
    img = loadImage('./img/root.png');
}

function setup() {
    createCanvas(510, 620);
    createStartButton();
}

function draw() {
    if (backgroundColorChange) {
        background(backgroundColor);
    } else {
        background("#FFF9EF");
    }

    translate(width / 2, height / 2); // Canvas center as origin
    rotate(-PI / 4);


    if (isRotating) {
        updateRotation();
    }

    if (rotationMethod === "wheelRotate") {
        push()
        rotate(rotationAngle);
        drawWheel();
        pop()
        // Draw the pointer at 3 o'clock
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
    let lastprefectureName = filteredPrefectures[currentPizza - 1].name;
    result.textContent = `${lastCurrentPizza}： ${lastprefectureName}`;
}

function createStartButton() {
    let startButton = createButton('スタート');
    startButton.parent("roulette");
    startButton.position(width / 2 - 100, height - 100, 'relative');
    startButton.size(100, 30);
    startButton.mousePressed(startRotation);
}

function updateRotation() {
    let elapsed = millis() - startTime;
    let progress = min(elapsed / rotationDuration, 1);

    // Cubic easeOut function
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
    textSize(32);
    textAlign(CENTER, CENTER);
    text(filteredPrefectures[i].id, 0, 0);
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
        triangle(radius + 40, -20, radius + 40, 20, radius - 30, 0);
    } else if (pointerChange === true) {
        image(img, radius - 30, -50, 100, 100);
    }

}
new p5(sketch, "roulette");