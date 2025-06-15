const App = {
    db: null,
    propertiesData: [],
    
    firebaseConfig: {
        apiKey: "AIzaSyPASN89uqTfDICCswwdmcTRs1fyWp4w",
        authDomain: "mermaid-homes-phuket.firebaseapp.com",
        projectId: "mermaid-homes-phuket",
        storageBucket: "mermaid-homes-phuket.appspot.com",
        messagingSenderId: "911498027425",
        appId: "1:911498027425:web:772ee87f18dc68750f4528"
    },

    initHeader() {
        const headerEl = document.getElementById('header');
        if (!headerEl) return;
        headerEl.innerHTML = `<div class="container py-6 flex justify-between items-center"><a href="index.html" class="logo-text">MERMAID HOMES</a><nav class="flex items-center space-x-8 text-sm font-light tracking-wider"><a href="listings.html?type=buy" class="nav-link">Buy</a><a href="listings.html?type=rent" class="nav-link">Rent</a></nav></div>`;
        window.addEventListener('scroll', () => {
            headerEl.classList.toggle('scrolled', window.scrollY > 50);
        });
    },

    async initListingsPage() {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig);
        }
        this.db = firebase.firestore();

        // Inject HTML
        this.initHeader();
        const footerEl = document.getElementById('footer');
        footerEl.innerHTML = `<div class="container"><div class="grid grid-cols-1 md:grid-cols-4 gap-8"><div class="md:col-span-2"><h4 class="logo-text">MERMAID HOMES</h4><p class="text-sm text-gray-400 max-w-md">Your trusted real estate partner.</p></div><div><h4>Quick Links</h4><ul class="space-y-3 text-sm"><li class="text-gray-400 hover:text-white"><a href="listings.html?type=buy">Buy</a></li><li class="text-gray-400 hover:text-white"><a href="listings.html?type=rent">Rent</a></li></ul></div><div><h4>Follow Us</h4><div class="flex space-x-5 text-2xl"><a href="https://www.facebook.com/profile.php?id=61551898026585" target="_blank" class="text-gray-400 hover:text-white"><i class="fab fa-facebook"></i></a><a href="https://www.instagram.com/merm.homes?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" class="text-gray-400 hover:text-white"><i class="fab fa-instagram"></i></a><a href="https://wa.me/66654765114" target="_blank" class="text-gray-400 hover:text-white"><i class="fab fa-whatsapp"></i></a></div></div></div></div>`;
        
        const modalEl = document.getElementById('add-listing-modal');
        modalEl.innerHTML = `<div class="modal-content"><div class="flex justify-between items-center mb-6"><h3 class="text-2xl font-bold">Add New Property</h3><button class="close-modal-btn text-gray-500 text-3xl">&times;</button></div><form id="property-form" class="space-y-4"><div><label>Title</label><input type="text" name="title" required class="w-full p-2 border rounded"></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label>Listing Type</label><select name="type" required class="w-full p-2 border rounded"><option value="rent">For Rent</option><option value="buy">For Sale</option></select></div><div><label>Category</label><select name="category" required class="w-full p-2 border rounded"><option value="Villa">Villa</option><option value="Apartment">Apartment</option><option value="Townhouse">Townhouse</option></select></div></div><div><label>Location</label><input type="text" name="location" required class="w-full p-2 border rounded"></div><div class="grid grid-cols-3 gap-4"><div><label>Beds</label><input type="number" name="bedrooms" required class="w-full p-2 border rounded" min="0"></div><div><label>Baths</label><input type="number" name="bathrooms" required class="w-full p-2 border rounded" min="0"></div><div><label>Area (m²)</label><input type="number" name="area" required class="w-full p-2 border rounded" min="0"></div></div><div><label>Price (THB)</label><input type="number" name="priceTHB" required class="w-full p-2 border rounded" min="1"></div><div><label>Image URL</label><input type="url" name="images" required class="w-full p-2 border rounded" placeholder="https://..."></div><button type="submit" class="w-full bg-[var(--primary-color)] text-white p-3 rounded-lg !mt-6 flex items-center justify-center">Add Property</button></form></div>`;

        // Bind Events
        document.getElementById('add-listing-btn')?.addEventListener('click', () => this.showModal());
        document.querySelector('.close-modal-btn')?.addEventListener('click', () => this.hideModal());
        document.getElementById('property-form')?.addEventListener('submit', e => this.handlePropertySubmit(e));

        // Load and Render Properties
        const urlParams = new URLSearchParams(window.location.search);
        this.currentListingType = urlParams.get('type') || 'rent';
        document.getElementById('listing-title').textContent = `Properties for ${this.currentListingType === 'buy' ? 'Sale' : 'Rent'}`;

        await this.loadProperties();
        this.renderListings();
    },

    async loadProperties() {
        const snapshot = await this.db.collection('properties').orderBy('createdAt', 'desc').get();
        this.propertiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    renderListings() {
        const grid = document.getElementById('property-grid');
        if (!grid) return;
        let data = this.propertiesData.filter(p => p.type === this.currentListingType);
        grid.innerHTML = data.length ? data.map(p => this.renderPropertyCard(p)).join('') : `<p class="col-span-full text-center py-10">No properties currently available.</p>`;
        
        document.getElementById('property-grid')?.addEventListener('click', async e => {
            if (e.target.closest('.delete-property-btn')) {
                e.stopPropagation();
                if (confirm('Are you sure?')) await this.deleteProperty(e.target.closest('.delete-property-btn').dataset.id);
            }
        });
    },

    renderPropertyCard(property) {
        const price = `฿${new Intl.NumberFormat('en-US').format(property.priceTHB)}`;
        return `<div class="property-card relative"><button class="delete-property-btn" data-id="${property.id}"><i class="fas fa-trash-alt"></i></button><div class="relative h-56 bg-gray-200"><img src="${property.images[0]}" class="w-full h-full object-cover"></div><div class="p-4"><h4 class="font-semibold truncate text-gray-800">${property.title}</h4><p class="text-sm text-gray-500 my-1"><i class="fas fa-map-marker-alt mr-2"></i>${property.location}</p><div class="mt-4 font-semibold text-lg text-gray-900">${price}</div></div></div>`;
    },

    async handlePropertySubmit(e) {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = 'Submitting...';

        const newProperty = Object.fromEntries(new FormData(form).entries());
        newProperty.images = [newProperty.images];
        ['bedrooms', 'bathrooms', 'area', 'priceTHB'].forEach(k => newProperty[k] = parseInt(newProperty[k]));
        newProperty.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        
        try {
            await this.db.collection('properties').add(newProperty);
            alert('Property added successfully!');
            form.reset(); this.hideModal();
            await this.loadProperties();
            this.renderListings();
        } catch (error) {
            alert("Error: Could not add property.");
        } finally {
            btn.disabled = false; btn.innerHTML = 'Add Property';
        }
    },

    async deleteProperty(id) {
        try {
            await this.db.collection('properties').doc(id).delete();
            alert('Property deleted.');
            await this.loadProperties();
            this.renderListings();
        } catch (error) { console.error("Error deleting:", error); }
    },
    
    showModal() { document.getElementById('add-listing-modal')?.classList.add('active'); },
    hideModal() { document.getElementById('add-listing-modal')?.classList.remove('active'); },
};