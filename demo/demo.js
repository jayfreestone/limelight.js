document.addEventListener("DOMContentLoaded", function demoInit() {
  (() => {
    var demoBasic = document.querySelector(".js-demo-basic");
    var trigger = demoBasic.querySelector(".js-demo-basic__trigger");
    const inst = new Limelight(
      document.querySelector(".js-demo-basic__target"),
      {
        styles: {
          // bg: 'red',
          // windowTransitionDuration: '4s',
        },
      },
    );

    inst.open();

    trigger.addEventListener("click", function(e) {
      e.preventDefault();

      inst.open();
    });
  })();

  (() => {
    var demoAutoAdjust = document.querySelector(".js-demo-auto-adjust");
    var trigger = demoAutoAdjust.querySelector(".js-demo-auto-adjust__trigger");
    const inst = new Limelight(
      document.querySelector(".js-demo-auto-adjust__target")
    );

    trigger.addEventListener("click", function(e) {
      e.preventDefault();

      inst.open();

      // setTimeout(() => {
      //   inst.refocus(document.querySelector('.js-demo-basic__target'));
      // }, 2000);

      // setTimeout(() => {
      //   document.querySelector('.intro').style.minHeight = '10vh';
      // }, 3000);
    });
  })();

  (() => {
    var demo = document.querySelector(".js-demo-goto");
    var trigger = demo.querySelector(".js-demo-goto__trigger");
    var initial = document.querySelector(".js-demo-goto__target")
    var target = demo.querySelector(".js-demo-goto__dest");

    const inst = new Limelight(
      initial,
      // {
      //   styles: {
      //     // bg: 'red',
      //     windowTransitionDuration: '4s',
      //   },
      // },
    );

    trigger.addEventListener("click", function(e) {
      e.preventDefault();

      inst.refocus(initial);

      inst.open();

      setTimeout(() => {
        inst.refocus(target);
      }, 1000);

      // setTimeout(() => {
      //   document.querySelector('.intro').style.minHeight = '10vh';
      // }, 3000);
    });
  })()
});
