/* ============================================
   SI GROUP EB-5 LANDING PAGE — MAIN JS
   ============================================ */

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const announceBar = document.querySelector('.announce-bar');
let lastHeaderScrollY = window.scrollY || 0;
let mobileAnnounceHidden = false;

function updateNavbar() {
  if (!navbar) return;
  const offset = announceBar ? announceBar.offsetHeight : 0;
  const isMobileHeader = window.matchMedia('(max-width: 768px)').matches;
  const currentY = window.scrollY || 0;
  const scrollingDown = currentY > lastHeaderScrollY + 4;
  const scrollingUp = currentY < lastHeaderScrollY - 4;

  if (isMobileHeader && announceBar) {
    if (currentY <= 12 || scrollingUp) mobileAnnounceHidden = false;
    if (currentY > offset + 24 && scrollingDown) mobileAnnounceHidden = true;
    document.body.classList.toggle('mobile-announce-hidden', mobileAnnounceHidden);
  } else {
    mobileAnnounceHidden = false;
    document.body.classList.remove('mobile-announce-hidden');
  }

  if (currentY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  if (isMobileHeader) {
    navbar.style.top = mobileAnnounceHidden ? '0' : offset + 'px';
  } else {
    // Desktop giữ nguyên hành vi cũ: đầu trang navbar nằm dưới thanh thông báo,
    // khi scroll xuống mới dính top 0. Không áp dụng hide/show announce trên PC.
    navbar.style.top = currentY > 60 ? '0' : offset + 'px';
  }
  lastHeaderScrollY = currentY;
}
window.addEventListener('scroll', updateNavbar, { passive: true });
window.addEventListener('resize', updateNavbar, { passive: true });
updateNavbar();

// ===== MOBILE MENU =====
function toggleMobileMenu(forceClose = false) {
  const navLinksEl = document.getElementById('navLinks');
  if (!navLinksEl) return;
  const shouldOpen = forceClose ? false : !navLinksEl.classList.contains('mobile-open');
  navLinksEl.classList.toggle('mobile-open', shouldOpen);
  document.body.classList.toggle('mobile-menu-open', shouldOpen);
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.counter').forEach(animateCounter);
        counterObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.stats-grid').forEach(el => counterObserver.observe(el));
// Fallback: nếu observer không chạy trong browser/tunnel, vẫn hiển thị số thật sau 2.2s.
setTimeout(() => {
  document.querySelectorAll('.counter').forEach(el => {
    if ((el.textContent || '').trim() === '0') el.textContent = parseInt(el.getAttribute('data-target'), 10).toLocaleString();
  });
}, 2200);

// ===== YOUTUBE EMBED / FILE FALLBACK =====
(function initYoutubeEmbeds() {
  document.querySelectorAll('.youtube-embed').forEach(card => {
    const videoId = card.dataset.videoId;
    if (!videoId) return;

    // YouTube iframe can show "Error 153: Video player configuration error"
    // when index.html is opened directly with file:// because there is no valid web origin.
    // In that case, keep the thumbnail link so the video opens reliably on YouTube.
    if (window.location.protocol === 'file:') return;

    const title = card.dataset.videoTitle || 'YouTube video';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
    iframe.title = title;
    iframe.loading = 'lazy';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    card.replaceChildren(iframe);
  });
})();

// ===== FAQ ACCORDION =====
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const group = btn.closest('.faq-group');
  const answer = item?.querySelector('.faq-a');
  if (!item || !group || !answer) return;

  const isOpen = item.classList.contains('open');

  group.querySelectorAll('.faq-item.open').forEach(openItem => {
    if (openItem !== item) {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-a')?.classList.remove('open');
    }
  });

  item.classList.toggle('open', !isOpen);
  answer.classList.toggle('open', !isOpen);
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = navbar.offsetHeight + (announceBar ? announceBar.offsetHeight : 0);
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: 'smooth' });
      // Close mobile menu
      document.getElementById('navLinks').classList.remove('mobile-open');
      document.body.classList.remove('mobile-menu-open');
    }
  });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + e.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  },
  { threshold: 0.35 }
);
sections.forEach(s => sectionObserver.observe(s));


// ===== SECTION 3 CONCERN TABS =====
function initConcernTabs() {
  const tabs = document.querySelectorAll('[data-concern-tab]');
  const panels = document.querySelectorAll('[data-concern-panel]');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-concern-tab');
      tabs.forEach(item => {
        const isActive = item === tab;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      panels.forEach(panel => {
        panel.classList.toggle('active', panel.getAttribute('data-concern-panel') === target);
      });
    });
  });
}
initConcernTabs();

// ===== SECTION 3 MOBILE ACCORDION (<=768px) =====
function initConcernMobileAccordion() {
  const panels = Array.from(document.querySelectorAll('[data-concern-panel]'));
  const tabs = Array.from(document.querySelectorAll('[data-concern-tab]'));
  if (!panels.length) return;

  const isAccordionRange = () => window.matchMedia('(max-width: 768px)').matches;

  function openPanel(target) {
    panels.forEach(panel => {
      const isOpen = panel.getAttribute('data-concern-panel') === target;
      panel.classList.toggle('active', isOpen);
      panel.classList.toggle('mobile-accordion-open', isOpen);
      panel.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    tabs.forEach(tab => {
      const isSelected = tab.getAttribute('data-concern-tab') === target;
      tab.classList.toggle('active', isSelected);
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
  }

  function normalizeAccordionState() {
    if (!isAccordionRange()) {
      panels.forEach(panel => {
        panel.classList.remove('mobile-accordion-open');
        panel.removeAttribute('tabindex');
        panel.removeAttribute('aria-expanded');
      });
      return;
    }

    const current = panels.find(panel => panel.classList.contains('active')) || panels[0];
    panels.forEach(panel => {
      panel.setAttribute('tabindex', '0');
      panel.setAttribute('aria-expanded', panel === current ? 'true' : 'false');
    });
    openPanel(current.getAttribute('data-concern-panel'));
  }

  panels.forEach(panel => {
    panel.addEventListener('click', event => {
      if (!isAccordionRange()) return;
      if (event.target.closest('a, button, input, select, textarea')) return;
      openPanel(panel.getAttribute('data-concern-panel'));
    });

    panel.addEventListener('keydown', event => {
      if (!isAccordionRange()) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openPanel(panel.getAttribute('data-concern-panel'));
    });
  });

  window.addEventListener('resize', normalizeAccordionState, { passive: true });
  normalizeAccordionState();
}
initConcernMobileAccordion();

// ===== FORM SUBMIT TO CMS / HUBSPOT =====
const SITE_URL = 'https://sigroup.vn';
const URL_AJAX = 'https://sigroup.vn/wp-admin/admin-ajax.php';

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name) || '';
}

function fillTrackingFields() {
  const trackingFields = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content',
    'hsa_acc', 'hsa_cam', 'hsa_grp', 'hsa_ad', 'hsa_src', 'hsa_net', 'hsa_ver'
  ];

  trackingFields.forEach(field => {
    const input = document.getElementById(field);
    if (!input) return;
    const value = getQueryParam(field);
    if (value) input.value = value;
  });

  const source = getQueryParam('utm_source');
  const nguonLead = document.getElementById('nguon_lead');
  if (nguonLead && source) nguonLead.value = source;

  const utmId = document.getElementById('utm_id');
  if (utmId && !utmId.value) utmId.value = 'null';
}

function initCmsHubspotContactForm() {
  const form = document.getElementById('home-contact-ladipage');
  if (!form) return;

  const phoneInput = document.getElementById('PhoneNumber');
  const alertBox = form.querySelector('.home-contact-alert');
  const submitBtn = document.getElementById('si-btn');

  fillTrackingFields();

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 10);
    });

    phoneInput.addEventListener('paste', function (e) {
      e.preventDefault();
      const pastedText = (e.clipboardData || window.clipboardData).getData('text');
      this.value = pastedText.replace(/[^0-9]/g, '').slice(0, 10);
    });

    phoneInput.addEventListener('keypress', function (e) {
      const char = String.fromCharCode(e.which);
      if (!/[0-9]/.test(char)) e.preventDefault();
    });
  }

  function setAlert(message, type = 'error') {
    if (!alertBox) {
      alert(message);
      return;
    }
    alertBox.textContent = message;
    alertBox.className = `home-contact-alert ${type}`;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    fillTrackingFields();

    const fullNameInput = form.querySelector('input[name="FullName"]');
    const yearBornInput = form.querySelector('input[name="YearBorn"]');
    const phoneInputEl = form.querySelector('input[name="PhoneNumber"]');
    const emailInput = form.querySelector('input[name="Email"]');
    const citySelect = form.querySelector('select[name="thanh_pho"]');
    const programSelect = form.querySelector('select[name="chuong_trinh_quan_tam"]');

    const FullName = fullNameInput.value.trim();
    const YearBorn = yearBornInput.value.trim();
    let PhoneNumber = phoneInputEl.value.trim().replace(/\D/g, '');
    const Email = emailInput.value.trim();
    const thanh_pho = citySelect.value.trim();
    const chuong_trinh_quan_tam = programSelect.value.trim();

    if (FullName === '') {
      setAlert('Họ và Tên là bắt buộc.');
      fullNameInput.focus();
      return;
    }
    if (YearBorn === '') {
      setAlert('Năm sinh là bắt buộc.');
      yearBornInput.focus();
      return;
    }
    if (PhoneNumber === '') {
      setAlert('Số điện thoại là bắt buộc.');
      phoneInputEl.focus();
      return;
    }
    if (PhoneNumber.length !== 10) {
      setAlert('Số điện thoại phải có đúng 10 chữ số.');
      phoneInputEl.focus();
      return;
    }

    const validPrefixes = ['032', '033', '034', '035', '036', '037', '038', '039', '056', '058', '059', '070', '076', '077', '078', '079', '081', '082', '083', '084', '085', '086', '088', '089', '090', '091', '092', '093', '094', '096', '097', '098', '099'];
    const prefix = PhoneNumber.substring(0, 3);
    if (!validPrefixes.includes(prefix)) {
      setAlert('Số điện thoại không hợp lệ. Vui lòng nhập đúng đầu số di động Việt Nam.');
      phoneInputEl.focus();
      return;
    }

    phoneInputEl.value = PhoneNumber;

    if (Email === '') {
      setAlert('Email là bắt buộc.');
      emailInput.focus();
      return;
    }
    if (chuong_trinh_quan_tam === '') {
      setAlert('Chương trình là bắt buộc.');
      programSelect.focus();
      return;
    }
    if (thanh_pho === '') {
      setAlert('Tỉnh thành là bắt buộc.');
      citySelect.focus();
      return;
    }

    const formData = new FormData(form);
    formData.append('action', 'register_sig_contact');

    if (submitBtn) {
      submitBtn.textContent = 'Đang gửi...';
      submitBtn.disabled = true;
    }
    setAlert('Đang gửi thông tin...', 'loading');

    fetch(URL_AJAX, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.status) {
          if (typeof fbq === 'function') {
            fbq('track', 'Lead');
          }
          window.location.href = SITE_URL + '/thank-you';
          window.parent.location.href = SITE_URL + '/thank-you';
        } else {
          setAlert('Error: ' + (data.response || 'Không gửi được thông tin.'));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setAlert('Không gửi được thông tin. Vui lòng thử lại hoặc liên hệ hotline.');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.textContent = 'Gửi đi';
          submitBtn.disabled = false;
        }
      });
  });
}

initCmsHubspotContactForm();

// ===== STICKY CTA =====
const stickyCta = document.getElementById('stickyCta');
function updateStickyCta() {
  if (!stickyCta) return;
  const isMobileCtaRange = window.matchMedia('(max-width: 768px)').matches;
  const shouldShow = isMobileCtaRange && window.scrollY > window.innerHeight * 0.35;
  stickyCta.classList.toggle('is-visible', shouldShow);
}
window.addEventListener('scroll', updateStickyCta, { passive: true });
window.addEventListener('resize', updateStickyCta, { passive: true });
updateStickyCta();

// ===== CLOSE MOBILE MENU ON OUTSIDE CLICK =====
document.addEventListener('click', (e) => {
  const navLinks = document.getElementById('navLinks');
  const toggle = document.getElementById('menuToggle');
  if (navLinks.classList.contains('mobile-open') &&
      !navLinks.contains(e.target) &&
      !toggle.contains(e.target)) {
    navLinks.classList.remove('mobile-open');
    document.body.classList.remove('mobile-menu-open');
  }
});

// ===== HERO PARTICLES (subtle floating dots) =====
(function initParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.5';
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  const particles = [];
  const COUNT = 60;

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.6 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(241, 209, 169, ${p.a})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ===== NAVBAR POSITION INIT (accounts for announce bar) =====
window.addEventListener('load', () => {
  if (announceBar && window.scrollY < 10) {
    navbar.style.top = announceBar.offsetHeight + 'px';
  }
});

// ===== EB-5 CASE PROJECT EXPLORER =====
const EB5_CASE_PROJECTS = [
            {
                id: 1,
                title: "CMB Nhóm 101",
                subtitle: "Phát triển và xây dựng kho bãi công nghiệp / kho vận hạng A, xây theo yêu cầu (Build-to-Suit) phục vụ cho nhà sản xuất ô tô toàn cầu Stellantis.",
                description: "Phát triển và xây dựng kho bãi công nghiệp / kho vận hạng A, xây theo yêu cầu (Build-to-Suit) phục vụ cho nhà sản xuất ô tô toàn cầu Stellantis.",
                regionalCenter: "CMB Regional Centers",
                location: "6850 Denton Road, Thị trấn Van Buren, Quận Wayne, Detroit, Bang Michigan, Hoa Kỳ.",
                teaType: "TEA (Vùng có tỉ lệ thất nghiệp cao 13,28%).",
                investment: "800.000 USD/suất.",
                totalSlots: "99 suất đầu tư (Tổng vốn huy động tối đa 79.200.000 USD).",
                jobsPerInvestor: "23+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "https://drive.google.com/drive/u/0/folders/1mlrvAqyZ03VHcRaHpPgveQDcer9cBx5V",
                imageSrc: "resources/DA1.jpg",
                imageType: "industrial",
                country: "US Hoa Kỳ"
            },
            {
                id: 2,
                title: "CMB Nhóm 102",
                subtitle: "Dự án Hillwood Park 275 bao gồm việc phát triển và xây dựng một cơ sở phân phối hiện đại hạng A xây theo yêu cầu từ tập đoàn phần cứng The Hillman Group.",
                description: "Dự án Hillwood Park 275 bao gồm việc phát triển và xây dựng một cơ sở phân phối hiện đại hạng A xây theo yêu cầu từ tập đoàn phần cứng The Hillman Group.",
                regionalCenter: "CMB Regional Centers",
                location: "550 Forest Fair Drive, Fairfield, Ohio, Hoa Kỳ.",
                teaType: "TEA (Vùng có tỉ lệ thất nghiệp cao đạt 8,406%, vượt mức tối thiểu 6,0% theo quy định).",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "Tối đa 46 suất đầu tư (Tổng vốn vay EB-5 huy động lên tới 36.800.000 USD).",
                jobsPerInvestor: "12+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageSrc: "resources/DA2.jpg",
                imageType: "logistics",
                country: "US Hoa Kỳ"
            },
            {
                id: 3,
                title: "CMB Nhóm 97",
                subtitle: "Phát triển và xây dựng Giai đoạn 1 của dự án logistics công nghiệp tiêu chuẩn hạng A.",
                description: "Phát triển và xây dựng Giai đoạn 1 của dự án logistics công nghiệp tiêu chuẩn hạng A.",
                regionalCenter: "CMB Regional Centers",
                location: "Tọa lạc giữa Old San Antonio Road và Onion Creek, góc Tây Nam giao lộ cao tốc 45 Toll và I-35, phía Tây Nam thành phố Austin, Quận Travis, bang Texas, Hoa Kỳ.",
                teaType: "TEA (Vùng có tỉ lệ thất nghiệp cao đạt 5,4495%, vượt mức tối thiểu 5,4% theo quy định).",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "19 suất đầu tư (Tổng vốn vay EB-5 huy động tối đa là 15.200.000 USD).",
                jobsPerInvestor: "15+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageSrc: "resources/DA3.jpg",
                imageType: "industrial",
                country: "US Hoa Kỳ"
            },
            {
                id: 4,
                title: "CMB Nhóm 96",
                subtitle: "Phát triển và xây dựng một tòa tháp nhà ở sinh viên cao cấp 14 tầng nằm ngoài khuôn viên trường.",
                description: "Phát triển và xây dựng một tòa tháp nhà ở sinh viên cao cấp 14 tầng nằm ngoài khuôn viên trường.",
                regionalCenter: "CMB Regional Centers",
                location: "Giao lộ Đại lộ 13 và Đường Alder, Khu Đại học, liền kề với trường Đại học Oregon, thành phố Eugene, bang Oregon, Hoa Kỳ.",
                teaType: "TEA (Vùng có tỉ lệ thất nghiệp cao lên đến 19,06%, vượt mức tối thiểu 6,0% theo quy định).",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "50 suất đầu tư (Tổng vốn vay EB-5 huy động tối đa là 40.000.000 USD)",
                jobsPerInvestor: "17+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageSrc: "resources/DA4.jpg",
                imageType: "residential",
                country: "US Hoa Kỳ"
            },
            {
                id: 5,
                title: "Trung tâm Logistics Cảng Thái Bình Dương",
                subtitle: "Dự án đầu tư cơ sở hạ tầng mang tính đột phá nhằm xử lý ô nhiễm môi trường, xây dựng hệ thống xử lý chất thải, lắp đặt các tiện ích thiết yếu và công trình đường bộ công cộng để tạo ra quỹ đất sạch, sẵn sàng cho việc xây dựng trung tâm kho bãi/logistics quy mô lớn.",
                description: "Dự án đầu tư cơ sở hạ tầng mang tính đột phá nhằm xử lý ô nhiễm môi trường, xây dựng hệ thống xử lý chất thải, lắp đặt các tiện ích thiết yếu và công trình đường bộ công cộng để tạo ra quỹ đất sạch, sẵn sàng cho việc xây dựng trung tâm kho bãi/logistics quy mô lớn.",
                regionalCenter: "CanAm Enterprises",
                location: "20400 South Main Street, Thành phố Carson, bang California, Hoa Kỳ",
                teaType: "Cơ sở hạ tầng (Dự án Cơ sở hạ tầng EB-5 do cơ quan chính phủ là CRA trực tiếp sở hữu, quản lý và vận hành)",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "225 suất đầu tư (Tổng vốn vay EB-5 huy động tối đa 180.000.000 USD).",
                jobsPerInvestor: "14+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageSrc: "resources/DA5.jpg",
                imageType: "logistics",
                country: "US Hoa Kỳ"
            },
            {
                id: 6,
                title: "Bellwether TerraPower Isotopes",
                subtitle: "Xây dựng cơ sở sản xuất tiên tiến phục vụ lĩnh vực khoa học đời sống.",
                description: "Xây dựng cơ sở sản xuất tiên tiến phục vụ lĩnh vực khoa học đời sống.",
                regionalCenter: "CanAm Enterprises",
                location: "Quận Bellwether, thành phố Philadelphia, bang Pennsylvania, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "138 suất đầu tư (Tổng giá trị khoản vay EB-5 huy động là 110,4 triệu USD).",
                jobsPerInvestor: "13+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageSrc: "resources/DA6.jpg",
                imageType: "industrial",
                country: "US Hoa Kỳ"
            },
            {
                id: 7,
                title: "Ainsley at Tivoli",
                subtitle: "Dự án phát triển cộng đồng căn hộ cao cấp 5 tầng gồm 300 căn tại trung tâm Tivoli Village, Las Vegas, Nevada.",
                description: "Dự án phát triển cộng đồng căn hộ cao cấp 5 tầng gồm 300 căn tại trung tâm Tivoli Village, Las Vegas, Nevada.",
                regionalCenter: "CanAm Enterprises",
                location: "Trung tâm Tivoli Village, Las Vegas, Nevada, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD / suất đầu tư.",
                totalSlots: "50 suất đầu tư (Tổng vốn EB-5: 40.000.000 USD)",
                jobsPerInvestor: "17+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageSrc: "resources/DA7.jpg",
                imageType: "residential",
                country: "US Hoa Kỳ"
            },
            {
                id: 8,
                title: "Arte at the District",
                subtitle: "Dự án khu phức hợp cho thuê hạng A tại Northwood Village, West Palm Beach, Florida. Dự án tích hợp căn hộ, khu mua sắm/tiện ích.",
                description: "Dự án khu phức hợp cho thuê hạng A tại Northwood Village, West Palm Beach, Florida. Dự án tích hợp căn hộ, khu mua sắm/tiện ích.",
                regionalCenter: "Smith Central Atlantic Regional Center",
                location: "2400 Broadway, West Palm Beach, Florida, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD/suất",
                totalSlots: "40 suất đầu tư (Tổng vốn EB-5: 32.000.000 USD)",
                jobsPerInvestor: "38 việc làm/nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageSrc: "resources/DA8.jpg",
                imageType: "commercial",
                country: "US Hoa Kỳ"
            },
            {
                id: 9,
                title: "Madison Bradenton Multifamily",
                subtitle: "Phát triển và xây dựng dự án Madison Bradenton, khu nhà ở đa gia đình, cùng các tiện ích dự kiến gồm clubhouse, trung tâm dịch vụ doanh nghiệp, quầy cà phê, hồ bơi, khu BBQ ngoài trời, khu nhận bưu kiện/thư và công viên thú cưng.",
                description: "Phát triển và xây dựng dự án Madison Bradenton, khu nhà ở đa gia đình, cùng các tiện ích dự kiến gồm clubhouse, trung tâm dịch vụ doanh nghiệp, quầy cà phê, hồ bơi, khu BBQ ngoài trời, khu nhận bưu kiện/thư và công viên thú cưng.",
                regionalCenter: "Peachtree South Regional Center",
                location: "303 301 Boulevard West, Bradenton, Florida, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD/suất",
                totalSlots: "58 suất đầu tư (Tổng vốn huy động tối đa 46.400.000 USD).",
                jobsPerInvestor: "17+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageSrc: "resources/DA9.jpg",
                imageType: "residential",
                country: "US Hoa Kỳ"
            },
            {
                id: 10,
                title: "Utopia Living",
                subtitle: "Dự án căn hộ cao cấp tích hợp các tiện ích hiện đại như bể bơi, phòng tập thể dục, khu vui chơi trẻ em, v.v.",
                description: "Dự án căn hộ cao cấp tích hợp các tiện ích hiện đại như bể bơi, phòng tập thể dục, khu vui chơi trẻ em, v.v.",
                regionalCenter: "Manhattan Regional Center",
                location: "Fresh Meadows, Queens, Thành phố New York, Hoa Kỳ.",
                teaType: "TEA",
                investment: "800.000 USD/suất",
                totalSlots: "328 suất đầu tư (Tổng vốn vay EB-5 khoảng 254.9 triệu USD).",
                jobsPerInvestor: "16+ việc làm / nhà đầu tư",
                status: "Đang mở suất",
                statusKey: "open",
                driveLink: "#contact",
                imageSrc: "resources/DA10.jpg",
                imageType: "residential",
                country: "US Hoa Kỳ"
            }
        ];
let eb5CurrentSelectedIndex = 0;

function eb5EscapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));
}

function eb5GenerateProjectImage(project) {
  const imageSrc = project.imageSrc || `resources/DA${project.id}.jpg`;
  return `
    <figure class="case-blueprint case-project-photo">
      <img src="${eb5EscapeHtml(imageSrc)}" alt="Hình ảnh dự án ${eb5EscapeHtml(project.title)}" loading="lazy">
      <figcaption class="case-blueprint-caption"><strong>Dự án ${String(project.id).padStart(2, '0')}</strong><i>${eb5EscapeHtml(project.title)}</i></figcaption>
    </figure>`;
}

function eb5StatusClass(statusKey) {
  if (statusKey === 'pending') return 'pending';
  if (statusKey === 'closed') return 'closed';
  return 'open';
}

function eb5RenderProjectList() {
  const list = document.getElementById('caseProjectList');
  if (!list) return;
  list.innerHTML = EB5_CASE_PROJECTS.map((proj, index) => `
    <button type="button" class="case-list-item ${index === eb5CurrentSelectedIndex ? 'active' : ''}" onclick="eb5SelectProject(${index})" aria-pressed="${index === eb5CurrentSelectedIndex ? 'true' : 'false'}" data-case-project-index="${index}">
      <span class="case-list-main">
        <span class="case-list-title-row"><span class="case-list-num">${String(index + 1).padStart(2, '0')}</span><span class="case-list-title">${eb5EscapeHtml(proj.title)}</span></span>
        <span class="case-list-sub">${eb5EscapeHtml(proj.subtitle)}</span>
      </span>
      <span class="case-list-meta"><span class="case-status ${eb5StatusClass(proj.statusKey)}">${eb5EscapeHtml(proj.status)}</span><span class="case-list-invest">${eb5EscapeHtml(String(proj.investment).split('/')[0])}</span></span>
    </button>`).join('');
}

function eb5SelectProject(index, options = {}) {
  const shouldScrollList = options.scrollList !== false;
  const shouldScrollPane = options.scrollPane !== false;
  eb5CurrentSelectedIndex = ((index % EB5_CASE_PROJECTS.length) + EB5_CASE_PROJECTS.length) % EB5_CASE_PROJECTS.length;
  eb5RenderProjectList();
  const activeCard = document.querySelector(`[data-case-project-index="${eb5CurrentSelectedIndex}"]`);
  if (shouldScrollList) activeCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  const detail = document.getElementById('caseDetailView');
  const pane = document.getElementById('caseDetailPane');
  if (!detail) return;
  const proj = EB5_CASE_PROJECTS[eb5CurrentSelectedIndex];
  detail.classList.remove('fade-in-active');
  void detail.offsetWidth;
  detail.classList.add('fade-in-active');
  detail.innerHTML = `
    <div class="case-detail-grid">
      ${eb5GenerateProjectImage(proj)}
      <div class="case-detail-content">
        <div>
          <div class="case-badge-row"><span class="case-country">${eb5EscapeHtml(proj.country)}</span><span class="case-status ${eb5StatusClass(proj.statusKey)}">${eb5EscapeHtml(proj.status)}</span></div>
          <h3 class="case-detail-title">${eb5EscapeHtml(proj.title)}</h3>
          <p class="case-detail-desc">${eb5EscapeHtml(proj.description)}</p>
        </div>
        <div class="case-spec-grid">
          <div class="case-spec"><small>Vị Trí</small><span class="case-spec-value" title="${eb5EscapeHtml(proj.location)}">${eb5EscapeHtml(proj.location)}</span></div>
          <div class="case-spec"><small>Loại Vùng</small><span class="case-spec-value gold">${eb5EscapeHtml(proj.teaType)}</span></div>
          <div class="case-spec"><small>Mức Đầu Tư</small><span class="case-spec-value gold">${eb5EscapeHtml(proj.investment)}</span></div>
          <div class="case-spec"><small>Trung Tâm Vùng</small><span class="case-spec-value">${eb5EscapeHtml(proj.regionalCenter)}</span></div>
          <div class="case-spec"><small>Việc Làm Tạo Ra</small><span class="case-spec-value green">${eb5EscapeHtml(proj.jobsPerInvestor)}</span></div>
          <div class="case-spec"><small>Quy Mô EB-5</small><span class="case-spec-value" title="${eb5EscapeHtml(proj.totalSlots)}">${eb5EscapeHtml(proj.totalSlots)}</span></div>
        </div>
        <div class="case-actions">
          <a class="case-consult-link" href="#contact" data-project-consult="${eb5EscapeHtml(proj.title)}">Nhận tư vấn chọn dự án phù hợp</a>
        </div>
      </div>
    </div>`;
  if (shouldScrollPane && window.innerWidth < 1080 && pane) pane.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


function eb5MoveProject(direction) {
  eb5SelectProject(eb5CurrentSelectedIndex + direction);
}

function eb5InitCaseExplorer() {
  if (!document.getElementById('caseProjectList') || !document.getElementById('caseDetailView')) return;
  eb5RenderProjectList();
  eb5SelectProject(0, { scrollList: false, scrollPane: false });
  document.getElementById('caseProjectPrev')?.addEventListener('click', () => eb5MoveProject(-1));
  document.getElementById('caseProjectNext')?.addEventListener('click', () => eb5MoveProject(1));
}

document.addEventListener('DOMContentLoaded', eb5InitCaseExplorer);
if (document.readyState !== 'loading') eb5InitCaseExplorer();

