declare const THREE: any;
declare const AudioSys: any;
declare const GFX: any;
declare const Sets: any;
declare const Play: any;
declare const Director: any;

type SetStyle = 'proscenium' | 'blackbox' | 'electric';
type TheatreStyle = 'proscenium' | 'blackbox' | 'electric';

interface Window { __THEATRE_PROGRESS__?: number; }
