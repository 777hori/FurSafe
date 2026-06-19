document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. SUPABASE CONFIGURATION
    // ==========================================
    // Replace these values with your actual Supabase URL and Anon Key
    const SUPABASE_URL = 'https://hfpibrfnbdohfjgengim.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcGlicmZuYmRvaGZqZ2VuZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTQzNzksImV4cCI6MjA5NzE3MDM3OX0.CiaPTLaVK1HbTUafQdkW-mBV9GTqAOGohGzb-u-56nk';
    
    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ==========================================
    // 1. SPA ROUTING ENGINE
    // ==========================================
    const pages = {
        login: document.getElementById('login-page'),
        app: document.getElementById('app-container')
    };

    const views = {
        home: document.getElementById('home-view'),
        register: document.getElementById('register-view'),
        services: document.getElementById('services-view'),
        community: document.getElementById('community-view'),
        about: document.getElementById('about-view'),
        settings: document.getElementById('settings-view'),
        profile: document.getElementById('profile-view')
    };

    function navigateTo(route) {
        if (route === 'login') {
            pages.app.classList.remove('active');
            pages.login.classList.add('active');
        } else {
            pages.login.classList.remove('active');
            pages.app.classList.add('active');

            // Hide all views
            Object.values(views).forEach(view => {
                if(view) view.classList.remove('active');
            });

            // Show target view
            if (views[route]) {
                views[route].classList.add('active');
            }

            // Update active states on navbar
            document.querySelectorAll('.nav-link, .icon-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = ''; // Reset custom active background
                if (btn.dataset.route === route) {
                    btn.classList.add('active');
                    if (btn.classList.contains('icon-btn')) {
                        btn.style.backgroundColor = 'var(--primary-hover)';
                    }
                }
            });

            // Initialize map if navigating to services
            if (route === 'services') {
                setTimeout(initMap, 100); // slight delay to allow display:block to render
            }
        }
    }

    // Attach click listeners to all routing buttons
    document.querySelectorAll('[data-route]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(el.dataset.route);
        });
    });


    // ==========================================
    // 2. STRICT INPUT VALIDATIONS (UNIVERSAL ENGINE)
    // ==========================================
    document.addEventListener('input', (e) => {
        if (!e.target || !e.target.tagName) return;
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') return;

        // 1. Letters Only (Names, Species, Breed, Phase/Street, etc.)
        if (e.target.classList.contains('no-digits') || e.target.classList.contains('letters-only')) {
            let val = e.target.value.replace(/[^a-zA-Z\s\-ñÑ]/g, '');
            val = val.replace(/  +/g, ' '); // No double spaces
            if (e.target.value !== val) e.target.value = val;
        }
        
      if (e.target.classList.contains('only-numbers') || e.target.classList.contains('numbers-only')) {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (e.target.value !== val) e.target.value = val;
}
if (e.target.id === 'ownerContact') {
    if (e.target.value.length > 0 && e.target.value.length < 11) {
        e.target.style.borderColor = 'red';
    } else {
        e.target.style.borderColor = '';
    }
}

        // 3. No Symbols (Admin ID, basic titles)
        if (e.target.classList.contains('no-symbols')) {
            let val = e.target.value.replace(/[^a-zA-Z0-9\s\-ñÑ]/g, '');
            if (e.target.value !== val) e.target.value = val;
        }
    });

    // Strict Brgy ID format (e.g. 2024-BRGY21-0001)
    // Format: digits - alphanumeric - digits (middle section can have both letters AND numbers)
    const brgyIdInput = document.getElementById('brgyId');
    const brgyIdError = document.getElementById('brgyIdError');
    if (brgyIdInput) {
        brgyIdInput.addEventListener('input', (e) => {
            // Only allow letters, numbers, and hyphens while typing
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        });

        brgyIdInput.addEventListener('blur', (e) => {
            // Allow alphanumeric in the middle section (e.g. BRGY21, POSXI, etc.)
            const regex = /^\d+-[A-Z0-9]+-\d+$/;
            if (e.target.value && !regex.test(e.target.value)) {
                brgyIdInput.classList.add('input-error');
                if(brgyIdError) brgyIdError.classList.add('visible');
            } else {
                brgyIdInput.classList.remove('input-error');
                if(brgyIdError) brgyIdError.classList.remove('visible');
            }
        });
    }

    // Checkbox mutually exclusive logic (Sex: Male/Female)
    document.querySelectorAll('.checkbox-group-inline').forEach(group => {
        const checkboxes = group.querySelectorAll('.single-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                if (this.checked) {
                    checkboxes.forEach(other => {
                        if (other !== this) other.checked = false;
                    });
                }
            });
        });
    });


    // ==========================================
    // 3. UI LOGIC (MODALS, DROPDOWNS, MAP)
    // ==========================================
    
// Terms & Privacy Modals (Separated)
    const termsModal = document.getElementById('termsModal');
    const privacyModal = document.getElementById('privacyModal');
    const termsLink = document.getElementById('termsLink');
    const privacyLink = document.getElementById('privacyLink');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closePrivacyModalBtn = document.getElementById('closePrivacyModalBtn');

    // Terms Functions
    function openTermsModal(e) {
        if(e) e.preventDefault();
        if(termsModal) termsModal.classList.add('active');
    }
    function closeTermsModal() {
        if(termsModal) termsModal.classList.remove('active');
    }

    // Privacy Functions
    function openPrivacyModal(e) {
        if(e) e.preventDefault();
        if(privacyModal) privacyModal.classList.add('active');
    }
    function closePrivacyModal() {
        if(privacyModal) privacyModal.classList.remove('active');
    }

    // Event Listeners
    if(termsLink) termsLink.addEventListener('click', openTermsModal);
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeTermsModal);

    if(privacyLink) privacyLink.addEventListener('click', openPrivacyModal);
    if(closePrivacyModalBtn) closePrivacyModalBtn.addEventListener('click', closePrivacyModal);

    // Click outside to close either modal
    window.addEventListener('click', (e) => {
        if (e.target === termsModal) closeTermsModal();
        if (e.target === privacyModal) closePrivacyModal();
    });

    // Notification Dropdown
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                notificationDropdown.classList.remove('active');
            }
        });
    }

    // Leaflet Map Initialization
    let map = null;
    function initMap() {
        const mapContainer = document.getElementById('map');
        if (!mapContainer || map) return; // Prevent multiple initializations

        map = L.map('map').setView([14.6570, 120.9660], 14); // Caloocan Barangay 21 coords

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors (OpenFreeMap)'
        }).addTo(map);

        L.marker([14.6507, 120.9885]).addTo(map)
            .bindPopup('<b>Caloocan Veterinary Center</b><br>1061 Gen. San Miguel St.')
            .openPopup();

        L.circle([14.6507, 120.9885], {
            color: 'var(--primary)',
            fillColor: 'var(--primary)',
            fillOpacity: 0.2,
            radius: 500
        }).addTo(map);
    }

    // Vaccination Toggle Button Logic in Registration (status value tracking)
    const btnVac = document.getElementById('btnVac');
    const btnNotVac = document.getElementById('btnNotVac');
    const vacStatusInput = document.getElementById('vaccinationStatus');

    if (btnVac && btnNotVac && vacStatusInput) {
        btnVac.addEventListener('click', () => {
            btnVac.classList.add('active-vac');
            btnNotVac.classList.remove('active-vac');
            vacStatusInput.value = 'Vaccinated';
        });
        btnNotVac.addEventListener('click', () => {
            btnNotVac.classList.add('active-vac');
            btnVac.classList.remove('active-vac');
            vacStatusInput.value = 'Not Vaccinated';
        });
    }

    // Settings logic (Dark Mode)
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            if(e.target.checked) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        });
    }

    // Profile page multiple pets logic is handled by renderPets below
    
    // Services Map Clinic Focus Logic
    window.focusClinic = function(lat, lng, name, address, hours, contact, email) {
        if(map) {
            map.setView([lat, lng], 16);
            L.popup().setLatLng([lat, lng])
                .setContent('<b>'+name+'</b><br>'+address)
                .openOn(map);
        }
        
        const nameEl = document.getElementById('detailClinicName');
        const addrEl = document.getElementById('detailClinicAddress');
        const hoursEl = document.getElementById('detailClinicHours');
        const contactEl = document.getElementById('detailClinicContact');
        
        if(nameEl) nameEl.textContent = name;
        if(addrEl) addrEl.textContent = address;
        if(hoursEl) hoursEl.textContent = hours;
        if(contactEl) contactEl.innerHTML = `<i class="fa-solid fa-phone" style="color:var(--primary);margin-right:6px;"></i>${contact}` +
            (email ? `&nbsp;&nbsp;<i class="fa-solid fa-envelope" style="color:var(--primary);margin-left:10px;margin-right:6px;"></i>${email}` : '');
    };
    
    // Services Clinic Search Logic
    const clinicSearch = document.getElementById('clinicSearch');
    const hiddenClinics = document.getElementById('hiddenClinics');
    const clinicListContainer = document.getElementById('clinicListContainer');
    
    if (clinicSearch && hiddenClinics && clinicListContainer) {
        clinicSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = hiddenClinics.querySelectorAll('.search-item');
            
            // if query > 2 chars, move matching from hidden to visible list
            if (query.length > 2) {
                items.forEach(item => {
                    if (item.dataset.name.includes(query)) {
                        clinicListContainer.appendChild(item);
                        item.classList.remove('search-item'); // prevent re-adding
                    }
                });
            }
        });
    }
    
    // Sign Up & Login view toggle (from login page)
    const showSignUpBtn = document.getElementById('showSignUpBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const loginFields = document.getElementById('loginFields');
    const signUpFields = document.getElementById('signUpFields');
    
    if (showSignUpBtn && backToLoginBtn && loginFields && signUpFields) {
        showSignUpBtn.addEventListener('click', () => {
            loginFields.style.display = 'none';
            signUpFields.style.display = 'block';
            // Change header to GET STARTED
            const welcomeText = document.querySelector('.welcome-text');
            const welcomeSub = document.querySelector('.welcome-subtext');
            if (welcomeText) welcomeText.textContent = 'GET STARTED!';
            if (welcomeSub) welcomeSub.textContent = 'CREATE YOUR ACCOUNT';
        });
        backToLoginBtn.addEventListener('click', () => {
            signUpFields.style.display = 'none';
            loginFields.style.display = 'block';
            // Restore WELCOME BACK
            const welcomeText = document.querySelector('.welcome-text');
            const welcomeSub = document.querySelector('.welcome-subtext');
            if (welcomeText) welcomeText.textContent = 'WELCOME BACK!';
            if (welcomeSub) welcomeSub.textContent = 'LOG IN TO YOUR ACCOUNT';
        });
    }

    // Clear email error as user types
    const signupEmailInput = document.getElementById('signupEmail');
    if (signupEmailInput) {
        signupEmailInput.addEventListener('input', () => {
            const emailErr = document.getElementById('emailError');
            if (emailErr) emailErr.classList.remove('visible');
            signupEmailInput.classList.remove('input-error');
        });
    }

    // ==========================================
    // SIGN-UP Brgy ID validation
    // ==========================================
    const signupBrgyIdInput = document.getElementById('signupBrgyId');
    const signupBrgyIdError = document.getElementById('signupBrgyIdError');
    const brgyIdRegex = /^\d+-[A-Z0-9]+-\d+$/; // allows BRGY21, POSXI, etc.

    if (signupBrgyIdInput) {
        signupBrgyIdInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
        });

        signupBrgyIdInput.addEventListener('blur', (e) => {
            if (e.target.value && !brgyIdRegex.test(e.target.value)) {
                signupBrgyIdInput.classList.add('input-error');
                if (signupBrgyIdError) signupBrgyIdError.classList.add('visible');
            } else {
                signupBrgyIdInput.classList.remove('input-error');
                if (signupBrgyIdError) signupBrgyIdError.classList.remove('visible');
            }
        });
    }

    // ==========================================
    // SIGN-UP SUBMIT — validate brgy_id against DB
    // ==========================================
    const signUpSubmitBtn = document.getElementById('signUpSubmitBtn');
    const emailErrorEl = document.getElementById('emailError');

    if (signUpSubmitBtn) {
        signUpSubmitBtn.addEventListener('click', async () => {
            const firstName = document.getElementById('signupFirstName')?.value.trim();
            const lastName = document.getElementById('signupLastName')?.value.trim();
            const email = document.getElementById('signupEmail')?.value.trim();
            const brgyIdVal = signupBrgyIdInput?.value.trim().toUpperCase();

            // Clear previous errors
            if (signupBrgyIdError) signupBrgyIdError.classList.remove('visible');
            if (emailErrorEl) emailErrorEl.classList.remove('visible');

            // Basic presence check
            if (!firstName || !lastName || !email || !brgyIdVal) {
                alert('Please fill in all fields.');
                return;
            }

            // Email domain validation — only allow gmail, yahoo, outlook
            const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
            const emailDomain = email.split('@')[1]?.toLowerCase();
            if (!emailDomain || !allowedDomains.includes(emailDomain)) {
                const emailErr = document.getElementById('emailError');
                if (emailErr) {
                    emailErr.textContent = 'Invalid email. Please use @gmail.com, @yahoo.com, or @outlook.com.';
                    emailErr.classList.add('visible');
                }
                document.getElementById('signupEmail')?.classList.add('input-error');
                return;
            } else {
                const emailErr = document.getElementById('emailError');
                if (emailErr) emailErr.classList.remove('visible');
                document.getElementById('signupEmail')?.classList.remove('input-error');
            }

            // Format check
            if (!brgyIdRegex.test(brgyIdVal)) {
                signupBrgyIdInput.classList.add('input-error');
                if (signupBrgyIdError) {
                    signupBrgyIdError.textContent = 'Invalid format. e.g. 2024-BRGY21-0001';
                    signupBrgyIdError.classList.add('visible');
                }
                return;
            }

            signUpSubmitBtn.disabled = true;
            signUpSubmitBtn.textContent = 'Checking...';

            try {
                // 1. Check if this brgy_id exists and is unused
                // Using maybeSingle() — returns null (not error) when no row found
                const { data: idRow, error: idError } = await supabase
                    .from('valid_brgy_ids')
                    .select('id, is_used')
                    .eq('brgy_id', brgyIdVal)
                    .maybeSingle();

                // Log for debugging — open browser DevTools > Console to see this
                console.log('[FurSafe] brgy_id lookup:', { brgyIdVal, idRow, idError });

                if (idError) {
                    // Usually means RLS is blocking anonymous reads on brgy_ids table
                    console.error('[FurSafe] Supabase RLS/query error:', idError);
                    if (signupBrgyIdError) {
                        signupBrgyIdError.textContent = 'Could not verify ID (' + idError.message + '). Check Supabase table permissions.';
                        signupBrgyIdError.classList.add('visible');
                    }
                    signupBrgyIdInput.classList.add('input-error');
                    return;
                }

                if (!idRow) {
                    if (signupBrgyIdError) {
                        signupBrgyIdError.textContent = 'Barangay ID not found. Please check your ID.';
                        signupBrgyIdError.classList.add('visible');
                    }
                    signupBrgyIdInput.classList.add('input-error');
                    return;
                }

                if (idRow.is_used) {
                    if (signupBrgyIdError) {
                        signupBrgyIdError.textContent = 'This Barangay ID has already been used.';
                        signupBrgyIdError.classList.add('visible');
                    }
                    signupBrgyIdInput.classList.add('input-error');
                    return;
                }

              // 2. Create Supabase auth user with email + a default password (brgy_id)
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: email,
                    password: brgyIdVal, // default password = their brgy ID; they can change later
                    options: {
                        data: { first_name: firstName, last_name: lastName, brgy_id: brgyIdVal }
                    }
                });

                if (authError) {
                    if (authError.message.toLowerCase().includes('email')) {
                        if (emailErrorEl) {
                            emailErrorEl.textContent = 'This email is already registered. Please use a different email.';
                            emailErrorEl.classList.add('visible');
                        }
                    } else {
                        alert('Sign up error: ' + authError.message);
                    }
                    return;
                }

                // ==========================================================
                // 🔥 ADDED THIS SECTION HERE TO FIX THE PET REGISTRATION CRASH
                // ==========================================================
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: authData.user.id, // Links the auth user to the profiles table
                            first_name: firstName,
                            last_name: lastName,
                            email: email,
                            brgy_id: brgyIdVal
                        }
                    ]);

                if (profileError) {
                    console.error('[FurSafe] Profile creation failed:', profileError);
                    alert('Account authentication succeeded, but your user profile could not be created: ' + profileError.message);
                    return;
                }
                // ==========================================================

                // 3. Mark brgy_id as used AND store email for login lookup
                await supabase
                    .from('valid_brgy_ids')
                    .update({ is_used: true, email: email })
                    .eq('id', idRow.id);

                // 4. Show success
                const successModal = document.getElementById('successModal');
                const successMsg = document.getElementById('successModalMessage');
                if (successMsg) successMsg.textContent = `Welcome, ${firstName}! Your account has been created. Your default password is your Barangay ID. Please log in.`;
                if (successModal) successModal.classList.add('active');

                // Reset form and go back to login
                signUpFields.style.display = 'none';
                loginFields.style.display = 'block';
                document.getElementById('signupFirstName').value = '';
                document.getElementById('signupLastName').value = '';
                document.getElementById('signupEmail').value = '';
                signupBrgyIdInput.value = '';

            } catch (err) {
                alert('Unexpected error: ' + err.message);
            } finally {
                signUpSubmitBtn.disabled = false;
                signUpSubmitBtn.textContent = 'SIGN UP';
            }
        });
    }

    // ==========================================
    // LOGIN SUBMIT — authenticate with Supabase
    // ==========================================
    const loginForm = document.getElementById('loginForm');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');

    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const brgyIdVal = document.getElementById('brgyId')?.value.trim().toUpperCase();
            const password = document.getElementById('password')?.value;
            const termsCheck = document.getElementById('termsCheck');

            if (!brgyIdVal || !password) {
                alert('Please enter your Barangay ID and password.');
                return;
            }
            if (termsCheck && !termsCheck.checked) {
                alert('Please agree to the Terms of Service and Privacy Policy.');
                return;
            }

            loginSubmitBtn.disabled = true;
            loginSubmitBtn.textContent = 'Logging in...';

            try {
                // Look up the email stored in valid_brgy_ids for this brgy_id
                const { data: idRecord, error: idLookupError } = await supabase
                    .from('valid_brgy_ids')
                    .select('email, is_used')
                    .eq('brgy_id', brgyIdVal)
                    .maybeSingle();

                console.log('[FurSafe] login lookup:', { brgyIdVal, idRecord, idLookupError });

                if (idLookupError) {
                    alert('Error looking up ID: ' + idLookupError.message);
                    return;
                }

                if (!idRecord || !idRecord.is_used || !idRecord.email) {
                    const brgyErr = document.getElementById('brgyIdError');
                    if (brgyErr) {
                        brgyErr.textContent = 'No account found with this Barangay ID.';
                        brgyErr.classList.add('visible');
                    }
                    document.getElementById('brgyId').classList.add('input-error');
                    return;
                }

                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: idRecord.email,
                    password: password
                });

                if (loginError) {
                    alert('Incorrect password. Please try again.');
                    return;
                }

                // --- BAN CHECK: verify profile is_active ---
                const { data: profileCheck, error: profileCheckErr } = await supabase
                    .from('profiles')
                    .select('is_active')
                    .eq('id', loginData.user.id)
                    .maybeSingle();

                if (!profileCheckErr && profileCheck && profileCheck.is_active === false) {
                    await supabase.auth.signOut();
                    alert('Your account has been banned. Please contact the barangay office for assistance.');
                    return;
                }

                // ==========================================
                // 🔥 FIXED: FORCE RE-RENDER PETS IMMEDIATELY ON LOGIN
                // ==========================================
                // 1. Populate standard user metadata fields
                populateUserData(loginData.user);
                
                // 2. Fetch and assign pets directly using the newly logged-in user ID
                if (typeof window.updatePetsUI === 'function') {
                    currentUserPets = [];
                    const { data: pets, error: fetchErr } = await supabase
                        .from('pets')
                        .select('*')
                        .eq('owner_id', loginData.user.id)
                        .order('created_at', { ascending: false });

                    if (!fetchErr && pets) {
                        currentUserPets = pets;
                        // This updates the homepage and dropdown menus instantly
                        updatePetsUI(); 
                    } else if (fetchErr) {
                        console.error('[FurSafe] Instant pet fetch error:', fetchErr);
                    }
                }
                
                // 3. Go to home page dashboard
                navigateTo('home');
                // ==========================================

            } catch (err) {
                alert('Unexpected error: ' + err.message);
            } finally {
                loginSubmitBtn.disabled = false;
                loginSubmitBtn.textContent = 'LOG IN';
            }
        });
    }

    // ==========================================
    // POPULATE USER DATA INTO SETTINGS & PROFILE
    // ==========================================
    function populateUserData(user) {
        if (!user) return;

        const meta = user.user_metadata || {};
        const firstName = meta.first_name || '';
        const lastName  = meta.last_name  || '';
        const email     = user.email      || '';
        const fullName  = [firstName, lastName].filter(Boolean).join(' ');

        // --- SETTINGS PAGE ---
        const settingsFirst   = document.querySelector('#settings-view .settings-input-group input[type="text"]:nth-of-type(1)');
        // Use querySelectorAll for safer targeting
        const settingsInputs  = document.querySelectorAll('#settings-view .settings-input-group input');
        settingsInputs.forEach(inp => {
            const label = inp.closest('.settings-input-group')?.querySelector('label')?.textContent?.trim().toUpperCase();
            if (label === 'FIRST NAME')    inp.value = firstName;
            if (label === 'LAST NAME')     inp.value = lastName;
            if (label === 'EMAIL ADDRESS') inp.value = email;
        });

        // --- PET PROFILE PAGE — Owner's Name and Email ---
        // (Removed: We do not overwrite the pet's owner name with the logged-in user's name here. 
        // It is populated dynamically when a pet is selected from the dropdown)

        // --- REGISTER PAGE — pre-fill owner fields ---
        const ownerFirst   = document.getElementById('ownerFirstName');
        const ownerLast    = document.getElementById('ownerLastName');
        const ownerEmail   = document.getElementById('ownerEmail');
        if (ownerFirst)  ownerFirst.value  = firstName;
        if (ownerLast)   ownerLast.value   = lastName;
        if (ownerEmail)  ownerEmail.value  = email;
    }

    // Restore session if user refreshes page (already logged in)
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
            populateUserData(session.user);
            navigateTo('home');
        }
    });

 // ==========================================
    // SIGN OUT BUTTON — UPDATED TO CLEAR OLD USER DATA
    // ==========================================
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to sign out?')) {
                try {
                    await supabase.auth.signOut();
                    
                    // 1. Wipe out memory array
                    currentUserPets = [];
                    
                    // 2. Clear out all pet profile texts from the screen
                    if(document.getElementById('homePetName')) document.getElementById('homePetName').textContent = '';
                    if(document.getElementById('homePetId')) document.getElementById('homePetId').textContent = '';
                    if(document.getElementById('homePetBreed')) document.getElementById('homePetBreed').textContent = '';
                    if(document.getElementById('homePetBirthday')) document.getElementById('homePetBirthday').textContent = '';
                    if(document.getElementById('homeOwnerName')) document.getElementById('homeOwnerName').textContent = '';
                    if(document.getElementById('homeOwnerPhone')) document.getElementById('homeOwnerPhone').textContent = '';
                    if(document.getElementById('homeOwnerEmail')) document.getElementById('homeOwnerEmail').textContent = '';
                    if(document.getElementById('homePetKg')) document.getElementById('homePetKg').textContent = '';
                    if(document.getElementById('homePetGender')) document.getElementById('homePetGender').textContent = '';
                    
                    const imgContainer = document.getElementById('homePetImageContainer');
                    if (imgContainer) imgContainer.innerHTML = `<span>[Pet Photo]</span>`;
                    
                    // 3. Reset profile lists and feed displays
                    const petProfileSelector = document.getElementById('petProfileSelector');
                    if (petProfileSelector) petProfileSelector.innerHTML = '<option value="">No Pets Registered</option>';
                    
                    const communityPostsFeed = document.getElementById('communityPostsFeed');
                    if (communityPostsFeed) communityPostsFeed.innerHTML = '';
                    
                    // 4. Force reset all input textboxes throughout the app so fields are clean
                    document.querySelectorAll('input').forEach(input => {
                        if (input.type !== 'button' && input.type !== 'submit') {
                            input.value = '';
                        }
                    });

                } catch(e) { 
                    console.error("Logout cleanup error:", e); 
                }
                
                navigateTo('login');
            }
        });
    }

    // ==========================================
    // ADMIN TOGGLE BUTTON — transforms login into admin login
    // ==========================================
    const adminToggleBtn = document.getElementById('adminToggleBtn');
    // Note: loginFields, signUpFields already declared above (Sign Up & Login view toggle section)
    const adminLoginFields = document.getElementById('adminLoginFields');

    if (adminToggleBtn) {
        adminToggleBtn.addEventListener('click', () => {
            // Hide user login fields, show admin login fields
            if (loginFields) loginFields.style.display = 'none';
            if (signUpFields) signUpFields.style.display = 'none';
            if (adminLoginFields) adminLoginFields.style.display = 'block';

            // Update header text to reflect admin mode
            const welcomeText = document.querySelector('.welcome-text');
            const welcomeSub = document.querySelector('.welcome-subtext');
            if (welcomeText) welcomeText.textContent = 'ADMIN LOGIN';
            if (welcomeSub) welcomeSub.textContent = 'SIGN IN WITH YOUR ADMIN CREDENTIALS';
        });
    }

    // Back from admin login to user login
    const backFromAdminBtn = document.getElementById('backFromAdminBtn');
    if (backFromAdminBtn) {
        backFromAdminBtn.addEventListener('click', () => {
            if (adminLoginFields) adminLoginFields.style.display = 'none';
            if (loginFields) loginFields.style.display = 'block';
            const welcomeText = document.querySelector('.welcome-text');
            const welcomeSub = document.querySelector('.welcome-subtext');
            if (welcomeText) welcomeText.textContent = 'WELCOME BACK!';
            if (welcomeSub) welcomeSub.textContent = 'LOG IN TO YOUR ACCOUNT';
        });
    }

    // Admin password toggle
    const toggleAdminPass = document.getElementById('toggleAdminPassword');
    const adminPassInput = document.getElementById('adminPassword');
    if (toggleAdminPass && adminPassInput) {
        toggleAdminPass.addEventListener('click', () => {
            const isHidden = adminPassInput.type === 'password';
            adminPassInput.type = isHidden ? 'text' : 'password';
            toggleAdminPass.classList.toggle('fa-eye', isHidden);
            toggleAdminPass.classList.toggle('fa-eye-slash', !isHidden);
            toggleAdminPass.style.color = '#aaa';
            toggleAdminPass.style.visibility = 'visible';
        });
    }

    // Admin submit
    const adminLoginSubmitBtn = document.getElementById('adminLoginSubmitBtn');
    const adminIdInput = document.getElementById('adminId');
    const adminPassInputReal = document.getElementById('adminPassword');

    if (adminLoginSubmitBtn) {
        adminLoginSubmitBtn.addEventListener('click', async () => {
            const adminId = adminIdInput?.value.trim();
            const password = adminPassInputReal?.value.trim();

            if (!adminId || !password) {
                alert('Please enter your Admin ID and Password.');
                return;
            }

            adminLoginSubmitBtn.disabled = true;
            adminLoginSubmitBtn.textContent = 'Verifying...';

            try {
                const { data: adminData, error: adminError } = await supabase
                    .from('admin_accounts')
                    .select('*')
                    .eq('admin_login_id', adminId)
                    .eq('password', password)
                    .maybeSingle();

                if (adminError) {
                    console.error('[FurSafe] Admin login error:', adminError);
                    alert('Error checking admin credentials. Check console.');
                } else if (!adminData) {
                    // FALLBACK: If RLS is blocking the read or table is empty, allow the hardcoded test account
                    if (adminId === 'ADMIN-FURSAFE-001' && password === 'adminfursafe01') {
                        localStorage.setItem('fursafe_admin', JSON.stringify({
                            admin_login_id: 'ADMIN-FURSAFE-001',
                            name: 'Abigail Mapue',
                            role: 'Admin',
                            barangay: 'Barangay 21'
                        }));
                        window.location.href = 'admin.html';
                    } else {
                        alert('Invalid Admin ID or Password.');
                    }
                } else if (!adminData.is_active) {
                    alert('This admin account is currently inactive.');
                } else {
                    // Success! Store admin session in localStorage and redirect
                    localStorage.setItem('fursafe_admin', JSON.stringify({
                        admin_login_id: adminData.admin_login_id,
                        name: adminData.name,
                        role: adminData.role,
                        barangay: adminData.barangay
                    }));
                    window.location.href = 'admin.html';
                }
            } catch (err) {
                console.error('[FurSafe] Unexpected admin login error:', err);
                alert('An unexpected error occurred.');
            } finally {
                adminLoginSubmitBtn.disabled = false;
                adminLoginSubmitBtn.textContent = 'SIGN IN AS ADMIN';
            }
        });
    }

    // ==========================================
    // PET PHOTO UPLOAD (Register page)
    // ==========================================
    const petPhotoInput = document.getElementById('petPhotoInput');
    const petPhotoPreview = document.getElementById('petPhotoPreview');
    const petPhotoIcon = document.getElementById('petPhotoIcon');
    const petPhotoLabel = document.getElementById('petPhotoLabel');
    const petPhotoHint = document.getElementById('petPhotoHint');

    if (petPhotoInput) {
        petPhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 5 * 1024 * 1024) {
                alert('File too large. Please upload an image under 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (petPhotoPreview) {
                    petPhotoPreview.src = ev.target.result;
                    petPhotoPreview.style.display = 'block';
                }
                if (petPhotoIcon) petPhotoIcon.style.display = 'none';
                if (petPhotoLabel) petPhotoLabel.style.display = 'none';
                if (petPhotoHint) petPhotoHint.style.display = 'none';

                // Also update profile page pet photo
                const profileImg = document.getElementById('profilePetPhotoImg');
                const profilePlaceholder = document.getElementById('profilePetPhotoPlaceholder');
                if (profileImg) {
                    profileImg.src = ev.target.result;
                    profileImg.style.display = 'block';
                }
                if (profilePlaceholder) profilePlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
    }

    // ==========================================
    // AVATAR UPLOAD (Settings page) — syncs to community
    // ==========================================
    const avatarFileInput = document.getElementById('avatarFileInput');
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarCameraIcon = document.getElementById('avatarCameraIcon');
    const communityAvatarImg = document.getElementById('communityAvatarImg');
    const communityAvatarIcon = document.getElementById('communityAvatarIcon');

    if (avatarFileInput) {
        avatarFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const src = ev.target.result;

                // Update settings preview
                if (avatarPreview) {
                    avatarPreview.src = src;
                    avatarPreview.style.display = 'block';
                }
                if (avatarCameraIcon) avatarCameraIcon.style.display = 'none';

                // Sync to community post box avatar
                if (communityAvatarImg) {
                    communityAvatarImg.src = src;
                    communityAvatarImg.style.display = 'block';
                }
                if (communityAvatarIcon) communityAvatarIcon.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });
    }

    // ==========================================
    // PRINT / SAVE PDF (Registration form)
    // ==========================================
    const printPdfBtn = document.getElementById('printPdfBtn');
    if (printPdfBtn) {
        printPdfBtn.addEventListener('click', () => {
            // Temporarily show the register view for printing
            window.print();
        });
    }

    // ==========================================
    // VACCINE CHECKBOXES — only show if Vaccinated
    // ==========================================
    const vaccineCheckboxesDiv = document.getElementById('vaccineCheckboxes');
    const btnVacEl = document.getElementById('btnVac');
    const btnNotVacEl = document.getElementById('btnNotVac');

    function updateVaccineVisibility() {
        if (!vaccineCheckboxesDiv) return;
        const isVaccinated = btnVacEl && btnVacEl.classList.contains('active-vac');
        vaccineCheckboxesDiv.style.display = isVaccinated ? 'grid' : 'none';
    }

    if (btnVacEl) btnVacEl.addEventListener('click', updateVaccineVisibility);
    if (btnNotVacEl) btnNotVacEl.addEventListener('click', updateVaccineVisibility);
    // Initialize: hide if not vaccinated by default
    updateVaccineVisibility();

    // ==========================================
    // REGISTRATION CONFIRMATION POPUP
    // ==========================================
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Check session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.user) {
                alert('You must be logged in to register a pet.');
                return;
            }
            const userId = session.user.id;
            
            const submitBtn = registrationForm.querySelector('button[type="submit"]') || document.getElementById('submitRegistrationBtn');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Submit';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Saving...';
            }

            const successModal = document.getElementById('successModal');
            const successMsg = document.getElementById('successModalMessage');
            
            const petName = document.getElementById('petName')?.value.trim();
            const petBreed = document.getElementById('petBreed')?.value.trim();
            const petAge = document.getElementById('petAge')?.value.trim();
            const petWeight = document.getElementById('petWeight')?.value.trim();
            const petSex = document.querySelector('input[name="petSex"]:checked')?.value;
            const petNeutered = document.querySelector('input[name="petNeutered"]:checked')?.value;
            const petSpecies = document.getElementById('petSpecies')?.value.trim();
            const petColor = document.getElementById('petColor')?.value.trim();
            const vaccinationStatus = document.getElementById('vaccinationStatus')?.value;
            
            // STRICT VALIDATION
            if (!petName) { alert('Please enter your pet\'s name.'); if(submitBtn){submitBtn.disabled=false; submitBtn.textContent=originalBtnText;} return; }
            
            // FIX: Check checkboxes for species and compute final species synchronously
            const checkedSpeciesObj = document.querySelector('.single-checkbox-species:checked');
            let finalSpecies = '';
            if (checkedSpeciesObj) {
                finalSpecies = checkedSpeciesObj.value === 'Others' ? document.getElementById('petSpeciesOther')?.value.trim() : checkedSpeciesObj.value;
            }

            if (!finalSpecies) { 
                alert('Please select your pet\'s species (and specify if Others).'); 
                if(submitBtn){submitBtn.disabled=false; submitBtn.textContent=originalBtnText;} 
                return; 
            }
            
            if (!petBreed) { alert('Please enter your pet\'s breed.'); if(submitBtn){submitBtn.disabled=false; submitBtn.textContent=originalBtnText;} return; }
            if (!petAge) { alert('Please enter your pet\'s age.'); if(submitBtn){submitBtn.disabled=false; submitBtn.textContent=originalBtnText;} return; }
            if (!petWeight) { alert('Please enter your pet\'s weight.'); if(submitBtn){submitBtn.disabled=false; submitBtn.textContent=originalBtnText;} return; }
            if (!petSex) { alert('Please select your pet\'s sex.'); if(submitBtn){submitBtn.disabled=false; submitBtn.textContent=originalBtnText;} return; }
            if (!petNeutered) { alert('Please select whether your pet is neutered.'); if(submitBtn){submitBtn.disabled=false; submitBtn.textContent=originalBtnText;} return; }
            if (!petColor) { alert('Please enter your pet\'s color or markings.'); if(submitBtn){submitBtn.disabled=false; submitBtn.textContent=originalBtnText;} return; }

            
            const vaccines = [];
            document.querySelectorAll('input[name="vaccines"]:checked').forEach(cb => vaccines.push(cb.value));

            const ownerName = (document.getElementById('ownerFirstName')?.value || '') + ' ' + (document.getElementById('ownerLastName')?.value || '');
            const ownerContact = document.getElementById('ownerContact')?.value || '';
            const ownerEmail = document.getElementById('ownerEmail')?.value || '';

            // 1. Upload photo if exists
            let photoUrl = '';
            const photoInput = document.getElementById('petPhotoInput');
            if (photoInput && photoInput.files && photoInput.files[0]) {
                const file = photoInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('pet-photos')
                    .upload(fileName, file);
                
                if (uploadError) {
                    console.error('Photo upload error:', uploadError);
                    alert('Failed to upload pet photo: ' + uploadError.message);
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                    return;
                }
                
                const { data: publicUrlData } = supabase.storage
                    .from('pet-photos')
                    .getPublicUrl(fileName);
                    
                photoUrl = publicUrlData.publicUrl;
            } else {
                // fallback to local preview base64 if available, though Supabase is preferred
                photoUrl = document.getElementById('petPhotoPreview')?.src || '';
            }

            // 2. Insert into Supabase 'pets' table
            const ownerHouse = document.getElementById('ownerHouse')?.value || '';
            const ownerStreet = document.getElementById('ownerStreet')?.value || '';
            const ownerPhase = document.getElementById('ownerPhase')?.value || '';
            const ownerAddress = `${ownerHouse} ${ownerStreet}, ${ownerPhase}`.trim();

            const vaccineOtherInput = document.getElementById('vaccineOtherInput');
            const vaccineOtherVal = document.getElementById('vaccineOtherCb')?.checked ? (vaccineOtherInput?.value || '') : '';

            const newPetData = {
                owner_id: userId,
                pet_name: petName,
                species: finalSpecies,
                breed: petBreed,
                age: petAge,
                weight: petWeight,
                sex: petSex,
                color_markings: petColor,
                date_of_birth: document.getElementById('petDOB')?.value || null,
                vaccination_status: vaccinationStatus,
                vaccine_rabies: vaccines.includes('Rabies'),
                vaccine_distemper: vaccines.includes('Distemper'),
                vaccine_parvovirus: vaccines.includes('Parvovirus'),
                vaccine_bordetella: vaccines.includes('Bordetella'),
                vaccine_leptospira: vaccines.includes('Leptospira'),
                vaccine_hepatitis: vaccines.includes('Hepatitis'),
                vaccine_other: document.getElementById('vaccineOtherCb')?.checked || false,
                photo_url: photoUrl,
                neutered: petNeutered === 'Yes' ? true : (petNeutered === 'No' ? false : null),
                owner_name: ownerName,
                owner_contact: ownerContact,
                owner_email: ownerEmail,
                owner_address: ownerAddress
            };

            const { error: insertError } = await supabase
                .from('pets')
                .insert([newPetData]);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }

            if (insertError) {
                console.error('Database insert error:', insertError);
                alert('Failed to save pet registration: ' + insertError.message);
                return;
            }

            if (successMsg) successMsg.textContent = `🐾 ${petName} has been successfully registered! Your pet's profile has been saved to your account.`;
            if (successModal) successModal.classList.add('active');

            registrationForm.reset();
            
            // Reset photo
            if (document.getElementById('petPhotoPreview')) {
                document.getElementById('petPhotoPreview').src = '';
                document.getElementById('petPhotoPreview').style.display = 'none';
            }
            if (document.getElementById('petPhotoIcon')) document.getElementById('petPhotoIcon').style.display = 'block';
            if (document.getElementById('petPhotoLabel')) document.getElementById('petPhotoLabel').style.display = 'block';
            if (document.getElementById('petPhotoHint')) document.getElementById('petPhotoHint').style.display = 'block';
            
            // Re-render UI from Supabase
            if (typeof window.renderPets === 'function') window.renderPets();
        });
    }

    // Close success modal also resets registration if needed
    const closeSuccessModalBtn = document.getElementById('closeSuccessModalBtn');
    if (closeSuccessModalBtn) {
        closeSuccessModalBtn.addEventListener('click', () => {
            document.getElementById('successModal')?.classList.remove('active');
        });
    }

    // Password visibility toggle
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            // Always keep icon visible by explicitly setting both classes
            if (isHidden) {
                togglePassword.classList.remove('fa-eye-slash');
                togglePassword.classList.add('fa-eye');
            } else {
                togglePassword.classList.remove('fa-eye');
                togglePassword.classList.add('fa-eye-slash');
            }
            // Force visibility
            togglePassword.style.color = '#aaa';
            togglePassword.style.visibility = 'visible';
            togglePassword.style.opacity = '1';
        });
    }
    
    // Forgot Password Modal Toggle
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotModalBtn = document.getElementById('closeForgotModalBtn');
    
    if (forgotPasswordLink && forgotPasswordModal) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordModal.classList.add('active');
        });
    }
    if (closeForgotModalBtn && forgotPasswordModal) {
        closeForgotModalBtn.addEventListener('click', () => {
            forgotPasswordModal.classList.remove('active');
        });
    }

    // ==========================================
    // LANGUAGE TRANSLATION (English / Filipino)
    // ==========================================
    const translations = {
        en: {
            // Navbar
            'nav-home': 'HOME',
            'nav-register': 'REGISTER',
            'nav-services': 'SERVICES',
            'nav-community': 'COMMUNITY',
            // Login page
            'login-title': 'WELCOME BACK!',
            'login-subtitle': 'LOG IN TO YOUR ACCOUNT',
            'login-brgy-label': 'LOG IN WITH YOUR BARANGGAY ID',
            'login-password-label': 'PASSWORD',
            'login-btn': 'LOG IN',
            'login-forgot': 'FORGOT PASSWORD',
            'login-signup-btn': 'SIGN UP WITH BRGY I.D',
            'login-admin-btn': 'ARE YOU AN OFFICIAL FROM BARANGGAY?',
            'login-terms': 'I agree to the Terms of Service and Privacy Policy.',
            'login-remember': 'Remember my Account',
            // Signup
            'signup-firstname': 'FIRST NAME',
            'signup-lastname': 'LAST NAME',
            'signup-email': 'EMAIL ADDRESS',
            'signup-brgid': 'BARANGGAY ID',
            'signup-btn': 'SIGN UP',
            'signup-back': 'BACK TO LOGIN',
            // Home
            'home-happening': 'HAPPENING MEOW',
            'home-events': 'PET EVENTS',
            'home-learn': 'Learn more.',
            // Register
            'reg-owner-title': 'OWNER\'S INFORMATION',
            'reg-pet-title': 'PET\'S INFORMATION',
            'reg-print': 'Print/Save PDF',
            'reg-submit': 'Submit Registration',
            // Settings
            'settings-lang': 'Language and Region',
            'settings-dark': 'Dark mode',
            'settings-vac-reminder': 'Vaccination Reminders',
            'settings-vet-alert': 'Vet Appointment Alerts',
            'settings-updates': 'FurSafe Community Updates',
            'settings-email': 'Email Notifications',
            'settings-sms': 'SMS Alerts',
            // Community
            'community-post-placeholder': 'What\'s on meow mind?',
            'community-announce': 'Announcement',
            // Settings form
            'settings-firstname': 'FIRST NAME',
            'settings-lastname': 'LAST NAME',
            'settings-email': 'EMAIL ADDRESS',
            'settings-contact': 'CONTACT NUMBER',
            'settings-address': 'HOME ADDRESS',
            'settings-change-photo': 'Change Photo',
            'settings-cur-pwd': 'CURRENT PASSWORD',
            'settings-new-pwd': 'NEW PASSWORD',
            'settings-conf-pwd': 'CONFIRM NEW PASSWORD',
            'settings-login-alert': 'Login Activity Alerts',
            'settings-cancel': 'Cancel',
            'settings-save': 'Save Changes',
        },
        tl: {
            // Navbar
            'nav-home': 'HOME',
            'nav-register': 'IREHISTRO',
            'nav-services': 'MGA SERBISYO',
            'nav-community': 'KOMUNIDAD',
            // Login page
            'login-title': 'MALIGAYANG PAGBABALIK!',
            'login-subtitle': 'MAG-LOGIN SA IYONG ACCOUNT',
            'login-brgy-label': 'MAG-LOGIN GAMIT ANG IYONG BARANGGAY ID',
            'login-password-label': 'PASSWORD',
            'login-btn': 'MAG-LOGIN',
            'login-forgot': 'NAKALIMUTAN ANG PASSWORD',
            'login-signup-btn': 'MAG-SIGN UP GAMIT ANG BRGY I.D',
            'login-admin-btn': 'OPISYAL BA KAYO NG BARANGGAY?',
            'login-terms': 'Sumasang-ayon ako sa Mga Tuntunin ng Serbisyo at Patakaran sa Privacy.',
            'login-remember': 'Tandaan ang Aking Account',
            // Signup
            'signup-firstname': 'PANGALAN',
            'signup-lastname': 'APELYIDO',
            'signup-email': 'EMAIL ADDRESS',
            'signup-brgid': 'BARANGGAY ID',
            'signup-btn': 'MAG-SIGN UP',
            'signup-back': 'BUMALIK SA PAG-LOGIN',
            // Home
            'home-happening': 'NANGYAYARI NGAYON',
            'home-events': 'MGA KAGANAPAN NG ALAGANG HAYOP',
            'home-learn': 'Matuto pa.',
            // Register
            'reg-owner-title': 'IMPORMASYON NG MAY-ARI',
            'reg-pet-title': 'IMPORMASYON NG ALAGANG HAYOP',
            'reg-print': 'I-print/I-save bilang PDF',
            'reg-submit': 'Isumite ang Rehistrasyon',
            // Settings
            'settings-lang': 'Wika at Rehiyon',
            'settings-dark': 'Madilim na mode',
            'settings-vac-reminder': 'Paalala sa Bakuna',
            'settings-vet-alert': 'Alerto sa Appointment sa Beterinaryo',
            'settings-updates': 'Mga Update ng FurSafe Community',
            'settings-email': 'Mga Abiso sa Email',
            'settings-sms': 'Mga Alerto sa SMS',
            // Community
            'community-post-placeholder': 'Ano ang iniisip mo ngayon?',
            'community-announce': 'Anunsyo',
            // Settings form
            'settings-firstname': 'PANGALAN',
            'settings-lastname': 'APELYIDO',
            'settings-email': 'EMAIL ADDRESS',
            'settings-contact': 'NUMERO SA CONTACT',
            'settings-address': 'ADDRESS NG BAHAY',
            'settings-change-photo': 'Palitan ang Larawan',
            'settings-cur-pwd': 'KASALUKUYANG PASSWORD',
            'settings-new-pwd': 'BAGONG PASSWORD',
            'settings-conf-pwd': 'KUMPIRMAHIN ANG BAGONG PASSWORD',
            'settings-login-alert': 'Alerto sa Aktibidad ng Pag-login',
            'settings-cancel': 'Kanselahin',
            'settings-save': 'I-save ang mga Pagbabago',
        }
    };

    // Map translation keys to DOM elements
    const i18nMap = {
        'nav-home':           () => document.querySelector('[data-route="home"]'),
        'nav-register':       () => document.querySelector('[data-route="register"]'),
        'nav-services':       () => document.querySelector('[data-route="services"]'),
        'nav-community':      () => document.querySelector('[data-route="community"]'),
        'login-title':        () => document.querySelector('.welcome-text'),
        'login-subtitle':     () => document.querySelector('.welcome-subtext'),
        'login-brgy-label':   () => document.querySelector('label[for="brgyId"]'),
        'login-password-label': () => document.querySelector('label[for="password"]'),
        'login-btn':          () => document.getElementById('loginSubmitBtn'),
        'login-forgot':       () => document.getElementById('forgotPasswordLink'),
        'login-signup-btn':   () => document.getElementById('showSignUpBtn'),
        'login-admin-btn':    () => document.getElementById('adminToggleBtn'),
        'settings-dark':      () => document.querySelector('.settings-card [style*="font-weight: bold"]'),
        'community-post-placeholder': () => {
            const inp = document.querySelector('.post-input-container input[type="text"]');
            if (inp) inp.placeholder = translations[currentLang]['community-post-placeholder'];
            return null;
        },
    };

    let currentLang = 'en';

    function applyLanguage(lang) {
        currentLang = lang;
        const t = translations[lang];
        if (!t) return;

        // Nav links (they have icons + text node)
        const navHome = document.querySelector('[data-route="home"].nav-link');
        const navReg  = document.querySelector('[data-route="register"].nav-link');
        const navSvc  = document.querySelector('[data-route="services"].nav-link');
        const navComm = document.querySelector('[data-route="community"].nav-link');

        function setNavText(el, key) {
            if (!el) return;
            // Keep the <i> icon, just replace text node
            const icon = el.querySelector('i');
            el.textContent = ' ' + t[key];
            if (icon) el.insertBefore(icon, el.firstChild);
        }
        setNavText(navHome, 'nav-home');
        setNavText(navReg,  'nav-register');
        setNavText(navSvc,  'nav-services');
        setNavText(navComm, 'nav-community');

        // Simple text replacements
        const simpleMap = {
            '.welcome-text':         'login-title',
            '.welcome-subtext':      'login-subtitle',
            '#loginSubmitBtn':       'login-btn',
            '#forgotPasswordLink':   'login-forgot',
            '#showSignUpBtn':        'login-signup-btn',
            '#adminToggleBtn':       'login-admin-btn',
            '#signUpSubmitBtn':      'signup-btn',
            '#backToLoginBtn':       'signup-back',
            '#printPdfBtn .print-text': 'reg-print',
            '#lblFirstName':         'settings-firstname',
            '#lblLastName':          'settings-lastname',
            '#lblEmail':             'settings-email',
            '#lblContact':           'settings-contact',
            '#lblAddress':           'settings-address',
            '#btnChangePhotoLabel':  'settings-change-photo',
            '#lblCurPwd':            'settings-cur-pwd',
            '#lblNewPwd':            'settings-new-pwd',
            '#lblConfPwd':           'settings-conf-pwd',
            '#lblLoginActivity':     'settings-login-alert',
            '#btnCancelProfile':     'settings-cancel',
            '#saveUserInfoBtn':      'settings-save',
            '#btnCancelPwd':         'settings-cancel',
            '#savePwdBtn':           'settings-save',
        };

        Object.entries(simpleMap).forEach(([sel, key]) => {
            const el = document.querySelector(sel);
            if (el && t[key]) el.textContent = t[key];
        });

        // Labels
        const brgyLabel = document.querySelector('label[for="brgyId"]');
        if (brgyLabel) brgyLabel.textContent = t['login-brgy-label'];
        const passLabel = document.querySelector('label[for="password"]');
        if (passLabel) passLabel.textContent = t['login-password-label'];

        // Community post placeholder
        const postInput = document.querySelector('.post-input-container input[type="text"]');
        if (postInput) postInput.placeholder = t['community-post-placeholder'];

        // Happening Meow title
        const happeningTitle = document.querySelector('.happening-meow h2');
        if (happeningTitle) happeningTitle.textContent = t['home-happening'];

        // Announcements title in community
        document.querySelectorAll('.announcements h3').forEach(el => {
            const icon = el.querySelector('i');
            el.textContent = ' ' + t['community-announce'];
            if (icon) el.insertBefore(icon, el.firstChild);
        });

        // Settings toggles
        const toggleLabels = document.querySelectorAll('.toggle-info strong');
        const settingsKeys = ['settings-vac-reminder','settings-vet-alert','settings-updates','settings-email','settings-sms'];
        toggleLabels.forEach((el, i) => {
            if (settingsKeys[i] && t[settingsKeys[i]]) el.textContent = t[settingsKeys[i]];
        });

        // Dark mode label
        const darkLabel = document.querySelector('.settings-card > div[style*="font-weight"]');
        if (darkLabel) darkLabel.textContent = t['settings-dark'];

        // Language settings header
        const langSettingsHeader = document.querySelector('.settings-header');
        if (langSettingsHeader) langSettingsHeader.textContent = t['settings-lang'];
    }

    // Language select handler
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            applyLanguage(e.target.value);
        });
    }

    // ==========================================
    // RENDER PETS LOGIC
    // ==========================================
    let currentUserPets = [];

    window.renderPets = async function() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
            currentUserPets = [];
            updatePetsUI();
            return;
        }

        const { data: pets, error } = await supabase
            .from('pets')
            .select('*')
            .eq('owner_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pets:', error);
            return;
        }

        currentUserPets = pets || [];
        updatePetsUI();
    };

    window.currentHomePetIndex = 0;

    window.updatePetsUI = function updatePetsUI() {
        let pets = currentUserPets;
        const homePetCard = document.getElementById('homePetCard');
        const homeNoPets = document.getElementById('homeNoPets');
        const prevBtn = document.getElementById('homePrevPetBtn');
        const nextBtn = document.getElementById('homeNextPetBtn');

        if (pets.length === 0) {
            if (homePetCard) homePetCard.style.display = 'none';
            if (homeNoPets) homeNoPets.style.display = 'block';
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        } else {
            if (homePetCard) homePetCard.style.display = 'block';
            if (homeNoPets) homeNoPets.style.display = 'none';
            
            if (pets.length > 1) {
                if (prevBtn) prevBtn.style.display = 'block';
                if (nextBtn) nextBtn.style.display = 'block';
            } else {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
            }

            // Ensure index is within bounds
            if (window.currentHomePetIndex >= pets.length) window.currentHomePetIndex = 0;
            if (window.currentHomePetIndex < 0) window.currentHomePetIndex = pets.length - 1;

            const p = pets[window.currentHomePetIndex];
            if(document.getElementById('homePetName')) document.getElementById('homePetName').textContent = p.pet_name || 'N/A';
            if(document.getElementById('homePetId')) document.getElementById('homePetId').textContent = '2024-' + (p.id ? p.id.slice(0,5) : 'XXXXX');
            if(document.getElementById('homePetBreed')) document.getElementById('homePetBreed').textContent = p.breed || 'N/A';
            if(document.getElementById('homePetBirthday')) document.getElementById('homePetBirthday').textContent = p.age ? p.age == 1 ? p.age + ' year old' : p.age + ' years old' : 'N/A';
            if(document.getElementById('homeOwnerName')) document.getElementById('homeOwnerName').textContent = p.owner_name || 'N/A';
            if(document.getElementById('homeOwnerPhone')) document.getElementById('homeOwnerPhone').textContent = p.owner_contact || 'N/A';
            if(document.getElementById('homeOwnerEmail')) document.getElementById('homeOwnerEmail').textContent = p.owner_email || 'N/A';
            if(document.getElementById('homePetKg')) document.getElementById('homePetKg').textContent = p.weight ? p.weight + ' kg' : 'N/A';
            if(document.getElementById('homePetGender')) document.getElementById('homePetGender').textContent = p.sex || 'N/A';
            
            const homeNeuteredYes = document.getElementById('homeNeuteredYes');
            const homeNeuteredNo = document.getElementById('homeNeuteredNo');
            if (homeNeuteredYes && homeNeuteredNo) {
                homeNeuteredYes.classList.toggle('active', p.neutered === 'Yes');
                homeNeuteredNo.classList.toggle('active', p.neutered !== 'Yes');
            }
            const homeVacYes = document.getElementById('homeVacYes');
            const homeVacNo = document.getElementById('homeVacNo');
            if (homeVacYes && homeVacNo) {
                const isVaccinated = p.vaccine_rabies || p.vaccine_distemper || p.vaccine_parvovirus || p.vaccine_bordetella || p.vaccine_leptospira || p.vaccine_hepatitis;
                homeVacYes.classList.toggle('active', isVaccinated);
                homeVacNo.classList.toggle('active', !isVaccinated);
            }

            const imgContainer = document.getElementById('homePetImageContainer');
            if (imgContainer) {
                if (p.photo_url) {
                    imgContainer.innerHTML = `<img src="${p.photo_url}" style="width:100%; height:100%; object-fit:cover; border-radius: var(--border-radius-lg);">`;
                } else {
                    imgContainer.innerHTML = `<span>[Pet Photo]</span>`;
                }
            }
        }

        const petProfileSelector = document.getElementById('petProfileSelector');
        if (petProfileSelector) {
            petProfileSelector.innerHTML = '';
            if (pets.length === 0) {
                petProfileSelector.innerHTML = '<option value="">No Pets Registered</option>';
            } else {
                pets.forEach((p, index) => {
                    petProfileSelector.innerHTML += `<option value="${index}">Pet ${index + 1}: ${p.pet_name}</option>`;
                });
            }
            petProfileSelector.dispatchEvent(new Event('change'));
        }
    }

    const profileSelector = document.getElementById('petProfileSelector');
    if (profileSelector) {
        profileSelector.addEventListener('change', (e) => {
            let pets = currentUserPets;
            const index = parseInt(e.target.value);
            if (isNaN(index) || !pets[index]) {
                if(document.getElementById('displayPetName')) document.getElementById('displayPetName').textContent = 'No Pet';
                return;
            }
            const p = pets[index];
            if(document.getElementById('displayPetName')) document.getElementById('displayPetName').textContent = p.pet_name || 'N/A';
            if(document.getElementById('profilePetBreedLabel')) document.getElementById('profilePetBreedLabel').textContent = p.breed || 'N/A';
            if(document.getElementById('profileVacBadge')) {
                const isVaccinated = p.vaccine_rabies || p.vaccine_distemper || p.vaccine_parvovirus || p.vaccine_bordetella || p.vaccine_leptospira || p.vaccine_hepatitis;
                document.getElementById('profileVacBadge').textContent = isVaccinated ? 'Vaccinated' : 'Not Vaccinated';
            }

            if(document.getElementById('profilePetName')) document.getElementById('profilePetName').value = p.pet_name || '';
            if(document.getElementById('profilePetBreed')) document.getElementById('profilePetBreed').value = p.breed || '';
            if(document.getElementById('profilePetAge')) document.getElementById('profilePetAge').value = p.age || '';
            if(document.getElementById('profilePetSex')) document.getElementById('profilePetSex').value = p.sex || '';
            if(document.getElementById('profilePetColor')) document.getElementById('profilePetColor').value = p.color_markings || '';
            if(document.getElementById('profilePetSpecies')) document.getElementById('profilePetSpecies').value = p.species || '';
            if(document.getElementById('profileOwnerName')) document.getElementById('profileOwnerName').value = p.owner_name || '';
            if(document.getElementById('profileOwnerContact')) document.getElementById('profileOwnerContact').value = p.owner_contact || '';
            if(document.getElementById('profileOwnerAddress')) document.getElementById('profileOwnerAddress').value = p.owner_address || '';
            
            if(document.getElementById('profilePawsportHeader')) {
                document.getElementById('profilePawsportHeader').innerHTML = `${p.pet_name} &bull; ID: 2024-${p.id ? p.id.slice(0,5) : 'XXXXX'}`;
            }

            const vaccineMap = {
                'Rabies': p.vaccine_rabies,
                'Distemper': p.vaccine_distemper,
                'Parvovirus': p.vaccine_parvovirus,
                'Bordetella': p.vaccine_bordetella,
                'Leptospira': p.vaccine_leptospira,
                'Hepatitis': p.vaccine_hepatitis
            };
            Object.entries(vaccineMap).forEach(([name, hasVac]) => {
                const badge = document.getElementById('vacBadge' + name);
                if (badge) {
                    if (hasVac) {
                        badge.className = 'vac-badge vac-complete';
                        badge.textContent = 'Complete';
                    } else {
                        badge.className = 'vac-badge vac-not-yet';
                        badge.textContent = 'Not yet';
                    }
                }
            });

            // Handle vaccine_other in the pawsport
            const vacOtherRow = document.getElementById('vacOtherRow');
            const vacOtherName = document.getElementById('vacOtherName');
            const vacBadgeOther = document.getElementById('vacBadgeOther');
            if (p.vaccine_other && p.vaccine_other.trim() !== '') {
                if (vacOtherRow) vacOtherRow.style.display = 'flex';
                if (vacOtherName) vacOtherName.textContent = p.vaccine_other;
                if (vacBadgeOther) {
                    vacBadgeOther.className = 'vac-badge vac-complete';
                    vacBadgeOther.textContent = 'Complete';
                }
            } else {
                if (vacOtherRow) vacOtherRow.style.display = 'none';
            }

            const imgBox = document.getElementById('profilePetPhotoImg');
            const placeholder = document.getElementById('profilePetPhotoPlaceholder');
            if (imgBox && placeholder) {
                if (p.photo_url) {
                    imgBox.src = p.photo_url;
                    imgBox.style.display = 'block';
                    placeholder.style.display = 'none';
                } else {
                    imgBox.style.display = 'none';
                    placeholder.style.display = 'flex';
                }
            }
        });
    }

    window.renderPets();

    // ==========================================
    // COMMUNITY FORUM - SUPABASE INTEGRATION
    // ==========================================

    const postContentInput = document.getElementById('postContentInput');
    const postSubmitBtn = document.getElementById('postSubmitBtn');
    const postImageBtn = document.getElementById('postImageBtn');
    const postImageFile = document.getElementById('postImageFile');
    const postImagePreviewContainer = document.getElementById('postImagePreviewContainer');
    const postImagePreview = document.getElementById('postImagePreview');
    const postImageRemoveBtn = document.getElementById('postImageRemoveBtn');
    const communityPostsFeed = document.getElementById('communityPostsFeed');

    // --- Post Image Attachment ---
    if (postImageBtn && postImageFile) {
        postImageBtn.addEventListener('click', () => postImageFile.click());
        postImageFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && postImagePreview && postImagePreviewContainer) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    postImagePreview.src = ev.target.result;
                    postImagePreviewContainer.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    if (postImageRemoveBtn) {
        postImageRemoveBtn.addEventListener('click', () => {
            postImageFile.value = '';
            postImagePreview.src = '';
            postImagePreviewContainer.style.display = 'none';
        });
    }

    // --- Create Post ---
    if (postSubmitBtn) {
        postSubmitBtn.addEventListener('click', async () => {
            const content = postContentInput ? postContentInput.value.trim() : '';
            if (!content) { alert('Please write something before posting.'); return; }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { alert('You must be logged in to post.'); return; }

            postSubmitBtn.disabled = true;
            postSubmitBtn.textContent = 'Posting...';

            // Get selected categories (max 2)
            const checkedCats = document.querySelectorAll('input[name="postCat"]:checked');
            const category1 = checkedCats[0] ? checkedCats[0].value : null;
            const category2 = checkedCats[1] ? checkedCats[1].value : null;

            // Upload image if attached
            let imageUrl = null;
            const imgFile = postImageFile ? postImageFile.files[0] : null;
            if (imgFile) {
                const fileExt = imgFile.name.split('.').pop();
                const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;
                const { error: upErr } = await supabase.storage
                    .from('post-images')
                    .upload(filePath, imgFile);
                if (!upErr) {
                    const { data: urlData } = supabase.storage
                        .from('post-images')
                        .getPublicUrl(filePath);
                    imageUrl = urlData.publicUrl;
                } else {
                    console.error('Post image upload error:', upErr);
                }
            }

            const { error: insertErr } = await supabase
                .from('posts')
                .insert([{
                    author_id: session.user.id,
                    content: content,
                    image_url: imageUrl,
                    category1: category1,
                    category2: category2,
                    likes_count: 0,
                    comments_count: 0,
                    reported: false
                }]);

            postSubmitBtn.disabled = false;
            postSubmitBtn.textContent = 'Post';

            if (insertErr) {
                console.error('Post insert error:', insertErr);
                alert('Failed to create post: ' + insertErr.message);
                return;
            }

            // Reset form
            postContentInput.value = '';
            if (postImageFile) postImageFile.value = '';
            if (postImagePreview) postImagePreview.src = '';
            if (postImagePreviewContainer) postImagePreviewContainer.style.display = 'none';
            document.querySelectorAll('input[name="postCat"]:checked').forEach(c => c.checked = false);

            // Reload feed
            loadCommunityPosts();
        });
    }

    // --- Load & Render Posts ---
    async function loadCommunityPosts(filterCategories = []) {
        if (!communityPostsFeed) return;
        communityPostsFeed.innerHTML = '<p style="text-align:center; color:var(--text-light); padding:20px;">Loading posts...</p>';

        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session ? session.user.id : null;

        let query = supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: posts, error } = await query;

        if (error) {
            console.error('Error loading posts:', error);
            communityPostsFeed.innerHTML = '<p style="text-align:center; color:#e74c3c; padding:20px;">Error loading posts.</p>';
            return;
        }

        if (!posts || posts.length === 0) {
            communityPostsFeed.innerHTML = '<p style="text-align:center; color:var(--text-light); padding:20px;">No posts yet. Be the first to share!</p>';
            return;
        }

        // Apply client-side category filter
        let filtered = posts;
        if (filterCategories.length > 0) {
            filtered = posts.filter(p =>
                filterCategories.includes(p.category1) || filterCategories.includes(p.category2)
            );
        }

        // Get current user's likes
        let userLikedPostIds = [];
        if (currentUserId) {
            const { data: likes } = await supabase
                .from('likes')
                .select('post_id')
                .eq('user_id', currentUserId);
            if (likes) userLikedPostIds = likes.map(l => l.post_id);
        }

        // Fetch author profiles
        const authorIds = [...new Set(filtered.map(p => p.author_id))];
        let profilesMap = {};
        if (authorIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, avatar_url')
                .in('id', authorIds);
            if (profiles) {
                profiles.forEach(pr => { profilesMap[pr.id] = pr; });
            }
        }

        communityPostsFeed.innerHTML = '';

        filtered.forEach(post => {
            const profile = profilesMap[post.author_id] || {};
            const authorName = profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : 'Anonymous';
            const avatarHtml = profile.avatar_url
                ? `<img src="${profile.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : `<i class="fa-solid fa-user" style="color:#aaa;font-size:1.2rem;"></i>`;
            const isLiked = userLikedPostIds.includes(post.id);
            const isOwner = currentUserId === post.author_id;
            const catBadges = [post.category1, post.category2]
                .filter(Boolean)
                .map(c => `<span style="background:var(--primary);color:#fff;padding:2px 8px;border-radius:12px;font-size:0.7rem;margin-right:4px;">${c}</span>`)
                .join('');

            const timeAgo = getTimeAgo(post.created_at);

            const card = document.createElement('div');
            card.className = 'post-card';
            card.setAttribute('data-post-id', post.id);
            card.innerHTML = `
                <div class="post-header">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <div class="post-avatar">${avatarHtml}</div>
                        <div>
                            <div class="post-author">${authorName}</div>
                            <div style="font-size:0.75rem;color:var(--text-light);">${timeAgo} ${catBadges}</div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center;">
                        ${isOwner ? `<i class="fa-solid fa-trash" style="color:#e74c3c;cursor:pointer;font-size:0.9rem;" title="Delete post" data-delete-post="${post.id}"></i>` : ''}
                        <i class="fa-solid fa-flag" style="color:var(--text-light);cursor:pointer;font-size:0.9rem;" title="Report post" data-report-post="${post.id}"></i>
                    </div>
                </div>
                <div class="post-content" style="padding:10px 0;">${post.content}</div>
                ${post.image_url ? `<div style="margin-bottom:10px;"><img src="${post.image_url}" style="width:100%;max-height:400px;object-fit:cover;border-radius:8px;"></div>` : ''}
                <div class="post-actions">
                    <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-like-post="${post.id}" style="${isLiked ? 'color:var(--primary);font-weight:600;' : ''}">
                        <i class="fa-solid fa-thumbs-up"></i> <span class="like-count">${post.likes_count || 0}</span>
                    </button>
                    <button class="action-btn comment-toggle-btn" data-comment-toggle="${post.id}">
                        <i class="fa-solid fa-comment"></i> <span class="comment-count">${post.comments_count || 0}</span>
                    </button>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display:none; border-top:1px solid #eee; padding-top:10px; margin-top:10px;">
                    <div class="comments-list" id="comments-list-${post.id}"></div>
                    ${currentUserId ? `
                    <div style="display:flex;gap:8px;margin-top:8px;">
                        <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Write a comment..." style="flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:20px;outline:none;font-size:0.85rem;">
                        <button class="btn btn-primary" data-submit-comment="${post.id}" style="padding:8px 16px;font-size:0.85rem;border-radius:20px;">Send</button>
                    </div>` : ''}
                </div>
            `;
            communityPostsFeed.appendChild(card);
        });

        // Attach event listeners
        attachPostEventListeners();
    }

    // --- Time Ago Helper ---
    function getTimeAgo(dateStr) {
        const now = new Date();
        const then = new Date(dateStr);
        const diffMs = now - then;
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return mins + 'm ago';
        const hours = Math.floor(mins / 60);
        if (hours < 24) return hours + 'h ago';
        const days = Math.floor(hours / 24);
        if (days < 7) return days + 'd ago';
        return then.toLocaleDateString();
    }

    // --- Attach Post Event Listeners ---
    function attachPostEventListeners() {
        // Like buttons
        document.querySelectorAll('[data-like-post]').forEach(btn => {
            btn.addEventListener('click', async function() {
                const postId = this.getAttribute('data-like-post');
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { alert('Please log in to like posts.'); return; }

                const isLiked = this.classList.contains('liked');
                const likeCountEl = this.querySelector('.like-count');

                if (isLiked) {
                    // Unlike - update UI immediately
                    this.classList.remove('liked');
                    this.style.color = '';
                    this.style.fontWeight = '';
                    if (likeCountEl) likeCountEl.textContent = Math.max(0, parseInt(likeCountEl.textContent || '0') - 1);
                    await supabase.from('likes').delete()
                        .eq('post_id', postId)
                        .eq('user_id', session.user.id);
                    // Count actual likes from the likes table
                    const { count: actualLikes } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
                    await supabase.from('posts').update({ likes_count: actualLikes || 0 }).eq('id', postId);
                    if (likeCountEl) likeCountEl.textContent = actualLikes || 0;
                } else {
                    // Like - update UI immediately
                    this.classList.add('liked');
                    this.style.color = 'var(--primary)';
                    this.style.fontWeight = '600';
                    if (likeCountEl) likeCountEl.textContent = parseInt(likeCountEl.textContent || '0') + 1;
                    await supabase.from('likes').insert([{ post_id: postId, user_id: session.user.id }]);
                    // Count actual likes from the likes table
                    const { count: actualLikes } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
                    await supabase.from('posts').update({ likes_count: actualLikes || 0 }).eq('id', postId);
                    if (likeCountEl) likeCountEl.textContent = actualLikes || 0;
                }
            });
        });

        // Comment toggle buttons
        document.querySelectorAll('[data-comment-toggle]').forEach(btn => {
            btn.addEventListener('click', async function() {
                const postId = this.getAttribute('data-comment-toggle');
                const section = document.getElementById('comments-' + postId);
                if (section) {
                    const isHidden = section.style.display === 'none';
                    section.style.display = isHidden ? 'block' : 'none';
                    if (isHidden) loadComments(postId);
                }
            });
        });

        // Submit comment buttons
        document.querySelectorAll('[data-submit-comment]').forEach(btn => {
            btn.addEventListener('click', async function() {
                const postId = this.getAttribute('data-submit-comment');
                const input = document.getElementById('comment-input-' + postId);
                const content = input ? input.value.trim() : '';
                if (!content) return;

                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { alert('Please log in to comment.'); return; }

                await supabase.from('comments').insert([{
                    post_id: postId,
                    author_id: session.user.id,
                    content: content
                }]);

                if (input) input.value = '';
                loadComments(postId);
                // Count actual comments from the comments table
                const { count: actualComments } = await supabase.from('comments').select('*', { count: 'exact', head: true }).eq('post_id', postId);
                await supabase.from('posts').update({ comments_count: actualComments || 0 }).eq('id', postId);
                // Update the count display on the toggle button
                const commentToggleBtn = document.querySelector(`[data-comment-toggle="${postId}"]`);
                if (commentToggleBtn) {
                    const countEl = commentToggleBtn.querySelector('.comment-count');
                    if (countEl) countEl.textContent = actualComments || 0;
                }
            });
        });

        // Delete post buttons
        document.querySelectorAll('[data-delete-post]').forEach(btn => {
            btn.addEventListener('click', async function() {
                if (!confirm('Are you sure you want to delete this post?')) return;
                const postId = this.getAttribute('data-delete-post');

                // Delete associated likes and comments first
                await supabase.from('likes').delete().eq('post_id', postId);
                await supabase.from('comments').delete().eq('post_id', postId);
                await supabase.from('posts').delete().eq('id', postId);

                loadCommunityPosts(getActiveFilters());
            });
        });

        // Report post buttons
        document.querySelectorAll('[data-report-post]').forEach(btn => {
            btn.addEventListener('click', async function() {
                const postId = this.getAttribute('data-report-post');
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { alert('Please log in to report posts.'); return; }

                const { error } = await supabase.from('reports').insert([{
                    post_id: postId,
                    reporter_id: session.user.id,
                    reason: 'Reported by user'
                }]);

                if (!error) {
                    await supabase.from('posts').update({ reported: true }).eq('id', postId);
                    alert('Post has been reported. Thank you.');
                } else {
                    console.error('Report error:', error);
                    alert('Failed to report post.');
                }
            });
        });
    }

    // --- Load Comments for a Post ---
    async function loadComments(postId) {
        const list = document.getElementById('comments-list-' + postId);
        if (!list) return;
        list.innerHTML = '<p style="font-size:0.8rem;color:var(--text-light);">Loading comments...</p>';

        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session ? session.user.id : null;

        const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error || !comments) {
            list.innerHTML = '<p style="font-size:0.8rem;color:#e74c3c;">Error loading comments.</p>';
            return;
        }

        if (comments.length === 0) {
            list.innerHTML = '<p style="font-size:0.8rem;color:var(--text-light);">No comments yet.</p>';
            return;
        }

        // Fetch commenter profiles
        const commenterIds = [...new Set(comments.map(c => c.author_id))];
        let commenterMap = {};
        if (commenterIds.length > 0) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', commenterIds);
            if (profiles) profiles.forEach(p => { commenterMap[p.id] = p; });
        }

        list.innerHTML = '';
        comments.forEach(c => {
            const cp = commenterMap[c.author_id] || {};
            const cName = cp.first_name ? `${cp.first_name} ${cp.last_name || ''}`.trim() : 'Anonymous';
            const isOwn = currentUserId === c.author_id;
            const div = document.createElement('div');
            div.style.cssText = 'display:flex;justify-content:space-between;align-items:flex-start;padding:6px 0;border-bottom:1px solid #f0f0f0;';
            div.innerHTML = `
                <div style="flex:1;">
                    <strong style="font-size:0.8rem;">${cName}</strong>
                    <span style="font-size:0.7rem;color:var(--text-light);margin-left:6px;">${getTimeAgo(c.created_at)}</span>
                    <p style="font-size:0.85rem;margin:2px 0 0;">${c.content}</p>
                </div>
                ${isOwn ? `<i class="fa-solid fa-trash" style="color:#e74c3c;cursor:pointer;font-size:0.75rem;margin-left:8px;" data-delete-comment="${c.id}" data-comment-post="${postId}"></i>` : ''}
            `;
            list.appendChild(div);
        });

        // Attach delete comment listeners
        list.querySelectorAll('[data-delete-comment]').forEach(btn => {
            btn.addEventListener('click', async function() {
                const commentId = this.getAttribute('data-delete-comment');
                const cPostId = this.getAttribute('data-comment-post');
                await supabase.from('comments').delete().eq('id', commentId);

                // Update comment count
                const { data: postData } = await supabase.from('posts').select('comments_count').eq('id', cPostId).single();
                const dbComments = postData ? (postData.comments_count || 0) : 0;
                await supabase.from('posts').update({ comments_count: Math.max(0, dbComments - 1) }).eq('id', cPostId);

                loadComments(cPostId);
            });
        });
    }

    // --- Category Filter ---
    function getActiveFilters() {
        const checked = document.querySelectorAll('input[name="filterCat"]:checked');
        return Array.from(checked).map(c => c.value);
    }

    document.querySelectorAll('input[name="filterCat"]').forEach(cb => {
        cb.addEventListener('change', () => {
            loadCommunityPosts(getActiveFilters());
        });
    });

    // --- Search Forum ---
    const forumSearchInput = document.querySelector('.search-container input');
    if (forumSearchInput) {
        let searchTimeout;
        forumSearchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const query = forumSearchInput.value.trim().toLowerCase();
                if (!query) { loadCommunityPosts(getActiveFilters()); return; }

                const allCards = communityPostsFeed.querySelectorAll('.post-card');
                allCards.forEach(card => {
                    const content = card.querySelector('.post-content')?.textContent.toLowerCase() || '';
                    const author = card.querySelector('.post-author')?.textContent.toLowerCase() || '';
                    card.style.display = (content.includes(query) || author.includes(query)) ? '' : 'none';
                });
            }, 300);
        });
    }

    // --- Load posts when community view is shown ---
    const originalNavigateTo = navigateTo;
    navigateTo = function(route) {
        originalNavigateTo(route);
        if (route === 'community') {
            loadCommunityPosts(getActiveFilters());
        }
    };

    // --- Category checkbox limit (max 2) for post creation ---
    document.querySelectorAll('input[name="postCat"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const checked = document.querySelectorAll('input[name="postCat"]:checked');
            if (checked.length > 2) {
                cb.checked = false;
                alert('You can select up to 2 categories only.');
            }
        });
    });

});


// --- Home Page Carousel Arrow Listeners ---
document.getElementById('homePrevPetBtn')?.addEventListener('click', () => { window.currentHomePetIndex--; if(typeof window.updatePetsUI === 'function') window.updatePetsUI(); });
document.getElementById('homeNextPetBtn')?.addEventListener('click', () => { window.currentHomePetIndex++; if(typeof window.updatePetsUI === 'function') window.updatePetsUI(); });

// --- Save User Profile Information (with change detection) ---
// Store initial values for change detection
let _profileInitial = {};
function captureProfileSnapshot() {
    _profileInitial = {
        firstName: document.getElementById('userFirstName')?.value || '',
        lastName: document.getElementById('userLastName')?.value || '',
        hasNewPhoto: false,
        photoRemoved: false
    };
}
// Capture when settings view is shown
document.querySelector('[data-route="settings"]')?.addEventListener('click', () => setTimeout(captureProfileSnapshot, 200));

document.getElementById('saveUserInfoBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('saveUserInfoBtn');
    const fName = document.getElementById('userFirstName')?.value || '';
    const lName = document.getElementById('userLastName')?.value || '';
    const photoInput = document.getElementById('avatarFileInput');
    const hasNewPhoto = photoInput && photoInput.files && photoInput.files[0];
    const avatarPreview = document.getElementById('avatarPreview');
    const photoRemoved = window._avatarPhotoRemoved === true;

    // Check if anything changed
    const changed = fName !== _profileInitial.firstName ||
                    lName !== _profileInitial.lastName ||
                    hasNewPhoto || photoRemoved;

    if (!changed) {
        alert('No changes had been made.');
        return;
    }

    btn.textContent = 'Saving...';
    btn.disabled = true;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        let photoUrl = undefined;
        if (hasNewPhoto) {
            const file = photoInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar-${Date.now()}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('pet-photos').upload(fileName, file);
            if (!uploadError && uploadData) {
                photoUrl = supabase.storage.from('pet-photos').getPublicUrl(fileName).data.publicUrl;
            }
        }
        
        const updateData = { first_name: fName, last_name: lName };
        if (photoUrl) updateData.avatar_url = photoUrl;
        if (photoRemoved && !hasNewPhoto) updateData.avatar_url = '';
        
        const { error } = await supabase.from('profiles').update(updateData).eq('id', session.user.id);
        if(error) {
            console.error(error);
            alert('Error saving profile.');
        } else {
            alert('Your changes have been saved.');
            window._avatarPhotoRemoved = false;
            captureProfileSnapshot();
        }
    } finally {
        btn.textContent = 'Save Changes';
        btn.disabled = false;
    }
});

// --- Remove Avatar Photo button ---
document.getElementById('btnRemoveAvatarPhoto')?.addEventListener('click', () => {
    const avatarPreview = document.getElementById('avatarPreview');
    const avatarCameraIcon = document.getElementById('avatarCameraIcon');
    const avatarFileInput = document.getElementById('avatarFileInput');
    if (avatarPreview) { avatarPreview.src = ''; avatarPreview.style.display = 'none'; }
    if (avatarCameraIcon) avatarCameraIcon.style.display = 'block';
    if (avatarFileInput) avatarFileInput.value = '';
    window._avatarPhotoRemoved = true;
});

// --- Global Supabase Client for out-of-scope functions ---
const GLOBAL_SUPABASE_URL = 'https://hfpibrfnbdohfjgengim.supabase.co';
const GLOBAL_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcGlicmZuYmRvaGZqZ2VuZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTQzNzksImV4cCI6MjA5NzE3MDM3OX0.CiaPTLaVK1HbTUafQdkW-mBV9GTqAOGohGzb-u-56nk';
const globalSupabase = window.supabase.createClient(GLOBAL_SUPABASE_URL, GLOBAL_SUPABASE_ANON);

// --- Load Community Stats dynamically ---
async function loadCommunityStats() {
    // Count total registered pets
    const { count: totalPets } = await globalSupabase.from('pets').select('*', { count: 'exact', head: true });
    const petStatEl = document.getElementById('statRegisteredPets');
    if (petStatEl) petStatEl.textContent = totalPets || 0;

    // Count posts this week
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekPosts } = await globalSupabase.from('posts').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString());
    const postsStatEl = document.getElementById('statPostsThisWeek');
    if (postsStatEl) postsStatEl.textContent = weekPosts || 0;
}
// Load stats on page load
document.addEventListener('DOMContentLoaded', loadCommunityStats);
// Also reload stats when navigating to community view
document.querySelector('[data-route="community"]')?.addEventListener('click', () => setTimeout(loadCommunityStats, 300));

async function loadUserAnnouncements() {
    const commFeed = document.getElementById('communityAnnouncementsFeed');
    const homeFeed = document.getElementById('homeAnnouncementsFeed');
    if (!commFeed && !homeFeed) {
        console.warn('[FurSafe] Announcement feeds not found in DOM.');
        return;
    }

    const loadingHtml = '<p style="font-size:0.9rem;color:var(--text-light);">Loading announcements...</p>';
    if (commFeed) commFeed.innerHTML = loadingHtml;
    if (homeFeed) homeFeed.innerHTML = loadingHtml;

    try {
        console.log('[FurSafe] Fetching announcements from Supabase...');
        const { data: anns, error } = await globalSupabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('[FurSafe] Announcement RLS/fetch error:', error);
            const errMsg = '<p style="font-size:0.9rem;color:#e74c3c;">Failed to load announcements. Please check database permissions.</p>';
            if (commFeed) commFeed.innerHTML = errMsg;
            if (homeFeed) homeFeed.innerHTML = errMsg;
            return;
        }
        
        console.log('[FurSafe] Successfully fetched announcements:', anns);

        if (!anns || anns.length === 0) {
            const noAnns = '<p style="font-size: 0.9rem; color: var(--text-light);">No announcements yet.</p>';
            if (commFeed) commFeed.innerHTML = noAnns;
            if (homeFeed) homeFeed.innerHTML = noAnns;
            return;
        }

        let commHtml = '';
        let homeHtml = '';
        const borderColors = ['var(--primary)', '#4CAF50', '#e67e22', '#9b59b6'];

        anns.forEach((ann, index) => {
            const borderColor = borderColors[index % borderColors.length];
            
            let actualContent = ann.content || '';
            let author = 'Admin';
            const authorMatch = actualContent.match(/^\[AUTHOR:(.*?)\](.*)/s);
            if (authorMatch) {
                author = authorMatch[1];
                actualContent = authorMatch[2];
            }
            
            let dateStr = 'Unknown date';
            try {
                if (ann.created_at) {
                    const dateObj = new Date(ann.created_at);
                    dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + 
                              dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                }
            } catch(e) { console.error('Date parse error', e); }
                            
            const safeTitle = (ann.title || 'Untitled').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const safeContent = actualContent.substring(0, 120).replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            window.__annModalData = window.__annModalData || [];
            window.__annModalData[index] = { title: ann.title || 'Untitled', content: actualContent, date: dateStr, author: author };

            const htmlItem = `
                <div class="announcement-item" style="border-left-color: ${borderColor}; background: #f9f9f9; padding: 10px; border-radius: 8px; border-left-width: 4px; border-left-style: solid; margin-bottom: 8px; cursor:pointer;" onclick="openAnnouncementModal(${index})">
                    <div class="ann-title" style="font-weight: bold; margin-bottom: 3px; font-size: 0.95rem;">${safeTitle}</div>
                    <div class="ann-content" style="font-size: 0.85rem; color: #555; margin-bottom: 5px;">${safeContent}${actualContent.length > 120 ? '...' : ''}</div>
                    <div class="ann-date" style="font-size: 0.75rem; color: #888;">${dateStr} • By ${author.replace(/</g, "&lt;")}</div>
                </div>
            `;
            commHtml += htmlItem;
            homeHtml += htmlItem;
        });

        if (commFeed) commFeed.innerHTML = commHtml;
        if (homeFeed) homeFeed.innerHTML = homeHtml;
        console.log('[FurSafe] Announcements successfully rendered to DOM.');
    } catch(e) {
        console.error('[FurSafe] Error loading user announcements:', e);
        const errMsg = '<p style="font-size: 0.9rem; color: #e74c3c;">Critical error rendering announcements.</p>';
        if (commFeed) commFeed.innerHTML = errMsg;
        if (homeFeed) homeFeed.innerHTML = errMsg;
    }
}

function openAnnouncementModal(index) {
    const data = window.__annModalData?.[index];
    if (!data) return;
    document.getElementById('annModalTitle').textContent = data.title;
    document.getElementById('annModalContent').textContent = data.content;
    document.getElementById('annModalDate').textContent = `${data.date} • By ${data.author}`;
    document.getElementById('announcementModal').classList.add('active');
}

document.getElementById('closeAnnouncementModal')?.addEventListener('click', () => {
    document.getElementById('announcementModal').classList.remove('active');
});

document.getElementById('announcementModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'announcementModal') {
        document.getElementById('announcementModal').classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', loadUserAnnouncements);
document.querySelector('[data-route="community"]')?.addEventListener('click', () => setTimeout(loadUserAnnouncements, 300));
document.querySelector('[data-route="home"]')?.addEventListener('click', () => setTimeout(loadUserAnnouncements, 300));


// --- New Validations & Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Remove Photo Button Logic
    const removePetPhotoBtn = document.getElementById('removePetPhotoBtn');
    const petPhotoInput = document.getElementById('petPhotoInput');
    const petPhotoPreview = document.getElementById('petPhotoPreview');
    const petPhotoIcon = document.getElementById('petPhotoIcon');
    const petPhotoLabel = document.getElementById('petPhotoLabel');
    const petPhotoHint = document.getElementById('petPhotoHint');
    
    if (petPhotoInput) {
        petPhotoInput.addEventListener('change', () => {
            if (petPhotoInput.files && petPhotoInput.files.length > 0) {
                if (removePetPhotoBtn) removePetPhotoBtn.style.display = 'block';
            }
        });
    }
    
    if (removePetPhotoBtn) {
        removePetPhotoBtn.addEventListener('click', () => {
            if (petPhotoInput) petPhotoInput.value = '';
            if (petPhotoPreview) {
                petPhotoPreview.src = '';
                petPhotoPreview.style.display = 'none';
            }
            if (petPhotoIcon) petPhotoIcon.style.display = 'block';
            if (petPhotoLabel) petPhotoLabel.style.display = 'block';
            if (petPhotoHint) petPhotoHint.style.display = 'block';
            removePetPhotoBtn.style.display = 'none';
        });
    }

    // 2. Age Auto Calculation based on June 19, 2026
        const petDOB = document.getElementById('petDOB');
        const petAge = document.getElementById('petAge');
        petDOB.max = new Date().toISOString().split('T')[0]; // ← ADD THIS LINE
        if (petDOB && petAge) {
        petDOB.addEventListener('change', () => {
            if (!petDOB.value) {
                petAge.value = '';
                return;
            }
            const dob = new Date(petDOB.value);
            const refDate = new Date('2026-06-19');
            let age = refDate.getFullYear() - dob.getFullYear();
            const m = refDate.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && refDate.getDate() < dob.getDate())) {
                age--;
            }
            if (age < 0) age = 0; // if born after ref date
            petAge.value = age;
        });
    }

    // 3. Species Checkbox Logic
    const speciesCbs = document.querySelectorAll('.single-checkbox-species');
    const petSpeciesOther = document.getElementById('petSpeciesOther');
    const petSpeciesHidden = document.getElementById('petSpecies');

    speciesCbs.forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.checked) {
                speciesCbs.forEach(other => {
                    if (other !== e.target) other.checked = false;
                });
                if (e.target.value === 'Others') {
                    if (petSpeciesOther) petSpeciesOther.style.display = 'block';
                    if (petSpeciesHidden) petSpeciesHidden.value = petSpeciesOther.value;
                } else {
                    if (petSpeciesOther) petSpeciesOther.style.display = 'none';
                    if (petSpeciesHidden) petSpeciesHidden.value = e.target.value;
                }
            } else {
                if (petSpeciesOther) petSpeciesOther.style.display = 'none';
                if (petSpeciesHidden) petSpeciesHidden.value = '';
            }
        });
    });

    if (petSpeciesOther) {
        petSpeciesOther.addEventListener('input', () => {
            if (petSpeciesHidden) petSpeciesHidden.value = petSpeciesOther.value;
        });
    }

    // 4. Vaccine Other Logic
    const vaccineOtherCb = document.getElementById('vaccineOtherCb');
    const vaccineOtherInput = document.getElementById('vaccineOtherInput');
    if (vaccineOtherCb && vaccineOtherInput) {
        vaccineOtherCb.addEventListener('change', () => {
            vaccineOtherInput.style.display = vaccineOtherCb.checked ? 'block' : 'none';
        });
    }

    // 5. Settings Nearby Clinics Toggle
    const toggleNearbyClinics = document.getElementById('toggleNearbyClinics');
    const clinicSearch = document.getElementById('clinicSearch');
    const hiddenClinics = document.getElementById('hiddenClinics');
    const clinicListContainer = document.getElementById('clinicListContainer');

    if (clinicSearch) {
        clinicSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const allClinics = document.querySelectorAll('.clinic-card');
            
            allClinics.forEach(card => {
                const name = card.querySelector('.clinic-name')?.textContent.toLowerCase() || card.getAttribute('data-name') || '';
                if (query === '' && card.classList.contains('search-item')) {
                    card.style.display = 'none'; // hide search items when empty
                } else if (query === '' && !card.classList.contains('search-item')) {
                    card.style.display = 'flex'; // show original items when empty
                } else if (name.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
            if (query !== '' && hiddenClinics) hiddenClinics.style.display = 'block';
            if (query === '' && hiddenClinics) hiddenClinics.style.display = 'none';
        });
    }

    if (toggleNearbyClinics && clinicListContainer) {
        let clinicListVisible = true;
        toggleNearbyClinics.addEventListener('click', () => {
            clinicListVisible = !clinicListVisible;
            clinicListContainer.style.display = clinicListVisible ? 'block' : 'none';
            if (clinicSearch) clinicSearch.style.display = clinicListVisible ? 'block' : 'none';
            toggleNearbyClinics.style.color = clinicListVisible ? 'var(--primary)' : 'var(--text-light)';
        });
    }
});

// ==========================================
// GLOBAL TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, isError = false) {
    const toast = document.getElementById('globalToast');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.style.background = isError ? '#e74c3c' : '#2ecc71';
    if (toastIcon) toastIcon.className = isError ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check';

    toast.style.display = 'flex';
    // Force reflow then animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    // Auto hide after 3.5 seconds
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.display = 'none'; }, 400);
    }, 3500);
}

// ==========================================
// PASSWORD EYE TOGGLE BUTTONS (Settings)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    function setupPwdToggle(iconId, inputId) {
        const icon = document.getElementById(iconId);
        const input = document.getElementById(inputId);
        if (!icon || !input) return;
        icon.addEventListener('click', () => {
            const hidden = input.type === 'password';
            input.type = hidden ? 'text' : 'password';
            icon.classList.toggle('fa-eye-slash', !hidden);
            icon.classList.toggle('fa-eye', hidden);
        });
    }
    setupPwdToggle('toggleCurPwd', 'currentPasswordInput');
    setupPwdToggle('toggleNewPwd', 'newPasswordInput');
    setupPwdToggle('toggleConfPwd', 'confirmPasswordInput');
});

// ==========================================
// FUNCTIONAL PASSWORD CHANGE (Settings)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://hfpibrfnbdohfjgengim.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcGlicmZuYmRvaGZqZ2VuZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTQzNzksImV4cCI6MjA5NzE3MDM3OX0.CiaPTLaVK1HbTUafQdkW-mBV9GTqAOGohGzb-u-56nk';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const savePwdBtn = document.getElementById('savePwdBtn');
    if (savePwdBtn) {
        savePwdBtn.addEventListener('click', async () => {
            const currentPwd = document.getElementById('currentPasswordInput')?.value;
            const newPwd = document.getElementById('newPasswordInput')?.value;
            const confirmPwd = document.getElementById('confirmPasswordInput')?.value;

            if (!currentPwd || !newPwd || !confirmPwd) {
                showToast('Please fill in all password fields.', true);
                return;
            }
            if (newPwd.length < 6) {
                showToast('New password must be at least 6 characters.', true);
                return;
            }
            if (newPwd !== confirmPwd) {
                showToast('New passwords do not match.', true);
                return;
            }

            savePwdBtn.disabled = true;
            savePwdBtn.textContent = 'Saving...';

            try {
                // First verify current password by re-signing in
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) { showToast('You must be logged in.', true); return; }

                const { error: signInErr } = await supabase.auth.signInWithPassword({
                    email: session.user.email,
                    password: currentPwd
                });

                if (signInErr) {
                    showToast('Current password is incorrect.', true);
                    return;
                }

                // Now update password
                const { error: updateErr } = await supabase.auth.updateUser({ password: newPwd });

                if (updateErr) {
                    showToast('Failed to update password: ' + updateErr.message, true);
                } else {
                    showToast('Password changed successfully! ✓');
                    document.getElementById('currentPasswordInput').value = '';
                    document.getElementById('newPasswordInput').value = '';
                    document.getElementById('confirmPasswordInput').value = '';
                }
            } catch(e) {
                showToast('Unexpected error: ' + e.message, true);
            } finally {
                savePwdBtn.disabled = false;
                savePwdBtn.textContent = 'Save Changes';
            }
        });
    }

    // Cancel password resets fields
    const btnCancelPwd = document.getElementById('btnCancelPwd');
    if (btnCancelPwd) {
        btnCancelPwd.addEventListener('click', () => {
            ['currentPasswordInput','newPasswordInput','confirmPasswordInput'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
        });
    }
});

// ==========================================
// FONT SIZE SLIDER (Language & Region Settings)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('fontSizeSlider');
    const label = document.getElementById('fontSizeLabel');
    const savedSize = localStorage.getItem('fursafe_font_size');
    if (savedSize) {
        document.documentElement.style.fontSize = savedSize + '%';
        if (slider) slider.value = savedSize;
        if (label) label.textContent = savedSize + '%';
    }

    if (slider) {
        slider.addEventListener('input', () => {
            const val = slider.value;
            document.documentElement.style.fontSize = val + '%';
            if (label) label.textContent = val + '%';
        });
    }

    // Save Language Settings button
    const saveLangBtn = document.getElementById('saveLangBtn');
    if (saveLangBtn) {
        saveLangBtn.addEventListener('click', () => {
            const val = slider ? slider.value : '100';
            localStorage.setItem('fursafe_font_size', val);
            // Also persist dark mode preference
            const darkMode = document.getElementById('darkModeToggle')?.checked;
            localStorage.setItem('fursafe_dark_mode', darkMode ? '1' : '0');
            showToast('Display settings saved!');
        });
    }

    // Restore dark mode on load
    const darkPref = localStorage.getItem('fursafe_dark_mode');
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkPref === '1' && darkToggle) {
        darkToggle.checked = true;
        document.body.classList.add('dark-mode');
    }
});

// ==========================================
// MAINTENANCE MODE CHECK on startup
// ==========================================
(async function checkMaintenanceMode() {
    const SUPABASE_URL = 'https://hfpibrfnbdohfjgengim.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcGlicmZuYmRvaGZqZ2VuZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTQzNzksImV4cCI6MjA5NzE3MDM3OX0.CiaPTLaVK1HbTUafQdkW-mBV9GTqAOGohGzb-u-56nk';
    try {
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: settings } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', ['app_maintenance_mode', 'registration_open']);

        if (!settings) return;

        const settingMap = {};
        settings.forEach(s => { settingMap[s.key] = s.value; });

        // Maintenance mode
        if (settingMap['app_maintenance_mode'] === 'true') {
            const overlay = document.getElementById('maintenanceOverlay');
            if (overlay) {
                overlay.style.display = 'flex';
            }
        }

        // Registration toggle — disable signup button if closed
        if (settingMap['registration_open'] === 'false') {
            const signUpBtn = document.getElementById('showSignUpBtn');
            if (signUpBtn) {
                signUpBtn.disabled = true;
                signUpBtn.title = 'New registrations are currently closed.';
                signUpBtn.style.opacity = '0.5';
                signUpBtn.style.cursor = 'not-allowed';
                signUpBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    alert('New registrations are currently closed. Please try again later.');
                };
            }
            const signUpSubmitBtn = document.getElementById('signUpSubmitBtn');
            if (signUpSubmitBtn) {
                signUpSubmitBtn.addEventListener('click', (e) => {
                    e.stopImmediatePropagation();
                    alert('New registrations are currently closed. Please try again later.');
                }, true);
            }
        }
    } catch(e) {
        console.warn('[FurSafe] Could not check system settings:', e);
    }
})();

// ==========================================
// FIX saveUserInfoBtn to show toast on success
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://hfpibrfnbdohfjgengim.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcGlicmZuYmRvaGZqZ2VuZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTQzNzksImV4cCI6MjA5NzE3MDM3OX0.CiaPTLaVK1HbTUafQdkW-mBV9GTqAOGohGzb-u-56nk';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Replace the existing saveUserInfoBtn logic with one that uses toast
    const saveUserInfoBtn = document.getElementById('saveUserInfoBtn');
    if (saveUserInfoBtn) {
        // Remove all existing click listeners by cloning
        const newBtn = saveUserInfoBtn.cloneNode(true);
        saveUserInfoBtn.parentNode.replaceChild(newBtn, saveUserInfoBtn);

        newBtn.addEventListener('click', async () => {
            const fName = document.getElementById('userFirstName')?.value.trim() || '';
            const lName = document.getElementById('userLastName')?.value.trim() || '';
            const photoInput = document.getElementById('avatarFileInput');
            const hasNewPhoto = photoInput && photoInput.files && photoInput.files[0];
            const photoRemoved = window._avatarPhotoRemoved === true;

            const changed = fName !== (window._profileInitial?.firstName || '') ||
                            lName !== (window._profileInitial?.lastName || '') ||
                            hasNewPhoto || photoRemoved;

            if (!changed) {
                showToast('No changes were made.', false);
                return;
            }

            newBtn.textContent = 'Saving...';
            newBtn.disabled = true;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                let photoUrl = undefined;
                if (hasNewPhoto) {
                    const file = photoInput.files[0];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `avatar-${Date.now()}.${fileExt}`;
                    const { data: uploadData, error: uploadError } = await supabase.storage.from('pet-photos').upload(fileName, file);
                    if (!uploadError && uploadData) {
                        photoUrl = supabase.storage.from('pet-photos').getPublicUrl(fileName).data.publicUrl;
                    }
                }

                const updateData = { first_name: fName, last_name: lName };
                if (photoUrl) updateData.avatar_url = photoUrl;
                if (photoRemoved && !hasNewPhoto) updateData.avatar_url = '';

                const { error } = await supabase.from('profiles').update(updateData).eq('id', session.user.id);
                if (error) {
                    showToast('Error saving profile. Please try again.', true);
                } else {
                    showToast('Profile saved successfully! ✓');
                    window._avatarPhotoRemoved = false;
                    if (typeof captureProfileSnapshot === 'function') captureProfileSnapshot();
                }
            } finally {
                newBtn.textContent = 'Save Changes';
                newBtn.disabled = false;
            }
        });
    }
});
