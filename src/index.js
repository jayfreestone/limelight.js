import Limelight from './lib/Limelight';

document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll('.box__thing');
  const boxGrad = new Limelight(targets);

  document.querySelector('.js-start').addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    boxGrad.open();
  });

  boxGrad.on('open', () => {
    console.log('opening');
  });

  boxGrad.on('close', () => {
    console.log('closing');
  });

  // targets.forEach(target => {
  //   target.addEventListener('open', () => {
  //     console.log('we are opening');
  //   });
  //   target.addEventListener('close', () => {
  //     console.log('we are closing');
  //   });
  // })

  console.log(boxGrad);
});
