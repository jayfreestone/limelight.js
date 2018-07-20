const options: OptionsType = {
  offset: 10,
  closeOnClick: true,
  classes: {
    window: 'limelight__window',
    activeClass: 'limelight--is-active',
  },
};

export interface OptionsType {
  offset?: number;
  closeOnClick?: boolean;
  classes?: {
    window?: string,
    activeClass?: string,
  };
}

export default options;
