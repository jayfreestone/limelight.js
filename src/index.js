import Limelight from './lib/Limelight';

document.addEventListener('DOMContentLoaded', () => {
  // const targets = document.querySelectorAll('.box__thing');
  const targets = document.querySelector('.box__thing');
  const boxGrad = new Limelight(targets);

  document.querySelector('.js-start').addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    boxGrad.open();
  });

  boxGrad.on('open', (e) => {
    console.log('opening', e);
  });

  boxGrad.on('close', (e) => {
    console.log('closing', e);
  });

  boxGrad.on('reposition', (e) => {
    console.log('repositioning', e);
  });


  setTimeout(() => {
    boxGrad.refocus(document.querySelector('.other-thing'));
  }, 2000);

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
