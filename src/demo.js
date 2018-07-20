document.addEventListener('DOMContentLoaded', function demoInit() {
  (() => {
    var demoBasic = document.querySelector('.js-demo-basic');
    var trigger = demoBasic.querySelector('.js-demo-basic__trigger');

    trigger.addEventListener('click', function () {
      const inst = new Limelight(document.querySelector('.box'));
      inst.open();
      console.log(inst);
    });
  })()

  var demoAutoAdjust = document.querySelector('.js-demo-auto-adjust');
  var trigger = demoAutoAdjust.querySelector('.js-demo-auto-adjust__trigger');

  trigger.addEventListener('click', function (e) {
    e.preventDefault();

    const inst = new Limelight(document.querySelector('.js-demo-auto-adjust__target'));
    inst.open();
    console.log(inst);
  });
});
