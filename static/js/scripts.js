/*!
* Start Bootstrap - Agency v7.0.12 (https://startbootstrap.com/theme/agency)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

let currentPage = 1;
const totalPages = 2; // Adjust based on the number of pages

function showPage(pageNumber) {
  const teamContainer = document.querySelector('.team-container');
  
  if (pageNumber > totalPages || pageNumber < 1) return; // Prevent invalid page numbers

  // Calculate scroll position based on the page number
  const pageWidth = teamContainer.clientWidth;
  teamContainer.scrollTo({
    left: pageWidth * (pageNumber - 1),
    behavior: 'smooth'
  });

  // Update active dot
  document.querySelectorAll('.pagination-dots .dot').forEach(dot => dot.classList.remove('active'));
  document.querySelectorAll('.pagination-dots .dot')[pageNumber - 1].classList.add('active');
  
  currentPage = pageNumber;
}

function submitForm(event) {
    event.preventDefault();  // Prevent the form from refreshing the page

    // Add your form submission logic here (e.g., AJAX request or other processing)

    // Optionally show result if it's not dynamically updated from the server
    document.querySelector('.result-card').style.display = 'block';
}

// Mengatur elemen mana yang akan dianimasikan saat scroll
document.querySelectorAll('a.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        // Scroll ke elemen target
        targetElement.scrollIntoView({ behavior: 'smooth' });
        
        // Tambahkan kelas animasi setelah scroll
        targetElement.classList.add('animate-section');
        
        // Hapus animasi setelah selesai agar dapat digunakan kembali
        setTimeout(() => {
            targetElement.classList.remove('animate-section');
        }, 600); // Waktu ini harus sama dengan durasi animasi slideDown
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Ambil semua tautan di navbar
    const navLinks = document.querySelectorAll("#mainNav .nav-link");

    // Dapatkan URL halaman saat ini
    const currentPage = window.location.href;

    // Periksa tautan mana yang sesuai dengan URL
    navLinks.forEach(link => {
        if (link.href === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});

(function () {
    emailjs.init("AaCb-O3RvHPvmCgLX"); // Public Key
})();

// Handle Form Submission
document.getElementById("contactForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const message = document.getElementById("message").value;

    // Send email using EmailJS
    emailjs
        .send("service_4ac1syb", "template_ark8llc", {
            name: name,
            email: email,
            phone: phone,
            message: message,
        })
        .then(
            function (response) {
                console.log("SUCCESS!", response.status, response.text);
                document.getElementById("submitSuccessMessage").classList.remove("d-none");
                document.getElementById("submitErrorMessage").classList.add("d-none");
            },
            function (error) {
                console.error("FAILED...", error);
                document.getElementById("submitErrorMessage").classList.remove("d-none");
                document.getElementById("submitSuccessMessage").classList.add("d-none");
            }
        );
});
