import { defaults } from "../../shared/defaults/defaults";

export function getFirst(v: any[]) {
  return v[0];
}

export function generateRandomDigit(max: number) {
  return Math.round(Math.random() * 10 ** max)
    .toString()
    .padEnd(max, '0');
}

export function jwtExpiresInToDate(expiresIn: number) {
  const expiresAt = getCurrentDate() + (expiresIn * 1000)
  return getDateByValue(expiresAt).toISOString()
}

export function getExpireDate(date: Date) {
  const dateTimestamp = new Date(date);
  return dateTimestamp.getTime() + (60 * 1000)
}

export function getDateByValue(date: number | Date) {
  return new Date(date);
}

export function getCurrentDate() {
  return Date.now();
}

export function monthDiff(d1: Date, d2: Date) {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth() + 1;
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

export function daysDiff(d1: Date, d2: Date) {
  return Math.ceil((Math.abs(d1.getTime() - d2.getTime())) / (1000 * 3600 * 24));
}

export function minutesDiff(d1: Date, d2: Date) {
  return Math.round(((d2.valueOf() - d1.valueOf()) / 1000) / 60);
}

export function secondsDiff(d1: Date, d2: Date) {
  return Math.round((((d2.valueOf() - d1.valueOf()) / 1000) / 60) / 60);
}
