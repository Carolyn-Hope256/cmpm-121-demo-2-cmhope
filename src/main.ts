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
ctx.strokeStyle = "#7a6eff";
ctx.fillStyle = "#7a6eff";
ctx.font = "30px Arial";

let strokeSize: number = 2;
let sticker: boolean = false;
let emoj: string = "";

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
    isSticker: boolean;
    emoji: string;
    cursor: boolean = false;
    
    constructor(p: point, c?: boolean){
        this.pts[0] = p;
        this.sSize = strokeSize;
        this.isSticker = sticker;
        this.emoji = emoj;
        if(c){
            this.cursor = c;
        }
    }

    drag(p: point){
        if(this.cursor || this.isSticker){
            this.pts[0] = p;
        }else{
            this.pts.push(p);
        }
    }

    display(con: CanvasRenderingContext2D){
        if(this.isSticker){
            con.fillText(this.emoji, this.pts[0].x, this.pts[0].y, 60);
        }else if(this.cursor){
            con.beginPath();
            con.arc(this.pts[0].x, this.pts[0].y, this.sSize, 0, 2 * Math.PI);
            con.fill();
            
        }else if(this.pts.length > 1){
            con.lineWidth = this.sSize;
            con.beginPath();
            con.moveTo(this.pts[0].x, this.pts[0].y);
            for(const p of this.pts){
                con.lineTo(p.x, p.y);
            }
            con.stroke();
        }
    }

    refr(){
        this.sSize = strokeSize;
        this.isSticker = sticker;
        this.emoji = emoj;
    }
}

let cur = new Line({x:0, y:0}, true);


const bTypes: button[] = [
    {label: "Undo", f(): void {undo()}}, 
    {label: "Redo", f(): void {redo()}}, 
    {label: "Clear", f(): void {fullClear()}},
    {label: "Save", f(): void {save()}}, 
    {label: "1px Brush", f(): void {strokeSize = 1; sticker = false; cur.refr();}},
    {label: "2px Brush", f(): void {strokeSize = 2; sticker = false; cur.refr();}}, 
    {label: "4px Brush", f(): void {strokeSize = 4; sticker = false; cur.refr();}},
    {label: "8px Brush", f(): void {strokeSize = 8; sticker = false; cur.refr();}},
    {label: "Custom Sticker", f(): void {newSticker();}},
    {label: "🐑 Sticker", f(): void {emoj = "🐑"; sticker = true; cur.refr();}},
    {label: "👁️ Sticker", f(): void {emoj = "👁️"; sticker = true; cur.refr();}},
    {label: "☄️ Sticker", f(): void {emoj = "☄️"; sticker = true; cur.refr();}}];

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
    lines.push(new Line(p, false));

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

function save(){
    const savcan = document.createElement("canvas");
    savcan.width = 1024;
    savcan.height = 1024;

    const scon = savcan.getContext("2d");
    scon.strokeStyle = "#7a6eff";
    scon.fillStyle = "#7a6eff";
    scon.font = "30px Arial";
    scon.scale(2, 2);

    clear();
    for(const l of lines){
        l.display(scon);
    }

    const anchor = document.createElement("a");
    anchor.href = savcan.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();


}

function newSticker(){
    const emoji: string = prompt("Provide an emoji link:","❤️");
    buttons.push(document.createElement("button"));
    buttons[buttons.length-1].innerHTML = emoji + " Sticker";
    buttons[buttons.length-1].onclick = function () {
        emoj = emoji;
        sticker = true;
        cur.refr();
    };
    app.append(buttons[buttons.length-1]);
    buttons[buttons.length-1].click();
}

