export class License {
  readonly shortName: string;
  readonly longName: string;

  constructor(shortName: string, longName: string) {
    this.shortName = shortName;
    this.longName = longName;
  }
}


export const CC_BY = new License("CC-BY", 'CC-BY Creative Commons By Attribution');
export const CG_RF_NOAI = new License("CG-RF-NOAI", 'CG Trader Royalty Free License - No AI');
export const CC0 = new License("CC0", 'CC0 (Public Domain)');
export const MIT = new License("MIT", 'MIT License');