document.addEventListener("DOMContentLoaded", function () {
  const navbarItems = document.querySelectorAll("#mobileNavbar li");
  
  navbarItems.forEach(item => {
    item.addEventListener("click", function () {
      // Remove active class from all navbar items
      navbarItems.forEach(i => i.classList.remove("active"));
      this.classList.add("active");
      
      // Hide all sections (ensure your sections have the class "page-section")
      document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
      });
      
      // Show the section corresponding to the clicked item
      const targetId = this.getAttribute("data-target");
      if (targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.classList.add("active");
        }
      }
      
      // Scroll the main content into view for user convenience
      document.getElementById("content").scrollIntoView({ behavior: "smooth" });
    });
  });
});