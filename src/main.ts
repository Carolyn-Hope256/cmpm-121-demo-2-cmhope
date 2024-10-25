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
const moveEvent = new Event("tool-moved");

const ctx = canvas.getContext("2d");
ctx.strokeStyle = "#7a6eff"
ctx.fillStyle = "#7a6eff"
let strokeSize = 2;

const cursor = { active: false, x: 0, y: 0 };

interface point{
    x: number,
    y: number
}

interface button{
    label: string,
    f(): void
}


class Line{
    pts: point[] =[];
    sSize: number;
    cursor: boolean = false;
    
    constructor(p: point, s: number, c?: boolean){
        this.pts[0] = p;
        this.sSize = s;
        if(c){
            this.cursor = c;
        }
    }

    drag(p: point){
        if(this.cursor){
            this.pts[0] = p;
        }else{
            this.pts.push(p);
        }
    }

    display(con: CanvasRenderingContext2D){
        if(this.pts.length > 1){
            con.lineWidth = this.sSize;
            con.beginPath();
            con.moveTo(this.pts[0].x, this.pts[0].y);
            for(const p of this.pts){
                con.lineTo(p.x, p.y);
            }
            con.stroke();
        }else if(this.cursor){
            con.beginPath();
            con.arc(this.pts[0].x, this.pts[0].y, this.sSize, 0, 2 * Math.PI);
            con.fill();
            
        }
    }
}

let cur = new Line({x:0, y:0}, strokeSize, true);


const bTypes: button[] = [
    {label: "Undo", f(): void {undo()}}, 
    {label: "Redo", f(): void {redo()}}, 
    {label: "Clear", f(): void {fullClear()}}, 
    {label: "2px Brush", f(): void {strokeSize = 2; cur.sSize = 2;}}, 
    {label: "4px Brush", f(): void {strokeSize = 4; cur.sSize = 4;}},
    {label: "8px Brush", f(): void {strokeSize = 8; cur.sSize = 8;}}];

const buttons: HTMLButtonElement[] = [];

for(let i = 0; i < bTypes.length; i++){
    buttons[i] = document.createElement("button");
    buttons[i].innerHTML = bTypes[i].label;
    buttons[i].onclick = function () {
        bTypes[i].f();
    };
    app.append(buttons[i]);
}


let lines: Line[] = [];
let redoLines: Line[] = [];


canvas.addEventListener("mousedown", (e) => {
    startDraw({x: e.offsetX, y: e.offsetY});
});

canvas.addEventListener("mousemove", (e) => {
    newPoint(e.offsetX, e.offsetY);
    cur.drag({x: e.offsetX, y: e.offsetY});
    console.log(cur.pts[0]);
    canvas.dispatchEvent(moveEvent);
});

canvas.addEventListener("mouseup", (e) => {
    stopDraw();
});

canvas.addEventListener("tool-moved", (e) => {
    draw();
});

canvas.addEventListener("drawing-changed", (e) => {
    draw();
});


function startDraw(p: point){
    cursor.active = true;
    redoLines = [];
    lines.push(new Line(p, strokeSize));

}

function newPoint(X: number, Y: number){
    if (cursor.active) {
        lines[lines.length-1].drag({x: X, y: Y})
        canvas.dispatchEvent(drawEvent);
    }
}

function draw(){
    clear();
    for(const l of lines){
        l.display(ctx);
    }
    if(!cursor.active){
        cur.display(ctx);
    }
}

function stopDraw(){
    cursor.active = false;
}



function clear(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function fullClear(){
    lines = [];
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

