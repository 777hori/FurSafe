document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0.5 UNIVERSAL STRICT VALIDATION ENGINE
    // ==========================================
    document.addEventListener('input', (e) => {
        if (!e.target || !e.target.tagName) return;
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') return;

        if (e.target.classList.contains('no-digits') || e.target.classList.contains('letters-only')) {
            let val = e.target.value.replace(/[^a-zA-Z\s\-ñÑ]/g, '');
            val = val.replace(/  +/g, ' ');
            if (e.target.value !== val) e.target.value = val;
        }
        if (e.target.classList.contains('only-numbers') || e.target.classList.contains('numbers-only')) {
            let val = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value !== val) e.target.value = val;
        }
        if (e.target.classList.contains('no-symbols')) {
            let val = e.target.value.replace(/[^a-zA-Z0-9\s\-ñÑ]/g, '');
            if (e.target.value !== val) e.target.value = val;
        }
    });    // ==========================================
    // 0. SUPABASE CONFIGURATION
    // ==========================================
    const SUPABASE_URL = 'https://hfpibrfnbdohfjgengim.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcGlicmZuYmRvaGZqZ2VuZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTQzNzksImV4cCI6MjA5NzE3MDM3OX0.CiaPTLaVK1HbTUafQdkW-mBV9GTqAOGohGzb-u-56nk';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ==========================================
    // 1. SESSION MANAGEMENT (DATABASE-DRIVEN)
    // ==========================================
    const adminSessionStr = localStorage.getItem('fursafe_admin');
    if (!adminSessionStr) {
        window.location.href = 'index.html';
        return;
    }

    let adminUser = JSON.parse(adminSessionStr);

    // Fetch the REAL admin data from the database to ensure we always show the correct info
    async function refreshAdminSession() {
        try {
            const { data, error } = await supabase
                .from('admin_accounts')
                .select('*')
                .eq('admin_login_id', adminUser.admin_login_id)
                .single();

            if (error || !data) {
                console.error('[FurSafe Admin] Failed to refresh admin session:', error);
                return;
            }

            // Update adminUser with real DB data
            adminUser.id = data.id;  // <-- store the UUID so audit logs work
            adminUser.name = data.name;
            adminUser.role = data.role;
            adminUser.barangay = data.barangay;
            adminUser.avatar_url = data.avatar_url || null;

            // Persist updated session
            localStorage.setItem('fursafe_admin', JSON.stringify(adminUser));

            // Update sidebar UI
            updateSidebarProfile();
        } catch (e) {
            console.error('[FurSafe Admin] Session refresh error:', e);
        }
    }

    function updateSidebarProfile() {
        const nameEl = document.getElementById('sidebarAdminName');
        const avatarEl = document.getElementById('sidebarAvatar');

        if (nameEl) nameEl.textContent = adminUser.name || 'Admin';

        if (avatarEl) {
            if (adminUser.avatar_url) {
                avatarEl.innerHTML = '<img src="' + adminUser.avatar_url + '" alt="Admin Avatar">';
            } else {
                avatarEl.innerHTML = '';
            }
        }
    }

    // Initial sidebar render
    updateSidebarProfile();
    // Refresh from DB
    refreshAdminSession();

    // Logout logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('fursafe_admin');
            window.location.href = 'index.html';
        });
    }


    // ==========================================
    // 2. ADMIN PROFILE EDITING
    // ==========================================
    const adminProfileArea = document.getElementById('adminProfileArea');
    const profileEditModal = document.getElementById('profileEditModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const cancelProfileEdit = document.getElementById('cancelProfileEdit');
    const saveProfileEdit = document.getElementById('saveProfileEdit');
    const profileEditName = document.getElementById('profileEditName');
    const profileEditAvatar = document.getElementById('profileEditAvatar');
    const avatarFileInput = document.getElementById('avatarFileInput');

    let pendingAvatarFile = null;

    if (adminProfileArea) {
        adminProfileArea.addEventListener('click', () => {
            // Populate modal with current data
            if (profileEditName) profileEditName.value = adminUser.name || '';
            if (profileEditAvatar) {
                if (adminUser.avatar_url) {
                    profileEditAvatar.innerHTML = '<img src="' + adminUser.avatar_url + '" alt="Avatar">';
                } else {
                    profileEditAvatar.innerHTML = '<i class="fa-solid fa-user" style="font-size:2rem; color:#999;"></i>';
                }
            }
            pendingAvatarFile = null;
            profileEditModal.classList.add('active');
        });
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', () => profileEditModal.classList.remove('active'));
    }
    if (cancelProfileEdit) {
        cancelProfileEdit.addEventListener('click', () => profileEditModal.classList.remove('active'));
    }

    // Avatar file preview
    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }

            pendingAvatarFile = file;
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (profileEditAvatar) {
                    profileEditAvatar.innerHTML = '<img src="' + ev.target.result + '" alt="Preview">';
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Save profile
    if (saveProfileEdit) {
        saveProfileEdit.addEventListener('click', async () => {
            const newName = profileEditName ? profileEditName.value.trim() : '';

            if (!newName) {
                alert('Display name cannot be empty.');
                return;
            }

            saveProfileEdit.disabled = true;
            saveProfileEdit.textContent = 'Saving...';

            try {
                let avatarUrl = adminUser.avatar_url || null;

                // Upload avatar if a new file is selected
                if (pendingAvatarFile) {
                    const fileExt = pendingAvatarFile.name.split('.').pop();
                    const fileName = 'admin-avatar-' + adminUser.admin_login_id + '-' + Date.now() + '.' + fileExt;

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('pet-photos')
                        .upload(fileName, pendingAvatarFile, {
                            cacheControl: '3600',
                            upsert: true
                        });

                    if (uploadError) {
                        console.error('[FurSafe Admin] Avatar upload error:', uploadError);
                        alert('Failed to upload avatar. Your name will still be updated.');
                    } else {
                        const { data: publicUrl } = supabase.storage
                            .from('pet-photos')
                            .getPublicUrl(fileName);
                        avatarUrl = publicUrl.publicUrl;
                    }
                }

                // Update admin_accounts in database
                const { error: updateError } = await supabase
                    .from('admin_accounts')
                    .update({ name: newName, avatar_url: avatarUrl })
                    .eq('admin_login_id', adminUser.admin_login_id);

                if (updateError) {
                    console.error('[FurSafe Admin] Profile update error:', updateError);
                    alert('Failed to save profile changes.');
                } else {
                    // Update local state
                    adminUser.name = newName;
                    adminUser.avatar_url = avatarUrl;
                    localStorage.setItem('fursafe_admin', JSON.stringify(adminUser));
                    updateSidebarProfile();
                    profileEditModal.classList.remove('active');
                }
            } catch (e) {
                console.error('[FurSafe Admin] Profile save error:', e);
                alert('An unexpected error occurred.');
            } finally {
                saveProfileEdit.disabled = false;
                saveProfileEdit.textContent = 'Save Changes';
            }
        });
    }


    // ==========================================
    // 3. SPA ROUTING
    // ==========================================
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const views = document.querySelectorAll('.admin-view');
    const headerText = document.getElementById('headerText');
    const headerIcon = document.getElementById('headerIcon');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            views.forEach(view => view.classList.remove('active'));
            const target = item.getAttribute('data-target');
            document.getElementById('view-' + target).classList.add('active');
            headerText.textContent = item.textContent.trim();
            headerIcon.className = item.querySelector('i').className;
            loadViewData(target);
        });
    });


    // ==========================================
    // 4. DATA CACHE & HELPERS
    // ==========================================
    let cachedPets = [];
    let cachedProfiles = [];

    async function loadViewData(target) {
        switch(target) {
            case 'dashboard': await loadDashboardData(); break;
            case 'pet-registration': await loadPetRegistration(); break;
            case 'pet-owners': await loadPetOwners(); break;
            case 'announcements': await loadAnnouncements(); break;
            case 'reported-posts': await loadReportedPosts(); break;
            case 'reports': await loadReportsView(); break;
        }
    }

    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return diffMin + 'm ago';
        if (diffHour < 24) return diffHour + 'h ago';
        if (diffDay === 1) return 'Yesterday';
        return diffDay + 'd ago';
    }

    function humanDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function getStatusBadge(pet) {
        const status = pet.vaccination_status;
        if (status === 'Approved') return '<span class="badge approval">Approved</span>';
        if (status === 'Rejected') return '<span class="badge rejected">Rejected</span>';
        return '<span class="badge pending">Pending</span>';
    }

    function getVacBadge(pet) {
        if (pet.vaccination_status === 'Vaccinated' || pet.vaccine_rabies || pet.vaccine_distemper || pet.vaccine_parvovirus) {
            return '<span class="badge vaccinated">Vaccinated</span>';
        }
        return '<span class="badge not-yet">Not yet</span>';
    }

    function isVaccinated(pet) {
        return pet.vaccination_status === 'Vaccinated' || pet.vaccine_rabies || pet.vaccine_distemper || pet.vaccine_parvovirus;
    }

    function getPetPhotoHTML(pet, size) {
        const s = size || 40;
        if (pet.photo_url) {
            return '<div class="pet-avatar" style="width:' + s + 'px;height:' + s + 'px;"><img src="' + pet.photo_url + '" alt="' + pet.pet_name + '"></div>';
        }
        return '<div class="pet-avatar" style="width:' + s + 'px;height:' + s + 'px;"></div>';
    }


    // ==========================================
    // 5. FETCH ALL PETS & PROFILES (shared)
    // ==========================================
    async function fetchAllPets() {
        const { data: pets, error } = await supabase
            .from('pets')
            .select('*, profiles(first_name, last_name, email, brgy_id)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[FurSafe Admin] Error fetching pets:', error);
            return [];
        }
        cachedPets = pets || [];
        return cachedPets;
    }


    // ==========================================
    // 6. DASHBOARD VIEW
    // ==========================================
    async function loadDashboardData() {
        try {
            if (cachedPets.length === 0) await fetchAllPets();

            const { data: reports } = await supabase.from('reports').select('id');

            const totalPets = cachedPets.length;
            const vacPets = cachedPets.filter(p => isVaccinated(p)).length;
            const pendingPets = cachedPets.filter(p => p.vaccination_status !== 'Approved' && p.vaccination_status !== 'Rejected').length;
            const reportCount = reports ? reports.length : 0;
            const vacPercent = totalPets === 0 ? 0 : Math.round((vacPets / totalPets) * 100);
            const thisMonth = cachedPets.filter(p => {
                const d = new Date(p.created_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length;

            document.getElementById('dashTotalPets').textContent = totalPets;
            document.getElementById('dashTotalPetsSub').textContent = '+' + thisMonth + ' this month';
            document.getElementById('dashVacPets').textContent = vacPets;
            document.getElementById('dashVacPetsSub').textContent = vacPercent + '% of total';
            document.getElementById('dashPendingPets').textContent = pendingPets;
            document.getElementById('dashReportedPosts').textContent = reportCount;

            // Recent pets
            const recentPetsList = document.getElementById('dashRecentPets');
            if (recentPetsList) {
                recentPetsList.innerHTML = '';
                cachedPets.slice(0, 4).forEach(pet => {
                    const ownerName = pet.profiles ? pet.profiles.first_name + ' ' + pet.profiles.last_name : 'Unknown';
                    const statusBadge = getStatusBadge(pet);
                    recentPetsList.innerHTML += '<div class="recent-pet-item">' +
                        '<div class="recent-pet-left">' +
                        getPetPhotoHTML(pet) +
                        '<div class="pet-name-owner"><strong>' + pet.pet_name + '</strong>' +
                        '<span>' + pet.species + ' | ' + ownerName + '</span></div></div>' +
                        statusBadge + '</div>';
                });
            }

            // Recent activities from admin_logs or generated from data
            const eventLogs = document.getElementById('dashEventLogs');
            if (eventLogs) {
                const { data: logs } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(4);
                if (logs && logs.length > 0) {
                    eventLogs.innerHTML = '';
                  logs.forEach(log => {
    const dotClass = log.action === 'approve' ? 'dot-green' : (log.action === 'delete' ? 'dot-red' : 'dot-yellow');
    const actionText = log.notes || log.description || log.message || log.action || 'Activity logged';
    eventLogs.innerHTML += '<div class="event-log-item"><div><span class="event-log-dot ' + dotClass + '"></span> ' + actionText + '</div><div class="event-log-time">' + timeAgo(log.created_at) + '</div></div>';
});
                } else {
                    // Show recent pet registrations as activity if no logs
                    eventLogs.innerHTML = '';
                    cachedPets.slice(0, 4).forEach(pet => {
                        const ownerName = pet.profiles ? pet.profiles.first_name + ' ' + pet.profiles.last_name : 'Unknown';
                        eventLogs.innerHTML += '<div class="event-log-item"><div><span class="event-log-dot dot-green"></span> Registered pet: ' + pet.pet_name + ' (' + pet.species + ') by ' + ownerName + '</div><div class="event-log-time">' + timeAgo(pet.created_at) + '</div></div>';
                    });
                }
            }

            renderDonutChart(cachedPets);
            renderMonthlyChart(cachedPets);

        } catch (error) {
            console.error('[FurSafe Admin] Dashboard load error:', error);
        }
    }

    let donutChartInstance = null;
    function renderDonutChart(pets) {
        const dogs = pets.filter(p => p.species === 'Dog').length;
        const cats = pets.filter(p => p.species === 'Cat').length;
        const others = pets.filter(p => p.species !== 'Dog' && p.species !== 'Cat').length;
        const total = pets.length || 1;

        const dogPct = Math.round((dogs/total)*100);
        const catPct = Math.round((cats/total)*100);
        const othPct = Math.round((others/total)*100);

        const legend = document.getElementById('dashBreakdownLegend');
        if (legend) {
            legend.innerHTML =
                '<div class="legend-item"><div class="legend-color" style="background:#f39c12"></div> Dogs  ' + dogPct + '%</div>' +
                '<div class="legend-item"><div class="legend-color" style="background:#e74c3c"></div> Cats  ' + catPct + '%</div>' +
                '<div class="legend-item"><div class="legend-color" style="background:#3498db"></div> Others  ' + othPct + '%</div>';
        }

        const ctx = document.getElementById('petTypeDonutChart');
        if (!ctx) return;
        if (donutChartInstance) donutChartInstance.destroy();

        donutChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Dogs', 'Cats', 'Others'],
                datasets: [{
                    data: [dogs, cats, others],
                    backgroundColor: ['#f39c12', '#f8bdc4', '#3498db'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { display: false } }
            }
        });
    }

    let monthlyChartInstance = null;
    function renderMonthlyChart(pets) {
        const ctx = document.getElementById('monthlyRegistrationChart');
        if (!ctx) return;
        if (monthlyChartInstance) monthlyChartInstance.destroy();

        // Group by month (last 6 months)
        const months = [];
        const counts = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = d.toLocaleString('default', { month: 'short' });
            months.push(monthName);
            const count = pets.filter(p => {
                const pd = new Date(p.created_at);
                return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
            }).length;
            counts.push(count);
        }

        monthlyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Registrations',
                    data: counts,
                    backgroundColor: '#f2a640',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }


    // ==========================================
    // 7. PET REGISTRATION VIEW
    // ==========================================
    const petRegTableBody = document.getElementById('petRegistrationTableBody');
    const petSearch = document.getElementById('petSearch');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'All';

    async function loadPetRegistration() {
        if (cachedPets.length === 0) await fetchAllPets();
        renderPetTable();
    }

    function renderPetTable() {
        if (!petRegTableBody) return;
        petRegTableBody.innerHTML = '';

        const searchTerm = petSearch ? petSearch.value.toLowerCase() : '';

        let filtered = cachedPets.filter(p => {
            const petName = (p.pet_name || '').toLowerCase();
            const ownerName = p.profiles ? (p.profiles.first_name + ' ' + p.profiles.last_name).toLowerCase() : '';
            return petName.includes(searchTerm) || ownerName.includes(searchTerm);
        });

        if (currentFilter !== 'All') {
            const filterMap = { 'Pending': 'Pending', 'Approval': 'Approved', 'Rejected': 'Rejected' };
            const targetStatus = filterMap[currentFilter];
            filtered = filtered.filter(p => {
                if (currentFilter === 'Pending') {
                    return p.vaccination_status !== 'Approved' && p.vaccination_status !== 'Rejected';
                }
                return p.vaccination_status === targetStatus;
            });
        }

        filtered.forEach((pet, index) => {
            const ownerName = pet.profiles ? pet.profiles.first_name + ' ' + pet.profiles.last_name : 'Unknown';
            const statusBadge = getStatusBadge(pet);
            const vacBadge = getVacBadge(pet);

            petRegTableBody.innerHTML += '<tr>' +
                '<td>' + (index + 1) + '</td>' +
                '<td><div style="display:flex; align-items:center; gap:10px;">' +
                getPetPhotoHTML(pet) +
                '<div><strong>' + pet.pet_name + '</strong><br><span style="font-size:0.8rem; color:var(--text-light);">' + ownerName + '</span></div></div></td>' +
                '<td>' + pet.species + '</td>' +
                '<td>' + statusBadge + '</td>' +
                '<td>' + vacBadge + '</td>' +
                '<td><button class="btn-view" data-pet-id="' + pet.id + '">View</button></td>' +
                '</tr>';
        });

        // Attach click handlers to View buttons
        document.querySelectorAll('.btn-view[data-pet-id]').forEach(btn => {
            btn.addEventListener('click', () => openPetModal(btn.getAttribute('data-pet-id')));
        });
    }

    if (petSearch) {
        petSearch.addEventListener('input', renderPetTable);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderPetTable();
        });
    });


    // ==========================================
    // 8. PET VIEW MODAL
    // ==========================================
    const petViewModal = document.getElementById('petViewModal');
    const closePetModal = document.getElementById('closePetModal');

    if (closePetModal) {
        closePetModal.addEventListener('click', () => petViewModal.classList.remove('active'));
    }

    // Close modals when clicking overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });

    let currentViewingPetId = null;

    function openPetModal(petId) {
        const pet = cachedPets.find(p => p.id === petId);
        if (!pet) return;

        currentViewingPetId = petId;

        // Photo
        const photoEl = document.getElementById('modalPetPhoto');
        if (photoEl) {
            if (pet.photo_url) {
                photoEl.innerHTML = '<img src="' + pet.photo_url + '" alt="' + pet.pet_name + '">';
            } else {
                photoEl.innerHTML = '<i class="fa-solid fa-paw" style="font-size:3rem; color:var(--primary);"></i>';
            }
        }

        // Basic info
        document.getElementById('modalPetName').textContent = pet.pet_name;
        document.getElementById('modalPetBreed').textContent = pet.breed + ' - ' + pet.species;

        // Status badges
        const statusEl = document.getElementById('modalPetStatus');
        const vacEl = document.getElementById('modalPetVac');
        if (pet.vaccination_status === 'Approved') {
            statusEl.className = 'badge approval'; statusEl.textContent = 'Approved';
        } else if (pet.vaccination_status === 'Rejected') {
            statusEl.className = 'badge rejected'; statusEl.textContent = 'Rejected';
        } else {
            statusEl.className = 'badge pending'; statusEl.textContent = 'Pending';
        }

        if (isVaccinated(pet)) {
            vacEl.className = 'badge vaccinated'; vacEl.textContent = 'Vaccinated';
        } else {
            vacEl.className = 'badge not-yet'; vacEl.textContent = 'Not yet';
        }

        // Detail grid
        const ownerName = pet.profiles ? pet.profiles.first_name + ' ' + pet.profiles.last_name : 'Unknown';
        const ownerEmail = pet.profiles ? pet.profiles.email : '--';

        document.getElementById('modalPetSpecies').textContent = pet.species || '--';
        document.getElementById('modalPetBreedDetail').textContent = pet.breed || '--';
        document.getElementById('modalPetAge').textContent = pet.age ? pet.age + ' year(s)' : '--';
        document.getElementById('modalPetWeight').textContent = pet.weight ? pet.weight + ' kg' : '--';
        document.getElementById('modalPetSex').textContent = pet.sex || '--';
        document.getElementById('modalPetColor').textContent = pet.color_markings || '--';
        document.getElementById('modalPetNeutered').textContent = pet.neutered ? 'Yes' : 'No';
        document.getElementById('modalPetOwner').textContent = ownerName;
        document.getElementById('modalPetOwnerEmail').textContent = ownerEmail;
        document.getElementById('modalPetOwnerContact').textContent = pet.owner_contact || '--';
        document.getElementById('modalPetOwnerAddress').textContent = pet.owner_address || '--';
        document.getElementById('modalPetRegistered').textContent = humanDate(pet.created_at);

        // Vaccine grid
        const vaccineGrid = document.getElementById('modalVaccineGrid');
        if (vaccineGrid) {
            const vaccines = [
                { name: 'Rabies', val: pet.vaccine_rabies },
                { name: 'Distemper', val: pet.vaccine_distemper },
                { name: 'Parvovirus', val: pet.vaccine_parvovirus },
                { name: 'Bordetella', val: pet.vaccine_bordetella },
                { name: 'Leptospira', val: pet.vaccine_leptospira },
                { name: 'Hepatitis', val: pet.vaccine_hepatitis }
            ];
            vaccineGrid.innerHTML = '';
            vaccines.forEach(v => {
                const icon = v.val ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-xmark"></i>';
                vaccineGrid.innerHTML += '<div class="vaccine-item">' + icon + ' ' + v.name + '</div>';
            });
        }

        petViewModal.classList.add('active');
    }

    // Approve / Reject buttons in modal
    const modalApproveBtn = document.getElementById('modalApproveBtn');
    const modalRejectBtn = document.getElementById('modalRejectBtn');

    if (modalApproveBtn) {
        modalApproveBtn.addEventListener('click', async () => {
            if (!currentViewingPetId) return;
            modalApproveBtn.disabled = true;
            try {
                const { error } = await supabase.from('pets').update({ vaccination_status: 'Approved' }).eq('id', currentViewingPetId);
                if (error) throw error;
                // Refresh cache
                await fetchAllPets();
                renderPetTable();
                petViewModal.classList.remove('active');
            } catch (e) {
                console.error('[FurSafe Admin] Approve error:', e);
                alert('Failed to approve pet.');
            } finally {
                modalApproveBtn.disabled = false;
            }
        });
    }

    if (modalRejectBtn) {
        modalRejectBtn.addEventListener('click', async () => {
            if (!currentViewingPetId) return;
            modalRejectBtn.disabled = true;
            try {
                const { error } = await supabase.from('pets').update({ vaccination_status: 'Rejected' }).eq('id', currentViewingPetId);
                if (error) throw error;
                await fetchAllPets();
                renderPetTable();
                petViewModal.classList.remove('active');
            } catch (e) {
                console.error('[FurSafe Admin] Reject error:', e);
                alert('Failed to reject pet.');
            } finally {
                modalRejectBtn.disabled = false;
            }
        });
    }


    // ==========================================
    // 9. PET OWNERS VIEW
    // ==========================================
    async function loadPetOwners() {
        const petOwnersList = document.getElementById('petOwnersList');
        if (!petOwnersList) return;

        petOwnersList.innerHTML = '<p style="padding:20px;">Loading...</p>';

        try {
            if (cachedPets.length === 0) await fetchAllPets();

            const ownersMap = {};
            cachedPets.forEach(pet => {
                const ownerId = pet.owner_id;
                if (!ownersMap[ownerId]) {
                    ownersMap[ownerId] = {
                        name: pet.profiles ? pet.profiles.first_name + ' ' + pet.profiles.last_name : 'Unknown',
                        brgy_id: pet.profiles ? pet.profiles.brgy_id : 'Unknown',
                        petCount: 0,
                        hasApproved: false,
                        hasPending: false
                    };
                }
                ownersMap[ownerId].petCount++;
                if (pet.vaccination_status === 'Approved') ownersMap[ownerId].hasApproved = true;
                if (pet.vaccination_status !== 'Approved' && pet.vaccination_status !== 'Rejected') ownersMap[ownerId].hasPending = true;
            });

            petOwnersList.innerHTML = '';
            Object.values(ownersMap).forEach(owner => {
                const pText = owner.petCount === 1 ? '1 pet registered' : owner.petCount + ' pets registered';
                petOwnersList.innerHTML += '<div class="pet-owner-item">' +
                    '<div class="recent-pet-left">' +
                    '<div class="pet-avatar" style="background-color:#eee; border:none;"></div>' +
                    '<div class="pet-name-owner"><strong>' + owner.name + '</strong>' +
                    '<span>' + owner.brgy_id + ' · ' + pText + '</span></div></div>' +
                    '<span class="badge approval">Registered</span></div>';
            });

            if (Object.keys(ownersMap).length === 0) {
                petOwnersList.innerHTML = '<p style="padding:20px;">No pet owners found.</p>';
            }

        } catch(e) {
            console.error('[FurSafe Admin] Error loading owners:', e);
        }
    }


    // ==========================================
    // 10. ANNOUNCEMENTS VIEW
    // ==========================================
    const createAnnouncementBtn = document.getElementById('createAnnouncementBtn');
    const createAnnouncementForm = document.getElementById('createAnnouncementForm');
    const cancelAnnBtn = document.getElementById('cancelAnnBtn');
    const postAnnBtn = document.getElementById('postAnnBtn');
    const annTitleInput = document.getElementById('annTitle');
    const annContentInput = document.getElementById('annContent');
    const announcementsFeed = document.getElementById('announcementsFeed');

    if (createAnnouncementBtn) {
        createAnnouncementBtn.addEventListener('click', () => {
            createAnnouncementBtn.style.display = 'none';
            createAnnouncementForm.style.display = 'block';
        });
    }

    if (cancelAnnBtn) {
        cancelAnnBtn.addEventListener('click', () => {
            createAnnouncementForm.style.display = 'none';
            createAnnouncementBtn.style.display = 'flex';
            annTitleInput.value = '';
            annContentInput.value = '';
        });
    }

    if (postAnnBtn) {
        postAnnBtn.addEventListener('click', async () => {
            const titleStr = annTitleInput ? annTitleInput.value.trim() : '';
            const contentStr = annContentInput ? annContentInput.value.trim() : '';

            if (!titleStr) {
                alert('Please enter a title for the announcement.');
                annTitleInput.focus();
                return;
            }
            if (!contentStr) {
                alert('Please enter the content of the announcement.');
                annContentInput.focus();
                return;
            }

            postAnnBtn.disabled = true;
            postAnnBtn.textContent = 'Posting...';

            try {
                // Insert WITHOUT admin_id (it is UUID type, and we use text login IDs)
                // Store the admin name in the title/content for attribution
                const { error } = await supabase.from('announcements').insert([{
                    title: titleStr,
                    content: `[AUTHOR:${adminUser.name || 'Admin'}]${contentStr}`,
                    barangay: adminUser.barangay || 'Brgy 21'
                }]);

                if (error) throw error;
                
                try {
                    await supabase.from('admin_logs').insert({
                        admin_id: adminUser.id || null,
                        action: 'post_announcement',
                        target_type: 'announcement',
                        details: 'Posted announcement: ' + titleStr,
                        barangay: adminUser.barangay || 'Brgy 21'
                    });
                } catch(err) { console.error('Log error', err); }

                createAnnouncementForm.style.display = 'none';
                createAnnouncementBtn.style.display = 'flex';
                annTitleInput.value = '';
                annContentInput.value = '';
                await loadAnnouncements();

            } catch(e) {
                console.error('[FurSafe Admin] Post announcement error:', e);
                alert('Failed to post announcement. Please try again.');
            } finally {
                postAnnBtn.disabled = false;
                postAnnBtn.textContent = 'Post';
            }
        });
    }

    async function loadAnnouncements() {
        if (!announcementsFeed) return;
        announcementsFeed.innerHTML = '<p>Loading announcements...</p>';

        try {
            const { data: anns, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            announcementsFeed.innerHTML = '';
            if (!anns || anns.length === 0) {
                announcementsFeed.innerHTML = '<p>No announcements yet.</p>';
                return;
            }

            anns.forEach(ann => {
                let actualContent = ann.content;
                let author = 'Admin';
                const authorMatch = actualContent.match(/^\[AUTHOR:(.*?)\](.*)/s);
                if (authorMatch) {
                    author = authorMatch[1];
                    actualContent = authorMatch[2];
                }

                const annCard = document.createElement('div');
                annCard.className = 'announcement-card';
                annCard.setAttribute('data-ann-time', ann.created_at);
                annCard.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:flex-start;">' +
                    '<div>' +
                    '<div class="ann-title">' + ann.title + '</div>' +
                    '<div class="ann-content">' + actualContent + '</div>' +
                    '<div class="ann-meta">Posted by ' + author + ' | ' + humanDate(ann.created_at) + '</div>' +
                    '</div>' +
                    '<button class="btn-delete-ann" data-ann-time="' + ann.created_at + '" style="background:#e74c3c;color:#fff;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:0.8rem;flex-shrink:0;margin-left:12px;"><i class="fa-solid fa-trash"></i> Delete</button>' +
                    '</div>';
                announcementsFeed.appendChild(annCard);
            });

            // Attach delete handlers
            announcementsFeed.querySelectorAll('.btn-delete-ann').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Delete this announcement? It will also disappear from the user website.')) return;
                    const annTime = btn.getAttribute('data-ann-time');
                    btn.disabled = true;
                    btn.textContent = 'Deleting...';
                    try {
                        const { error } = await supabase.from('announcements').delete().eq('created_at', annTime);
                        if (error) throw error;
                        
                        try {
                            await supabase.from('admin_logs').insert({
                                admin_id: adminUser.id || null,
                                action: 'delete_announcement',
                                target_type: 'announcement',
                                details: 'Deleted an announcement',
                                barangay: adminUser.barangay || 'Brgy 21'
                            });
                        } catch(err) { console.error('Log error', err); }
                        
                        await loadAnnouncements();
                    } catch(e) {
                        console.error('[FurSafe Admin] Delete announcement error:', e);
                        alert('Failed to delete announcement.');
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fa-solid fa-trash"></i> Delete';
                    }
                });
            });
        } catch(e) {
            console.error('[FurSafe Admin] Error loading announcements:', e);
        }
    }


    // ==========================================
    // 11. REPORTED POSTS VIEW
    // ==========================================
    async function loadReportedPosts() {
        const list = document.getElementById('reportedPostsList');
        if (!list) return;

        list.innerHTML = '<p>Loading reports...</p>';

        try {
            const { data: reports, error } = await supabase
                .from('reports')
                .select('*, posts(content, profiles(first_name, last_name))')
                .order('created_at', { ascending: false });

            if (error) throw error;

            list.innerHTML = '';
            if (!reports || reports.length === 0) {
                list.innerHTML = '<p>No reported posts.</p>';
                return;
            }

            reports.forEach(r => {
                const content = r.posts ? r.posts.content : 'Post deleted or unavailable';
                const poster = r.posts && r.posts.profiles ? r.posts.profiles.first_name + ' ' + r.posts.profiles.last_name : 'Anonymous';
                const reason = r.reason || 'Spam';
                const tagClass = reason.toLowerCase() === 'spam' ? 'spam' : 'inappropriate';

                list.innerHTML += '<div class="report-card" data-report-id="' + r.id + '">' +
                    '<div class="report-date">' + humanDate(r.created_at) + '</div>' +
                    '<div class="report-tag ' + tagClass + '">' + reason + '</div>' +
                    '<div class="report-content">"' + content + '"</div>' +
                    '<div class="report-meta">Posted by: ' + poster + ' | Reported by user</div>' +
                    '<div class="report-actions">' +
                    '<button class="btn-delete" data-report-id="' + r.id + '" data-post-id="' + (r.post_id || '') + '">Delete post</button>' +
                    '<button class="btn-dismiss" data-report-id="' + r.id + '">Dismiss</button>' +
                    '</div></div>';
            });

            // Attach handlers
            list.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Are you sure you want to delete this post?')) return;
                    const reportId = btn.getAttribute('data-report-id');
                    const postId = btn.getAttribute('data-post-id');
                    try {
                        if (postId) {
                            await supabase.from('posts').delete().eq('id', postId);
                        }
                        await supabase.from('reports').delete().eq('id', reportId);
                        await loadReportedPosts();
                    } catch(e) {
                        console.error('[FurSafe Admin] Delete post error:', e);
                    }
                });
            });

            list.querySelectorAll('.btn-dismiss').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const reportId = btn.getAttribute('data-report-id');
                    try {
                        await supabase.from('reports').delete().eq('id', reportId);
                        await loadReportedPosts();
                    } catch(e) {
                        console.error('[FurSafe Admin] Dismiss report error:', e);
                    }
                });
            });

        } catch(e) {
            console.error('[FurSafe Admin] Error loading reports:', e);
        }
    }


    // ==========================================
    // 12. REPORTS (CHARTS) VIEW
    // ==========================================
    async function loadReportsView() {
        if (cachedPets.length === 0) await fetchAllPets();

        const { data: reports } = await supabase.from('reports').select('id');
        const reportCount = reports ? reports.length : 0;

        const totalPets = cachedPets.length;
        const vacPets = cachedPets.filter(p => isVaccinated(p)).length;
        const pendingPets = cachedPets.filter(p => p.vaccination_status === 'Pending' || (!p.vaccination_status)).length;
        const vacPercent = totalPets === 0 ? 0 : Math.round((vacPets / totalPets) * 100);
        const thisMonth = cachedPets.filter(p => {
            const d = new Date(p.created_at);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        const reportsGrid = document.getElementById('reportsStatsGrid');
        if (reportsGrid) {
            reportsGrid.innerHTML = '<div class="stat-card"><div class="stat-title">Total pets registered</div><div class="stat-value">' + totalPets + '</div><div class="stat-subtext">+' + thisMonth + ' this month</div></div>' +
                '<div class="stat-card"><div class="stat-title">Vaccinated pets</div><div class="stat-value">' + vacPets + '</div><div class="stat-subtext">' + vacPercent + '% of total</div></div>' +
                '<div class="stat-card"><div class="stat-title">Pending approval</div><div class="stat-value">' + pendingPets + '</div><div class="stat-subtext">Needs review</div></div>' +
                '<div class="stat-card"><div class="stat-title">Reported posts</div><div class="stat-value">' + reportCount + '</div><div class="stat-subtext">Unresolved</div></div>';
        }

        const dogs = cachedPets.filter(p => p.species === 'Dog').length;
        const cats = cachedPets.filter(p => p.species === 'Cat').length;
        const others = cachedPets.filter(p => p.species !== 'Dog' && p.species !== 'Cat').length;
        const total = totalPets || 1;

        const reportsPetBreakdown = document.getElementById('reportsPetBreakdown');
        if (reportsPetBreakdown) {
            reportsPetBreakdown.innerHTML =
                '<div class="progress-item"><div class="progress-label">Dog</div><div class="progress-track"><div class="progress-fill orange" style="width:' + Math.round((dogs/total)*100) + '%"></div></div><div class="progress-value">' + dogs + '</div></div>' +
                '<div class="progress-item"><div class="progress-label">Cat</div><div class="progress-track"><div class="progress-fill red" style="width:' + Math.round((cats/total)*100) + '%"></div></div><div class="progress-value">' + cats + '</div></div>' +
                '<div class="progress-item"><div class="progress-label">Others</div><div class="progress-track"><div class="progress-fill blue" style="width:' + Math.round((others/total)*100) + '%"></div></div><div class="progress-value">' + others + '</div></div>';
        }

        const notVac = totalPets - vacPets;
        const reportsVacBreakdown = document.getElementById('reportsVacBreakdown');
        if (reportsVacBreakdown) {
            reportsVacBreakdown.innerHTML =
                '<div class="progress-item"><div class="progress-label" style="width:100px;">Vaccinated</div><div class="progress-track"><div class="progress-fill green" style="width:' + (totalPets === 0 ? 0 : Math.round((vacPets/totalPets)*100)) + '%"></div></div><div class="progress-value">' + vacPets + '</div></div>' +
                '<div class="progress-item"><div class="progress-label" style="width:100px;">Not yet</div><div class="progress-track"><div class="progress-fill brown" style="width:' + (totalPets === 0 ? 0 : Math.round((notVac/totalPets)*100)) + '%"></div></div><div class="progress-value">' + notVac + '</div></div>';
        }
    }


    // ==========================================
    // 13. INITIAL LOAD
    // ==========================================
    loadViewData('dashboard');

});
