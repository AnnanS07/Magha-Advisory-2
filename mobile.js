// JavaScript for Mobile Navigation
document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll("#mobileNavbar li");

  navItems.forEach(item => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      navItems.forEach(i => i.classList.remove("active"));
      // Add active class to the clicked item
      this.classList.add("active");

      // Get the target section's ID from data-target attribute
      const targetID = this.getAttribute("data-target");
      if (targetID) {
        const targetElement = document.getElementById(targetID);
        if (targetElement) {
          // Scroll smoothly to the target section
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
}); 