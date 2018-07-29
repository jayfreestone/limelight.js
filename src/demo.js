document.addEventListener("DOMContentLoaded", function demoInit() {
  (() => {
    var demoBasic = document.querySelector(".js-demo-basic");
    var trigger = demoBasic.querySelector(".js-demo-basic__trigger");
    const inst = new Limelight(
      document.querySelector(".js-demo-basic__target")
    );

    trigger.addEventListener("click", function(e) {
      e.preventDefault();

      inst.open();
    });
  })();

  var demoAutoAdjust = document.querySelector(".js-demo-auto-adjust");
  var trigger = demoAutoAdjust.querySelector(".js-demo-auto-adjust__trigger");
  const inst = new Limelight(
    document.querySelector(".js-demo-auto-adjust__target")
  );

  trigger.addEventListener("click", function(e) {
    e.preventDefault();

    inst.open();

    setTimeout(() => {
      document.querySelector('.intro').style.minHeight = '10vh';
    }, 3000);
  });
});
