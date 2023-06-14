export type TChat = {
  id: number;
  type: string;
  isStartPhotoDay?: boolean;
};

export type TApod = {
  code: number;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  copyright?: string;
  media_type: string;
  date: string;
  error?: {
    message: string;
  };
};

export type TMars = {
  img_src: string;
  earth_date: string;
  sol: number;
};
