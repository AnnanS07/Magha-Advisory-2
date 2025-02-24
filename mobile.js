// JavaScript for the Navbar Navigation
document.addEventListener("DOMContentLoaded", function () {
  // Select all nav items within the navbar
  const navItems = document.querySelectorAll("#navbar li");

  navItems.forEach(item => {
    item.addEventListener("click", function () {
      // Remove active class from all nav items
      navItems.forEach(i => i.classList.remove("active"));
      // Add active class to the clicked item
      this.classList.add("active");

      // Retrieve the data-target attribute to know which section to open.
      const targetID = this.getAttribute("data-target");
      if (targetID) {
        const targetElement = document.getElementById(targetID);
        if (targetElement) {
          // Smoothly scroll to the corresponding section
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
}); 