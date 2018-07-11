import Limelight from './lib/Limelight';

document.addEventListener('DOMContentLoaded', () => {
  const boxGrad = new Limelight(document.querySelectorAll('.box__thing'));
  console.log(boxGrad);
});
