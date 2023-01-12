export type Book = {
  scooterId: string;
  startLat: number;
  startLong: number;
  startDate: number;
  endLat?: number;
  endLong?: number;
  endDate?: number;
  pay?: number; // (endDate - startDate) * cost
};
