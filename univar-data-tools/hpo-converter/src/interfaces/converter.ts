export interface Converter {
  convert(): Promise<void>;
}