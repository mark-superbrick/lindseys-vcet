document.addEventListener("DOMContentLoaded", () => {
  console.log("ready");

  document.fonts.ready.then(() => {
    console.log("fonts ready");

    const debug = false; // if true, display the reset animation button
    if (debug) {
      document.documentElement.classList.add("debug-mode");
    }

    let splitInstance = null;
    let introTimeline = null;
    const heroWrap = document.querySelector(".home_hero_wrap");
    let cardsData = null;

    function getCardsData() {
      const heroVisuals = heroWrap.querySelectorAll(".hero_visual");
      if (!heroVisuals.length) return null;

      const heroRect = heroWrap.getBoundingClientRect();
      const wrapCenterX = heroRect.left + heroRect.width / 2;
      const wrapCenterY = heroRect.top + heroRect.height / 2;

      const data = Array.from(heroVisuals).map((visual) => {
        const rect = visual.getBoundingClientRect();
        const finalX = rect.left + rect.width;
        const finalY = rect.top + rect.height;

        const computedStyle = window.getComputedStyle(visual);
        const transformValue = computedStyle.transform;
        let rotation = 2;

        if (transformValue && transformValue !== "none") {
          const matrix = new DOMMatrix(transformValue);
          rotation = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        }

        // offsets relative to heroWrap center
        const offsetX = finalX - wrapCenterX;
        const offsetY = finalY - wrapCenterY;

        return {
          visual,
          finalX,
          finalY,
          offsetX,
          offsetY,
          rotation,
        };
      });

      // // optional debug
      // console.table(
      //   data.map((d) => ({
      //     finalX: d.finalX,
      //     finalY: d.finalY,
      //     offsetX: d.offsetX,
      //     offsetY: d.offsetY,
      //   }))
      // );

      return data;
    }

    function cardsIn() {
      const tl = gsap.timeline();

      cardsData = getCardsData();
      if (!cardsData) return tl;

      const sortedElements = cardsData.map((d) => d.visual);

      // from bottom, no rotation or X/Y offsets
      tl.fromTo(
        sortedElements,
        {
          x: (i) => -cardsData[i].offsetX,
          y: window.innerHeight,
          // rotation: 0,
        },
        {
          // move into a centered cluster, still no rotation
          x: (i) => -cardsData[i].offsetX,
          y: (i) => -cardsData[i].offsetY,
          // rotation: 0,
          duration: 0.75,
          ease: "power4.out",
          stagger: {
            from: "start",
            amount: 0.6,
          },
        },
        0
      );

      return tl;
    }

    function cardsOut(timeline) {
      if (!cardsData) {
        cardsData = getCardsData();
      }
      if (!cardsData) return;

      const sortedElements = cardsData.map((d) => d.visual);
      const rotations = cardsData.map((d) => d.rotation);

      // start from the centered cluster produced by cardsIn
      // then fan out to final positions with rotation and final offsets
      timeline.to(
        sortedElements,
        {
          x: 0,
          y: 0,
          rotation: (index) => rotations[index],
          xPercent: -50,
          yPercent: -50,
          duration: 0.7,
          ease: "power4.inOut",
          stagger: {
            from: "random",
            amount: 0.4,
          },
        },
        0
      );
    }

    function homeIntro() {
      const heroH1 = heroWrap.querySelector("h1.heading-style-display");
      const homeParagraph = heroWrap.querySelector(".home_hero_paragraph");
      const buttonGroupEl = heroWrap.querySelector(".button-group");
      // const videoWrap = document.querySelector(".home_fullimage_wrap");
      const navbarWrap = document.querySelector(
        ".section_navigation1-light.w-nav"
      );

      // show [data-prevent-flicker]
      let preventedFlicker = document.querySelectorAll(
        "[data-prevent-flicker]"
      );
      preventedFlicker.forEach((prevent) => {
        gsap.set(prevent, { autoAlpha: 1 });
      });

      if (heroH1 && typeof SplitText !== "undefined") {
        if (splitInstance) {
          splitInstance.revert();
          splitInstance = null;
        }

        if (introTimeline) {
          introTimeline.kill();
          introTimeline = null;
        }

        splitInstance = new SplitText(heroH1, {
          type: "words",
          wordsClass: "split-word",
        });

        splitInstance.words.forEach((word) => {
          const mask = document.createElement("span");
          mask.className = "split-word-mask";
          gsap.set(mask, { display: "inline-block", overflow: "hidden" });

          word.parentNode.insertBefore(mask, word);
          mask.appendChild(word);
        });

        introTimeline = gsap.timeline();

        // 1. cardsIn first
        const cardsInTimeline = cardsIn();
        introTimeline.add(cardsInTimeline, 0);

        // label where cardsOut + SplitText start
        introTimeline.add("reveal");

        // 2. cardsOut at same time as SplitText
        const cardsOutTimeline = gsap.timeline();
        cardsOut(cardsOutTimeline);
        introTimeline.add(cardsOutTimeline, "reveal");

        introTimeline.from(
          splitInstance.words,
          {
            yPercent: 100,
            stagger: 0.05,
            ease: "power2.inOut",
          },
          "reveal"
        );

        // 3. paragraph, buttons, video, navbar
        introTimeline
          .from(
            homeParagraph,
            {
              y: 20,
              opacity: 0,
              duration: 0.2,
              delay: 0.5,
              ease: "power2.out",
            },
            "<"
          )
          .from(
            buttonGroupEl,
            {
              y: 20,
              opacity: 0,
              duration: 0.2,
              delay: 0.2,
              ease: "power2.out",
            },
            "<"
          )
          /** /
          .from(
            videoWrap,
            {
              y: 20,
              opacity: 0,
              duration: 0.4,
              delay: 0,
              ease: "power2.out",
            },
            "-=.02"
          )
          /**/
          .from(
            navbarWrap,
            {
              yPercent: -100,
              opacity: 0,
              duration: 0.4,
              delay: 0,
              ease: "power2.out",
            },
            "-=0.2"
          );
      }
    }

    // Initialize the intro animation
    homeIntro();

    // Create reset mechanism - timeline that delays then calls homeIntro
    const resetIntro = gsap
      .timeline({ paused: true })
      .to({}, { duration: 0.2 })
      .call(homeIntro);

    // Reset on window resize
    // window.addEventListener("resize", () => resetIntro.restart(true));

    // Expose reset function globally so it can be called by a button
    window.resetIntroAnimation = () => resetIntro.restart(true);

    // Create and add reset button to .button-group, set debug=true in line 7 to activate
    const buttonGroup = document.querySelector(".home_hero_wrap .button-group");

    if (buttonGroup && debug) {
      const resetButtonWrapper = document.createElement("div");
      resetButtonWrapper.className = "u-display-contents";

      const resetButton = document.createElement("button");
      resetButton.type = "button";
      resetButton.className = "button_wrap";
      resetButton.classList.add("debugger");
      resetButton.textContent = "Reset Animation";
      resetButton.addEventListener("click", () => resetIntro.restart(true));

      resetButtonWrapper.appendChild(resetButton);
      buttonGroup.appendChild(resetButtonWrapper);
    }
  });
});
