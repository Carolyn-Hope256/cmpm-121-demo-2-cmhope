import "./style.css";

const APP_NAME = "Soladraw!";
const app = document.querySelector<HTMLDivElement>("#app")!;
const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 512;
document.body.append(canvas);

document.title = APP_NAME;
//app.innerHTML = APP_NAME;

const ctx = canvas.getContext("2d");
