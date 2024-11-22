window.addEventListener('DOMContentLoaded', event => {
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

    navbarShrink();

    document.addEventListener('scroll', navbarShrink);

    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

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
const totalPages = 2; 

function showPage(pageNumber) {
  const teamContainer = document.querySelector('.team-container');
  
  if (pageNumber > totalPages || pageNumber < 1) return; 

  const pageWidth = teamContainer.clientWidth;
  teamContainer.scrollTo({
    left: pageWidth * (pageNumber - 1),
    behavior: 'smooth'
  });

  document.querySelectorAll('.pagination-dots .dot').forEach(dot => dot.classList.remove('active'));
  document.querySelectorAll('.pagination-dots .dot')[pageNumber - 1].classList.add('active');
  
  currentPage = pageNumber;
}

function submitForm(event) {
    event.preventDefault(); 

    document.querySelector('.result-card').style.display = 'block';
}

document.querySelectorAll('a.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        targetElement.scrollIntoView({ behavior: 'smooth' });
        
        targetElement.classList.add('animate-section');
        
        setTimeout(() => {
            targetElement.classList.remove('animate-section');
        }, 600);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("#mainNav .nav-link");

    const currentPage = window.location.href;

    navLinks.forEach(link => {
        if (link.href === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});

(function() {
    emailjs.init("SqTmJ0gIwSCVlSwIM");
})();

document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    emailjs.sendForm('service_4ac1syb', 'template_ark8llc', this)
        .then(function() {
            alert('Email berhasil terkirim!');
            document.getElementById('contactForm').reset();
        }, function(error) {
            alert('Gagal mengirim email: ' + JSON.stringify(error));
        });
});
