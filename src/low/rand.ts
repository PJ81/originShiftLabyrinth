export default class Rand {
  private s: number;
  private a: number;
  private c: number;
  private m: number;

  constructor(s: number = 0) {
    this.a = 1103515245;
    this.c = 12345;
    this.m = 2 ** 31;
    this.seed(s);
  }

  seed(s?: number) {
    this.s = (s | 0) === 0 ? Date.now() : s!;
  }

  private rand(): number {
    this.s = (this.a * this.s + this.c) % this.m;
    return this.s / this.m;
  }

  random(i: number = 1, a?: number): number {
    if (!a) return this.rand() * i;
    return this.rand() * (a - i) + i;
  }

  randInt(i: number = 1, a?: number): number {
    if (!a) return ~~(this.rand() * i);
    return ~~(this.rand() * (a - i) + i);
  }

  rollDice(diceSides: number = 6, diceCount: number = 1): number {
    let res = 0;
    for (let q = 0; q < diceCount; q++) {
      res += ~~(this.random(diceSides)) + 1;
    }
    return res;
  }

  choose<T>(arr: T[]): T {
    return arr[~~this.random(arr.length)];
  }

  randArray<T>(arr: T[]): T[] {
    return arr.sort(() => this.random(-1, 1));
  }
}