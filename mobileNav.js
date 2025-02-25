document.addEventListener("DOMContentLoaded", function () {
  const navbarItems = document.querySelectorAll("#mobileNavbar li");

  navbarItems.forEach(item => {
    item.addEventListener("click", function () {
      // Remove active class from all navbar items
      navbarItems.forEach(i => i.classList.remove("active"));
      
      // Add active class to the clicked item
      this.classList.add("active");
      
      // Scroll to the section specified in data-target with proper offset
      const targetId = this.getAttribute("data-target");
      if (targetId) {
        const section = document.getElementById(targetId);
        if (section) {
          const headerHeight = document.getElementById("desktopHeader").offsetHeight;
          const mobileNavbarHeight = document.getElementById("mobileNavbar").offsetHeight;
          const offset = headerHeight + mobileNavbarHeight;
          
          const elementPosition = section.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
});