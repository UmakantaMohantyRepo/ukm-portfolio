const contactForm = document.querySelector("#contactForm");
const successMessage = document.querySelector("#formSuccessMessage");
const errorMessage = document.querySelector("#formErrorMessage");
const loadingSpinner = document.querySelector("#loadingSpinner");
const submitButton = document.querySelector(".submit-button");
const buttonText = document.querySelector(".button-text");
const navBar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-menu .nav-link");
const themeToggle = document.querySelector(".theme-toggle");

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const progressTrack = document.createElement("div");
progressTrack.className = "scroll-progress";
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress-bar";
progressTrack.appendChild(progressBar);
document.body.prepend(progressTrack);

const updateScrollProgress = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progressPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(Math.max(progressPercent, 0), 100)}%`;
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const THEME_STORAGE_KEY = "ukm-theme-preference";

const applyTheme = (theme) => {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);

  if (themeToggle) {
    themeToggle.textContent = isDark ? "Light Mode" : "Dark Mode";
    themeToggle.setAttribute("aria-pressed", String(isDark));
  }
};

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
if (savedTheme === "dark" || savedTheme === "light") {
  applyTheme(savedTheme);
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    const nextTheme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

if (navBar && navToggle) {
  navToggle.addEventListener("click", () => {
    const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isExpanded));
    navBar.classList.toggle("menu-open", !isExpanded);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navBar.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (contactForm && successMessage) {
  console.log('Form and success message found, adding event listener');
  contactForm.addEventListener("submit", async (event) => {
    console.log('Form submitted');
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    // Show loading state
    submitButton.disabled = true;
    buttonText.textContent = "Sending...";
    loadingSpinner.style.display = "block";

    // Hide any previous messages
    successMessage.classList.remove("show");
    errorMessage.classList.remove("show");

    try {
      // Get form data
      const formData = new FormData(contactForm);
      const submissionData = {
        full_name: formData.get("fullName"),
        email: formData.get("emailAddress"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        is_read: false
      };
      console.log('Form data:', submissionData);

      // Insert into Supabase
      console.log('Attempting to insert into Supabase...');
      const { data, error } = await supabaseClient
        .from('contact_submissions')
        .insert([submissionData]);

      console.log('Supabase response:', { data, error });

      if (error) {
        throw error;
      }

      console.log('Success! Showing success message');
      // Success
      successMessage.classList.add("show");
      contactForm.reset();

    } catch (error) {
      console.error('Error submitting form:', error);
      errorMessage.textContent = `Failed to send message: ${error.message || 'Please try again later.'}`;
      errorMessage.classList.add("show");
    } finally {
      console.log('Resetting loading state');
      // Reset loading state
      submitButton.disabled = false;
      buttonText.textContent = "Submit";
      loadingSpinner.style.display = "none";
    }
  });
}
