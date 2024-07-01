import { CD, CL, CR, CU, HTILE, TILE, TWO_PI } from "./low/const.js";
import Point from "./low/point.js";

export default class Cell {

  doors: Cell[];
  dirs: number[];
  origin: boolean;
  pos: Point;

  constructor(x: number, y: number) {
    this.doors = [null, null, null, null];
    this.dirs = [CR, CD, CL, CU];
    this.pos = new Point(x, y);
  }

  draw(ctx: CanvasRenderingContext2D, path: boolean): void {

    ctx.fillStyle = this.origin ? "#0a2" : "#05d";

    const hht = HTILE >> 1;
    const x = this.pos.x * TILE + HTILE, y = this.pos.y * TILE + HTILE;

    if (path) {
      ctx.strokeStyle = "#05d";
      this.doors.forEach(c => {
        if (c) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(c.pos.x * TILE + HTILE, c.pos.y * TILE + HTILE);
          ctx.stroke();
        }
      });

      ctx.beginPath();
      ctx.arc(x, y, TILE / 10, 0, TWO_PI);
      ctx.fill();
    }

  }

  getAllDoors(): number {
    let n = 0;
    this.doors.forEach((door, r) => {
      if (door) n |= this.dirs[r];
    });
    return n;
  }

}