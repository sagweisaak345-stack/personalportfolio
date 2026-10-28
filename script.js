// ==========================================
// 1. SUPABASE DATABASE CONFIGURATION
// ==========================================
// IMPORTANT: Replace these with your actual Supabase project details!
// Go to your Supabase dashboard -> Project Settings -> API to find these.
const SUPABASE_URL = 'https://sbjddrwxujrjexqefmki.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_prKMc3VEGjHSs8-U5BznZA_akrJn8ZZ';

// Initialize Supabase client (only if the library is loaded)
let supabaseClient = null;
if (typeof window.supabase !== 'undefined' && SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==========================================
// 2. MAIN SCRIPT LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  
  // --- A. Update Copyright Year ---
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // --- B. Mobile Navigation Toggle ---
  const navToggle = document.querySelector('.nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const navLinks = document.querySelectorAll('.nav a');

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      primaryNav.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        primaryNav.classList.remove('active');
      });
    });
  }

  // --- C. GSAP Hero Animations ---
  if (typeof gsap !== 'undefined') {
    // Animate text elements
    gsap.from(".content-wrapper > *", {
      y: 30, 
      opacity: 0, 
      duration: 1, 
      stagger: 0.15, 
      ease: "power3.out", 
      delay: 0.2
    });
    // Animate code card
    gsap.from(".hero-card", {
      x: 50, 
      opacity: 0, 
      duration: 1.2, 
      delay: 0.6, 
      ease: "power3.out"
    });
  }

  // --- D. THREE.JS 3D SKILLS SPHERE ---
  const container = document.getElementById('skills-3d-container');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (container && typeof THREE !== 'undefined' && !prefersReducedMotion) {
    
    const skills = [
      "HTML5", "CSS3", "JavaScript", "React", "CSS Grid", 
      "Flexbox", "Accessibility", "Git / GitHub", "Figma", 
      "Netlify", "Responsive", "UI/UX", "Three.js", "TypeScript"
    ];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.z = 600;

    const renderer = new THREE.CSS3DRenderer();
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const radius = 200;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    skills.forEach((skill, i) => {
      const y = 1 - (i / (skills.length - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y) * radius;
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const actualY = y * radius;

      const element = document.createElement('div');
      element.className = 'skill-tag-3d';
      element.textContent = skill;

      const object = new THREE.CSS3DObject(element);
      object.position.set(x, actualY, z);
      object.lookAt(new THREE.Vector3(x * 2, actualY * 2, z * 2));
      
      group.add(object);
    });

    let targetRotationX = 0;
    let targetRotationY = 0;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      const mouseY = ((e.clientY - rect.top) / container.clientHeight) * 2 - 1;
      
      targetRotationX = mouseY * 0.5;
      targetRotationY = mouseX * 0.5;
    });

    container.addEventListener('mouseleave', () => {
      targetRotationX = 0;
      targetRotationY = 0;
    });

    const clock = new THREE.Clock();
    
    function animate3D() {
      requestAnimationFrame(animate3D);
      const elapsedTime = clock.getElapsedTime();

      // Base slow rotation
      group.rotation.y += 0.001;
      group.rotation.x += 0.0005;

      // Smooth mouse interaction
      group.rotation.x += (targetRotationX - group.rotation.x) * 0.05;
      group.rotation.y += (targetRotationY - group.rotation.y) * 0.05;

      // Gentle floating animation
      group.position.y = Math.sin(elapsedTime * 0.5) * 10;

      renderer.render(scene, camera);
    }

    animate3D();

    window.addEventListener('resize', () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

  } else if (container && prefersReducedMotion) {
    // Fallback for users who prefer reduced motion
    container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 2rem;">HTML, CSS, JavaScript, React, Accessibility, Git, Figma, and more.</p>`;
  }

  // --- E. SUPABASE CONTACT FORM SUBMISSION ---
  const contactForm = document.querySelector('.contact-form');

  if (contactForm && supabaseClient) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Stop normal form submission
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      // Get form data
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');

      try {
        // Insert data into the 'messages' table in Supabase
        const { error } = await supabaseClient
          .from('messages')
          .insert([{ name: name, email: email, message: message }]);

        if (error) throw error;

        // Success!
        alert('Message sent successfully! I will get back to you soon.');
        contactForm.reset(); // Clear the form

      } catch (error) {
        console.error('Error sending message:', error);
        alert('Sorry, there was an issue sending your message. Please try again later.');
      } finally {
        // Restore button state whether it worked or failed
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      }
    });
  } else if (contactForm && !supabaseClient) {
    console.warn("Supabase client not initialized. Check your URL and API key.");
    // Fallback error message if they try to submit without the DB connected
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Database connection not set up yet. Please add your Supabase credentials.");
    });
  }

});