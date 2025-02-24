// JavaScript for the Navbar Navigation
document.addEventListener("DOMContentLoaded", function () {
  // Select all nav items within the navbar
  const navItems = document.querySelectorAll("#navbar li");

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      // Remove the "active" class from all nav items
      navItems.forEach(i => i.classList.remove("active"));
      
      // Add the "active" class to the clicked item
      this.classList.add("active");
      
      // Retrieve the data-target attribute to determine which section to scroll to
      const targetID = this.getAttribute("data-target");
      if (targetID) {
        const targetElement = document.getElementById(targetID);
        if (targetElement) {
          // Smoothly scroll to the target section
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });
}); 