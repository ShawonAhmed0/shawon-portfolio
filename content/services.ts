import data from "./data/services.json";

export type Service = { name: string; description: string };

export const services: Service[] = data;
