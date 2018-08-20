const options: OptionsType = {
  offset: 10,
  closeOnClick: true,
  classes: {
    window: 'limelight__window',
    activeClass: 'limelight--is-active',
  },
  styles: {},
};

export interface OptionsType {
  offset?: number;
  closeOnClick?: boolean;
  classes?: {
    window?: string,
    activeClass?: string,
  };
  styles?: {
    bg?: string;
    windowTransitionDuration?: string,
    zIndex?: number,
  },
}

export default options;
