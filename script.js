document.addEventListener("DOMContentLoaded", () => {
  console.log("from github, ready");

  document.fonts.ready.then(() => {
    console.log("fonts ready");

    const debug = true; // if true, display the reset animation button
    let splitInstance = null;
    let introTimeline = null;
    const heroWrap = document.querySelector(".home_hero_wrap");

    function cardsOut(timeline) {
      const heroVisuals = heroWrap.querySelectorAll(
        ".hero_visual"
      );
      // console.log(heroVisuals);
      if (heroVisuals.length > 0) {
        // Calculate viewport center
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;

        // Store elements with their properties for stagger calculation
        const elementsData = Array.from(heroVisuals).map((visual) => {
          const rect = visual.getBoundingClientRect();
          const finalX = rect.left + rect.width / 2;
          const finalY = rect.top + rect.height / 2;

          // Get current rotation from CSS (2deg)
          const computedStyle = window.getComputedStyle(visual);
          const transformValue = computedStyle.transform;
          let rotation = 2; // Default rotation from CSS

          // Extract rotation from transform matrix if available
          if (transformValue && transformValue !== "none") {
            const matrix = new DOMMatrix(transformValue);
            rotation = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
          }

          // Calculate offset from viewport center to final position
          const offsetX = finalX - viewportCenterX;
          const offsetY = finalY - viewportCenterY * 0.75;

          // Calculate distance from center for stagger ordering
          const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

          return {
            visual,
            offsetX,
            offsetY,
            rotation,
            distance,
          };
        });

        // Sort by distance (furthest from center first for "edges" stagger)
        elementsData.sort((a, b) => b.distance - a.distance);

        // Set initial positions at viewport center
        elementsData.forEach((data) => {
          gsap.set(data.visual, {
            x: -data.offsetX,
            y: -data.offsetY,
            rotation: data.rotation,
            xPercent: 0,
            yPercent: 0,
            immediateRender: true,
          });
        });

        // Force a reflow
        void heroVisuals[0].offsetWidth;

        // Create array of elements sorted by distance (furthest first for edges stagger)
        const sortedElements = elementsData.map((data) => data.visual);

        // Store rotations for each element
        const rotations = elementsData.map((data) => data.rotation);

        // Animate with stagger from edges
        timeline.to(
          sortedElements,
          {
            x: 0,
            y: 0,
            rotation: (index) => rotations[index],
            xPercent: -50,
            yPercent: -30,
            duration: 0.7,
            ease: "expo.inOut",
            stagger: {
              from: "random",
              amount: 0.4,
            },
          },
          0 // Start at the same time as other animations
        );
      }
    }

    function homeIntro() {
      // GSAP SplitText effect for .home_hero_wrap h1
      const heroH1 = heroWrap.querySelector("h1.heading-style-display");
      const homeParagraph = heroWrap.querySelector(".home_hero_paragraph");
      const buttonGroupEl = heroWrap.querySelector(".button-group");
      const videoWrap = document.querySelector(".home_fullimage_wrap");

      const navbarWrap = document.querySelector(
        ".section_navigation1-light.w-nav"
      );

      // console.log(heroH1);
      if (heroH1 && typeof SplitText !== "undefined") {
        // Revert previous split if it exists
        if (splitInstance) {
          splitInstance.revert();
          splitInstance = null;
        }

        // Kill previous timeline if it exists
        if (introTimeline) {
          introTimeline.kill();
          introTimeline = null;
        }

        // Split text into words using SplitText plugin
        splitInstance = new SplitText(heroH1, {
          type: "words",
          wordsClass: "split-word",
        });

        // Wrap each word in a mask span for a reveal effect
        splitInstance.words.forEach((word) => {
          const mask = document.createElement("span");
          mask.className = "split-word-mask";
          // Ensure mask behaves as an inline-block with overflow hidden
          gsap.set(mask, { display: "inline-block", overflow: "hidden" });

          word.parentNode.insertBefore(mask, word);
          mask.appendChild(word);
        });

        // Create timeline for the animation
        introTimeline = gsap.timeline();

        // Animate the words
        introTimeline
          .from(splitInstance.words, {
            // opacity: 0,
            yPercent: 100,
            stagger: 0.05,
            ease: "power2.inOut",
          })
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
          .from(
            videoWrap,
            {
              y: 20,
              opacity: 0,
              duration: 0.4,
              delay: 0,
              ease: "power2.out",
            },
            "<"
          )
          .from(
            navbarWrap,
            {
              yPercent: -100,
              opacity: 0,
              duration: 0.4,
              delay: 0,
              ease: "power2.out",
            },
            "<"
          );

        // Add cardsOut animation at the same time
        cardsOut(introTimeline);
      }
    }

    // Remove [data-prevent-flicker]
    const preventFlicker = document.querySelectorAll("[data-prevent-flicker]");
    preventFlicker.forEach((flicker) => {
      gsap.set(flicker, {
        opacity: 1,
      });
    });

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

    // Create and add reset button to .button-group
    const buttonGroup = document.querySelector(".home_hero_wrap .button-group");

    if (buttonGroup && debug) {
      const resetButtonWrapper = document.createElement("div");
      resetButtonWrapper.className = "u-display-contents";

      const resetButton = document.createElement("button");
      resetButton.type = "button";
      resetButton.className = "button_wrap";
      resetButton.textContent = "Reset Animation";
      resetButton.addEventListener("click", () => resetIntro.restart(true));

      resetButtonWrapper.appendChild(resetButton);
      buttonGroup.appendChild(resetButtonWrapper);
    }
  });
});
