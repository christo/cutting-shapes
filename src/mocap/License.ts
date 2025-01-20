export class License {
  readonly shortName: string;
  readonly longName: string;

  constructor(shortName: string, longName: string) {
    this.shortName = shortName;
    this.longName = longName;
  }
}