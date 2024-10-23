import "./style.css";

const APP_NAME = "Soladraw!";
const app = document.querySelector<HTMLDivElement>("#app")!;
const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;


document.title = APP_NAME;
app.innerHTML = APP_NAME;
app.append(canvas);


const ctx = canvas.getContext("2d");
ctx.strokeStyle = "#7a6eff"

const cursor = { active: false, x: 0, y: 0 };


const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.onclick = function () {
    clear();
};
app.append(clearButton);



canvas.addEventListener("mousedown", (e) => {
    startDraw(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
        draw(e.offsetX, e.offsetY);
    }
});

canvas.addEventListener("mouseup", (e) => {
    stopDraw();
});


function startDraw(x: number, y: number){
    cursor.active = true;
    cursor.x = x;
    cursor.y = y;
}

function draw(newX: number, newY: number){
    ctx.beginPath();
    ctx.moveTo(cursor.x, cursor.y);
    ctx.lineTo(newX, newY);
    ctx.stroke();
    cursor.x = newX;
    cursor.y = newY;
}

function stopDraw(){
    cursor.active = false;
}

function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
