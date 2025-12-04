let splitInstance = null;
let introTimeline = null;

function homeIntro() {
  // GSAP SplitText effect for .hero_effect_component h1
  const heroH1 = document.querySelector('.hero_effect_component h1');
  
  if (heroH1 && typeof SplitText !== 'undefined') {
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
      wordsClass: "split-word"
    });
    
    // Create timeline for the animation
    introTimeline = gsap.timeline();
    
    // Animate the words
    introTimeline.from(splitInstance.words, {
      opacity: 0,
      y: 20,
      duration: .7,
      stagger: 0.13,
      ease: "power2.in"
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("ready");
  
  // Initialize the intro animation
  homeIntro();
  
  // Create reset mechanism - timeline that delays then calls homeIntro
  const resetIntro = gsap.timeline({ paused: true })
    .to({}, { duration: 0.2 })
    .call(homeIntro);
  
  // Reset on window resize
  window.addEventListener("resize", () => resetIntro.restart(true));
  
  // Expose reset function globally so it can be called by a button
  window.resetIntroAnimation = () => resetIntro.restart(true);
  
  // Create and add reset button to .button-group
  const buttonGroup = document.querySelector('.button-group');
  if (buttonGroup) {
    const resetButtonWrapper = document.createElement('div');
    resetButtonWrapper.className = 'u-display-contents';
    
    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'button_wrap';
    resetButton.textContent = 'Reset Animation';
    resetButton.addEventListener('click', () => resetIntro.restart(true));
    
    resetButtonWrapper.appendChild(resetButton);
    buttonGroup.appendChild(resetButtonWrapper);
  }
});
