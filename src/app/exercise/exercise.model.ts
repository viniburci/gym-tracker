import { SafeUrl } from '@angular/platform-browser';

export interface Exercise {
  id: number;
  name?: string;
  type?: string;
  imageUrl?: string | SafeUrl;
}
