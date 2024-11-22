import "./style.css";


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
    color: string;
    
    constructor(p: point, c?: boolean){
        this.pts[0] = p;
        this.sSize = strokeSize;
        this.isSticker = sticker;
        this.emoji = emoj;
        if(c){
            this.cursor = c;
        }
        this.color = "HSL("+ hSlider.value + ", 100%, 72%";
    }

    drag(p: point){
        if(this.cursor || this.isSticker){
            this.pts[0] = p;
        }else{
            this.pts.push(p);
        }
    }

    display(con: CanvasRenderingContext2D){
        con.strokeStyle = this.color;
        con.fillStyle = this.color;
        console.log(this.color)


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
        this.color = "HSL(" + hSlider.value + ", 100%, 72%)";
    }
}

const APP_NAME = "Soladraw!";
const app = document.querySelector<HTMLDivElement>("#app")!;
const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;

const ctx = canvas.getContext("2d")!;
//ctx.strokeStyle = "HSL(245,100%,72%)";
//ctx.fillStyle = "HSL(245,100%,72%)";
ctx.font = "30px Arial";

document.title = APP_NAME;
app.innerHTML = APP_NAME;
app.append(canvas);

const drawEvent = new Event("drawing-changed");
const moveEvent = new Event("tool-moved");

// Create a container for the slider and color preview - lorraine
const colorPickerContainer = document.createElement("div");
colorPickerContainer.style.cssText = `
  display: flex;
  height: 100px;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

const hText = document.createElement("text");
hText.innerHTML = "Hue:";
colorPickerContainer.append(hText);

const hSlider = document.createElement("input");
hSlider.type = "range";
hSlider.min = "0";
hSlider.max = "360";
hSlider.defaultValue = "245";
colorPickerContainer.append(hSlider);

// Color preview container - lorraine
const colorPreview = document.createElement("div");
colorPreview.style.cssText = `
  width: 30px;
  height: 30px;
  margin-left: 10px;
  border: 1px solid #000;
`;
colorPickerContainer.append(colorPreview);

// Add the color picker group to the app
app.append(colorPickerContainer);

// Set preview to default color on start - lorraine
colorPreview.style.backgroundColor = `hsl(${hSlider.value}, 100%, 72%)`;

let strokeSize: number = 2;
let sticker: boolean = false;
let emoj: string = "";

const cursor = { active: false, x: 0, y: 0 };

const cur = new Line({x:0, y:0}, true);


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
    dragMouse(e.offsetX, e.offsetY);
    cur.drag({x: e.offsetX, y: e.offsetY});
    console.log(cur.pts[0]);
    canvas.dispatchEvent(moveEvent);
});

canvas.addEventListener("mouseup", () => {
    stopDraw();
});

canvas.addEventListener("tool-moved", () => {
    draw();
});

canvas.addEventListener("drawing-changed", () => {
    draw();
});

hSlider.addEventListener("input", () => {
    cur.refr();
    // Update the color preview - lorraine
    colorPreview.style.backgroundColor = `hsl(${hSlider.value}, 100%, 72%)`;
});


function startDraw(p: point){
    cursor.active = true;
    redoLines = [];
    lines.push(new Line(p, false));

}

function dragMouse(X: number, Y: number){
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
    const undoLine = lines.pop();
    if(undoLine) {
        redoLines.push(undoLine);
    }
    canvas.dispatchEvent(drawEvent);
}

function redo(){
    const redoLine = redoLines.pop()
    if(redoLine){
        lines.push(redoLine);
    }
    canvas.dispatchEvent(drawEvent);
}

function save(){
    const savedCanvas = document.createElement("canvas");
    savedCanvas.width = 1024;
    savedCanvas.height = 1024;

    const savedCanvasCtx = savedCanvas.getContext("2d")!;
    savedCanvasCtx.strokeStyle = "#7a6eff";
    savedCanvasCtx.fillStyle = "#7a6eff";
    savedCanvasCtx.font = "30px Arial";
    savedCanvasCtx.scale(2, 2);

    clear();
    for(const l of lines){
        l.display(savedCanvasCtx);
    }

    const anchor = document.createElement("a");
    anchor.href = savedCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();


}

function newSticker(){
    const emoji: string = prompt("Provide an emoji link:","❤️")!;
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

