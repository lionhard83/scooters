export type Book = {
  id: string;
  scooterId: string;
  startLat: number;
  startLong: number;
  startDate: number;
  endLat?: number;
  endLong?: number;
  endDate?: number;
  distance?: number;
  pay?: number; // (endDate - startDate) * cost
};
