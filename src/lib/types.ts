export type CurrentWeather = {
  temperatureC: number | null;
  code?: number | null;
  windKmh?: number | null;
};

export type DailyWeather = {
  date: string;
  tMaxC: number | null;
  tMinC: number | null;
  precipProb?: number | null;
};

export type SelectedDay = {
  date: string;
  tMaxC: number | null;
  tMinC: number | null;
  precipProb?: number | null;
  middayC?: number | null;
};

export type PlaceWeather = {
  place: string;
  lat: number | null;
  lng: number | null;
  kind?: string;
  isCity?: boolean;
  current?: CurrentWeather;
  daily?: DailyWeather[];
  selected?: SelectedDay;
  error?: string;
};

export type WeatherApiResponse = {
  items: PlaceWeather[];
  error?: string;
};

export type PlanApiResponse = {
  plan?: string;
  places?: string[];
  error?: string;
};
