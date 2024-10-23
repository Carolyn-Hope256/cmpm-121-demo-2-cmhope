import "./style.css";

const APP_NAME = "Soladraw!";
const app = document.querySelector<HTMLDivElement>("#app")!;
const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;


document.title = APP_NAME;
app.innerHTML = APP_NAME;
app.append(canvas);

const drawEvent = new Event("drawing-changed");

const ctx = canvas.getContext("2d");
ctx.strokeStyle = "#7a6eff"

const cursor = { active: false, x: 0, y: 0 };

interface point{
    x: number,
    y: number
}

let lines: point[][] = [];
let redoLines: point[][] = [];
let newLine: point[] = [];

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.onclick = function () {
    undo();
};
app.append(undoButton);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.onclick = function () {
    redo();
};
app.append(redoButton);


const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear";
clearButton.onclick = function () {
    fullClear();
};
app.append(clearButton);




canvas.addEventListener("mousedown", (e) => {
    startDraw();
});

canvas.addEventListener("mousemove", (e) => {
    newPoint(e.offsetX, e.offsetY);
});

canvas.addEventListener("mouseup", (e) => {
    stopDraw();
});

canvas.addEventListener("drawing-changed", (e) => {
    draw();
});


function startDraw(){
    cursor.active = true;
    redoLines = [];
}

function newPoint(X: number, Y: number){
    if (cursor.active) {
        newLine.push({x: X, y: Y})
        //draw();
        canvas.dispatchEvent(drawEvent);
    }
}

function draw(){
    clear();
    for(const l of lines){
        drawline(l);
    }
    drawline(newLine);
}

function drawline(line: point[]){
    if(line.length > 1){
        ctx.beginPath();
        ctx.moveTo(line[0].x, line[0].y);
        for(const p of line){
            ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
    }
}

function stopDraw(){
    cursor.active = false;
    lines.push(newLine);
    newLine = [];
}

function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function fullClear(){
    lines = [];
    newLine = [];
    redoLines = [];
    canvas.dispatchEvent(drawEvent);
}

function undo(){
    if(lines.length > 0){
        redoLines.push(lines.pop());
    }
    canvas.dispatchEvent(drawEvent);
}

function redo(){
    if(redoLines.length > 0){
        lines.push(redoLines.pop());
    }
    canvas.dispatchEvent(drawEvent);
}

