        // ===========================================
        // تهيئة العناصر والمتغيرات الرئيسية
        // ===========================================
        const menuToggle = document.getElementById('menuToggle');
        const editToggle = document.getElementById('editToggle');
        const leftbar = document.getElementById('leftbar');
        const sidebarContent = document.getElementById('sidebarContent');
        const searchInput = document.getElementById('searchInput');
        const bgModal = document.getElementById('bgModal');
        const closeModalBtn = document.getElementById('closeModal');
        const changeBgBtn = document.getElementById('changeBgBtn');
        const bgImageGrid = document.getElementById('bgImageGrid');
        const uploadImageInput = document.getElementById('uploadImage');
        const appleBar = document.querySelector('.apple-bar');

        // ===========================================
        // صور الخلفية الافتراضية
        // ===========================================
        const defaultBgImages = [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            "https://images.unsplash.com/photo-1542272201-b1ca555ef850?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
        ];

        // ===========================================
        // تهيئة التطبيق
        // ===========================================
        function initApp() {
            // استعادة الخلفية المحفوظة
            loadSavedBackground();
            
            // إنشاء شبكة صور الخلفية
            createBackgroundImagesGrid();
            
            // إعداد المستمعين للأحداث
            setupEventListeners();
            
            // إضافة تأثير التمرير للشريط العلوي
            setupScrollEffect();
        }

        // ===========================================
        // إنشاء شبكة صور الخلفية
        // ===========================================
        function createBackgroundImagesGrid() {
            bgImageGrid.innerHTML = '';
            
            defaultBgImages.forEach((imageUrl, index) => {
                const imageItem = document.createElement('div');
                imageItem.className = 'bg-image-item';
                imageItem.style.backgroundImage = `url(${imageUrl})`;
                imageItem.style.backgroundSize = 'cover';
                imageItem.style.backgroundPosition = 'center';
                
                imageItem.addEventListener('click', () => {
                    // إزالة الفئة النشطة من جميع العناصر
                    document.querySelectorAll('.bg-image-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    
                    // إضافة الفئة النشطة للعنصر المحدد
                    imageItem.classList.add('active');
                    
                    // تغيير خلفية الموقع
                    changeBackground(imageUrl);
                    
                    // إغلاق النافذة تلقائياً بعد اختيار الصورة
                    setTimeout(() => {
                        closeModal();
                    }, 500);
                });
                
                bgImageGrid.appendChild(imageItem);
            });
        }

        // ===========================================
        // إعداد المستمعين للأحداث
        // ===========================================
        function setupEventListeners() {
            // فتح وإغلاق القائمة الجانبية
            menuToggle.addEventListener('click', openSidebar);
            
            // إغلاق القائمة الجانبية عند النقر خارجها
            leftbar.addEventListener('click', (e) => {
                if (e.target === leftbar) {
                    closeSidebar();
                }
            });
            
            // فتح نافذة تغيير الخلفية
            editToggle.addEventListener('click', openModal);
            changeBgBtn.addEventListener('click', openModal);
            
            // إغلاق نافذة تغيير الخلفية
            closeModalBtn.addEventListener('click', closeModal);
            
            // إغلاق نافذة تغيير الخلفية عند النقر خارجها
            bgModal.addEventListener('click', (e) => {
                if (e.target === bgModal) {
                    closeModal();
                }
            });
            
            // إغلاق الشريط الجانبي عند النقر على أي زر داخله
            document.querySelectorAll('.leftbar-content button').forEach(button => {
                button.addEventListener('click', () => {
                    closeSidebar();
                });
            });
            
            // البحث عند الضغط على Enter
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });

            // رفع صورة خلفية
            uploadImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        changeBackground(event.target.result);
                        closeModal();
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // الأزرار الجديدة
            document.getElementById('newwindow').addEventListener('click', () => {
                window.open(window.location.href, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            });
            
            document.getElementById('akhbar').addEventListener('click', () => {
                window.open('https://www.aljazeera.net/news/', '_blank');
            });
            
            document.getElementById('ta9s').addEventListener('click', () => {
                window.open('https://ar.dzmeteo.com/', '_blank');
            });
            
            document.getElementById('baht').addEventListener('click', () => {
                window.open('https://trends.google.com/trends/?hl=ar', '_blank');
            });
            
            document.getElementById('trend').addEventListener('click', () => {
                window.open('https://trends.google.com.eg/trending?geo=DZ', '_blank');
            });
        }

        // ===========================================
        // تأثير التمرير للشريط العلوي
        // ===========================================
        function setupScrollEffect() {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    appleBar.classList.add('scrolled');
                } else {
                    appleBar.classList.remove('scrolled');
                }
            });
        }

        // ===========================================
        // وظيفة لفتح القائمة الجانبية
        // ===========================================
        function openSidebar() {
            leftbar.classList.add('is-open');
        }

        // ===========================================
        // وظيفة لإغلاق القائمة الجانبية
        // ===========================================
        function closeSidebar() {
            leftbar.classList.remove('is-open');
        }

        // ===========================================
        // وظيفة لفتح نافذة تغيير الخلفية
        // ===========================================
        function openModal() {
            bgModal.classList.add('is-open');
        }

        // ===========================================
        // وظيفة لإغلاق نافذة تغيير الخلفية
        // ===========================================
        function closeModal() {
            bgModal.classList.remove('is-open');
        }

        // ===========================================
        // تغيير خلفية الموقع وحفظها
        // ===========================================
        function changeBackground(imageUrl) {
            document.body.style.backgroundImage = `url(${imageUrl})`;
            
            // حفظ الخلفية في localStorage
            localStorage.setItem('savedBackground', imageUrl);
        }

        // ===========================================
        // استعادة الخلفية المحفوظة
        // ===========================================
        function loadSavedBackground() {
            const savedBackground = localStorage.getItem('savedBackground');
            if (savedBackground) {
                document.body.style.backgroundImage = `url(${savedBackground})`;
            }
        }

        // ===========================================
        // تنفيذ البحث
        // ===========================================
        function performSearch() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // توجيه البحث إلى جوجل
                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`, '_blank');
            }
        }

        // ===========================================
        // تهيئة التطبيق عند تحميل الصفحة
        // ===========================================
        document.addEventListener('DOMContentLoaded', initApp);

//=========internet==========//

        let noNet = document.getElementById("nointernet");
let yesNet = document.getElementById("yesinternet");

function showBanner(el) {
    el.classList.add("show");
    setTimeout(() => {
        el.classList.remove("show");
    }, 3000);
}

window.addEventListener("offline", () => {
    showBanner(noNet);
});

window.addEventListener("online", () => {
    showBanner(yesNet);
});



document.getElementById("safesrach").addEventListener("click", () => {
    // فتح الصفحة الجديدة في تبويب جديد
    window.open("/safesearch/seafesarch.html", "_blank");
});


//======seattng//

document.addEventListener("DOMContentLoaded", () => {
    const settings = document.getElementById("seattng");
    const closeBtn = document.getElementById("closeSettings");
    const searchInput = document.getElementById("settingsSearch");
    const items = document.querySelectorAll(".item");

    // اظهار الإعدادات
    window.showSettings = function() {
        settings.style.display = "block";
        document.body.style.overflow = "hidden";
        history.pushState({settingsOpen: true}, "");
    }

    // إخفاء الإعدادات
    function hideSettings() {
        settings.style.display = "none";
        document.body.style.overflow = "auto";
    }

    // زر الرجوع في المتصفح
    window.onpopstate = function(event) {
        if(settings.style.display === "block") {
            hideSettings();
        }
    };

    // زر الرجوع داخل اللافتة
    closeBtn.addEventListener("click", hideSettings);

    // البحث داخل الإعدادات
    searchInput.addEventListener("input", () => {
        let value = searchInput.value.toLowerCase();
        items.forEach(item => {
            let name = item.dataset.name.toLowerCase();
            item.style.display = name.includes(value) ? "flex" : "none";
        });
    });
});
