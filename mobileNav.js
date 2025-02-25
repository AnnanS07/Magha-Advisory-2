document.addEventListener("DOMContentLoaded", function () {
  // Get references to mobile navbar elements
  const navbarItems = document.querySelectorAll("#mobileNavbar li");
  const calculatorToolsItem = document.querySelector("#mobileNavbar li[data-target='calculatorTools']");
  const mobileSubmenu = document.querySelector("#mobileSubmenu");
  
  // Handle clicks on regular navbar items
  navbarItems.forEach(item => {
    item.addEventListener("click", function () {
      // Skip special handling for Calculator/Tools item
      if (this.getAttribute("data-target") === "calculatorTools") {
        return;
      }
      
      // Remove active class from all navbar items
      navbarItems.forEach(i => i.classList.remove("active"));
      this.classList.add("active");
      
      // Hide the submenu when clicking on other items
      if (mobileSubmenu) {
        mobileSubmenu.classList.remove("open");
      }
      
      // Hide all sections
      document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
      });
      
      // Show the section corresponding to the clicked item
      const targetId = this.getAttribute("data-target");
      if (targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.classList.add("active");
          
          // Scroll to the section with proper offset
          const headerHeight = document.getElementById("desktopHeader").offsetHeight;
          const mobileNavbarHeight = document.getElementById("mobileNavbar").offsetHeight;
          const offset = headerHeight + mobileNavbarHeight;
          
          const elementPosition = targetSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
  
  // Special handling for Calculator/Tools item to toggle submenu
  if (calculatorToolsItem) {
    calculatorToolsItem.addEventListener("click", function(e) {
      e.preventDefault();
      mobileSubmenu.classList.toggle("open");
    });
  }
  
  // Handle clicks on submenu items
  const submenuItems = document.querySelectorAll("#mobileSubmenu li");
  submenuItems.forEach(item => {
    item.addEventListener("click", function(e) {
      e.stopPropagation(); // Prevent event bubbling
      
      // Remove active class from all navbar items
      navbarItems.forEach(i => i.classList.remove("active"));
      
      // Add active class to Calculator/Tools parent
      if (calculatorToolsItem) {
        calculatorToolsItem.classList.add("active");
      }
      
      // Remove active class from all submenu items
      submenuItems.forEach(i => i.classList.remove("active"));
      this.classList.add("active");
      
      // Hide all sections
      document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
      });
      
      // Show the section corresponding to the clicked submenu item
      const targetId = this.getAttribute("data-target");
      if (targetId) {
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          targetSection.classList.add("active");
          
          // Scroll to the section with proper offset
          const headerHeight = document.getElementById("desktopHeader").offsetHeight;
          const mobileNavbarHeight = document.getElementById("mobileNavbar").offsetHeight;
          const offset = headerHeight + mobileNavbarHeight;
          
          const elementPosition = targetSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
      
      // Close the submenu after selection on mobile
      mobileSubmenu.classList.remove("open");
    });
  });
});