import vehicleData from './vehicles.json';
export type Car = {
  id: string;
  brand: string;
  model: string;
  shortName: string;
  name: string;
  englishName: string;
  englishBrand: string;
  tag: string;
  year: number;
  price: number;
  mileage: string;
  colorName: string;
  accent: string;
  power: { value: string; unit: string; sortValue: number };
  acceleration: { value: string; label: string };
  topSpeed: { value: string; unit: string };
  weight: string;
  engine: string;
  transmissionShort: string;
  drivetrain: string;
  headline: string;
  storyTitle: string;
  description: string;
  highlights: string[];
  image: string;
  heroImage?: string;
  editorialImage: string;
  modelFile: string;
  modelYaw?: number;
  paintMaterials: string[];
  glassMaterials?: string[];
  rubberMaterials?: string[];
  modelAuthor: string;
  modelSource: string;
  modelLicense: string;
  colors: { name: string; hex: string }[];
  specNote: string;
  sources: { title: string; url: string }[];
  specs: { title: string; items: string[][] }[];
};
export const cars: Car[] = vehicleData.map((c) => ({
  ...c,
  image: `${import.meta.env.BASE_URL}${c.image}`,
  heroImage: `${import.meta.env.BASE_URL}${c.image}`,
  editorialImage: `${import.meta.env.BASE_URL}${c.image}`,
}));
