import Cell from "./cell.js";
import { CD, CELL_CNT, CL, CR, CU, DOWN, LEFT, NN, RIGHT, TILE, UP } from "./low/const.js";
import Game from "./low/game.js";
import Point from "./low/point.js";
import Rand from "./low/rand.js";

class OriginShift extends Game {

  cells: Cell[][];
  connections: number[][];
  origin: Cell;
  lastOPos: Point;
  width: number;
  height: number;
  shiftTime: number;
  R: Rand;
  btnW: HTMLButtonElement;
  btnS: HTMLButtonElement;
  btnP: HTMLButtonElement;
  walls: boolean;
  shift: boolean;
  path: boolean;

  constructor() {
    super();

    this.R = new Rand();

    this.lastOPos = new Point(-1, -1);

    this.ctx.fillStyle = "#05d";
    this.ctx.strokeStyle = "#05d";
    this.ctx.lineWidth = 2;

    this.shiftTime = 0;
    this.walls = this.shift = false;
    this.path = true;

    this.btnW = <HTMLButtonElement>document.getElementById("walls");
    this.btnW.addEventListener("click", () => this.showWalls());

    this.btnS = <HTMLButtonElement>document.getElementById("shift");
    this.btnS.addEventListener("click", () => this.doShift());

    this.btnP = <HTMLButtonElement>document.getElementById("path");
    this.btnP.addEventListener("click", () => this.hidePath());

    this.init();
  }

  hidePath(): void {
    this.path = !this.path;
    this.btnP.innerText = this.path ? "Hide path" : "Show path";
  }

  doShift(): void {
    this.shift = !this.shift;
    this.btnS.innerText = this.shift ? "Stop shift" : "Shift";
  }

  showWalls(): void {
    this.walls = !this.walls;
    this.btnW.innerText = this.walls ? "Hide walls" : "Show walls";
  }

  init(): void {
    this.width = CELL_CNT;
    this.height = CELL_CNT;

    this.cells = [];
    this.connections = [];

    for (let y = 0; y < this.height; y++) {
      this.cells.push([]);
      this.connections.push([]);
      for (let x = 0; x < this.width; x++) {
        const c = new Cell(x, y);
        this.cells[y].push(c);
        this.connections[y].push(NN);
      }
    }

    this.connectAllCells();

    this.origin = this.cells[CELL_CNT - 1][CELL_CNT - 1];
    this.origin.origin = true;

    this.loop();
  }

  connectAllCells(): void {
    for (let y = 0; y < CELL_CNT; y++) {
      for (let x = 1; x < CELL_CNT; x++) {
        this.cells[y][x - 1].doors[RIGHT] = this.cells[y][x];
      }
    }

    const x = CELL_CNT - 1;
    for (let y = 0; y < CELL_CNT - 1; y++) {
      this.cells[y][x].doors[DOWN] = this.cells[y + 1][x];
    }
  }

  inBounds(x: number, y: number): boolean {
    return x > -1 && x < this.width && y > -1 && y < this.height;
  }

  getOriginNeighbours(): Point[] {
    const pts: Point[] = [],
      { x, y } = this.origin.pos;

    if (this.inBounds(x - 1, y)) pts.push(new Point(x - 1, y));
    if (this.inBounds(x, y - 1)) pts.push(new Point(x, y - 1));
    if (this.inBounds(x + 1, y)) pts.push(new Point(x + 1, y));
    if (this.inBounds(x, y + 1)) pts.push(new Point(x, y + 1));
    return pts;
  }

  shiftOrigin(): void {
    const an = this.getOriginNeighbours();
    let n: Point;

    do {
      n = this.R.choose(an);
    } while (n.equals(this.lastOPos));

    this.lastOPos.setPt(this.origin.pos);
    const no = this.cells[n.y][n.x];
    no.origin = true;
    this.origin.origin = false;

    no.doors = [null, null, null, null];

    const { x, y } = this.origin.pos;

    if (n.x !== x) {
      this.origin.doors[n.x < x ? LEFT : RIGHT] = no;
    } else {
      this.origin.doors[n.y < y ? UP : DOWN] = no;
    }

    this.origin = no;
  }

  drawWalls(): void {

    const updateConnection = (x: number, y: number, dx: number, dy: number, direction: number, oppositeDirection: number) => {
      if (this.connections[y][x] & direction) {
        this.connections[y + dy][x + dx] |= oppositeDirection;
      }
    };

    const drawLine = (fromX: number, fromY: number, toX: number, toY: number) => {
      this.ctx.moveTo(fromX, fromY);
      this.ctx.lineTo(toX, toY);
    };

    this.connections.forEach(row => row.fill(NN));

    this.cells.forEach(row => {
      row.forEach(cell => {
        const { x, y } = cell.pos;

        this.connections[y][x] |= cell.getAllDoors();

        updateConnection(x, y, 1, 0, CR, CL);
        updateConnection(x, y, 0, 1, CD, CU);
        updateConnection(x, y, -1, 0, CL, CR);
        updateConnection(x, y, 0, -1, CU, CD);
      });
    });

    this.ctx.beginPath();
    this.connections.forEach((row, y) => {
      row.forEach((door, x) => {
        if ((door & CR) === 0) drawLine(x * TILE + TILE, y * TILE, x * TILE + TILE, y * TILE + TILE);
        if ((door & CD) === 0) drawLine(x * TILE, y * TILE + TILE, x * TILE + TILE, y * TILE + TILE);
        if ((door & CL) === 0) drawLine(x * TILE, y * TILE, x * TILE, y * TILE + TILE);
        if ((door & CU) === 0) drawLine(x * TILE, y * TILE, x * TILE + TILE, y * TILE);
      });
    });

    this.ctx.strokeStyle = "#111";
    this.ctx.stroke();


    /*this.connections.forEach(row => row.fill(NN));

    this.cells.forEach(row => {
      row.forEach(cell => {
        const { x, y } = cell.pos;

        this.connections[y][x] |= cell.getAllDoors();
        const z = this.connections[y][x];

        if (this.connections[y][x] & CR) {
          this.connections[y][x + 1] |= CL;
        }

        if (this.connections[y][x] & CD) {
          this.connections[y + 1][x] |= CU;
        }

        if (this.connections[y][x] & CL) {
          this.connections[y][x - 1] |= CR;
        }

        if (this.connections[y][x] & CU) {
          this.connections[y - 1][x] |= CD;
        }

      });
    });

    this.ctx.beginPath();
    this.connections.forEach((row, y) => {
      row.forEach((door, x) => {
        if ((door & CR) === 0) {
          this.ctx.moveTo(x * TILE + TILE, y * TILE);
          this.ctx.lineTo(x * TILE + TILE, y * TILE + TILE);
        }

        if ((door & CD) === 0) {
          this.ctx.moveTo(x * TILE, y * TILE + TILE);
          this.ctx.lineTo(x * TILE + TILE, y * TILE + TILE);
        }

        if ((door & CL) === 0) {
          this.ctx.moveTo(x * TILE, y * TILE);
          this.ctx.lineTo(x * TILE, y * TILE + TILE);
        }

        if ((door & CU) === 0) {
          this.ctx.moveTo(x * TILE, y * TILE);
          this.ctx.lineTo(x * TILE + TILE, y * TILE);
        }
      });
    });

    this.ctx.strokeStyle = "#111";
    this.ctx.stroke();*/
  }

  update(dt: number): void {
    if ((this.shiftTime -= dt) < 0) {
      this.shiftTime = .1;
      if (this.shift) this.shiftOrigin();
    }
  }

  draw(): void {
    this.cells.forEach(row =>
      row.forEach(cell => cell.draw(this.ctx, this.path)));

    if (this.walls) {
      this.drawWalls();
    }
  }

}

const o = new OriginShift();