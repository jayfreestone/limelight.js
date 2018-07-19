document.addEventListener('DOMContentLoaded', function demoInit() {
  var demoBasic = document.querySelector('.js-demo-basic');
  var trigger = demoBasic.querySelector('.js-demo-basic__trigger');

  trigger.addEventListener('click', function() {
    const inst = new Limelight(document.querySelector('.box'));
    inst.open();
    console.log(inst);
  });
});
