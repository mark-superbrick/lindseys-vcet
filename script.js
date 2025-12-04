document.addEventListener("DOMContentLoaded", () => {
  console.log("ready");

  // GSAP SplitText effect for .hero_effect_component h1
  const heroH1 = document.querySelector('.hero_effect_component h1');
  
  if (heroH1 && typeof SplitText !== 'undefined') {
    // Split text into words using SplitText plugin
    const split = new SplitText(heroH1, {
      type: "words",
      wordsClass: "split-word"
    });
    
    // Optional: Animate the words
    gsap.from(split.words, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    });
  }
});
