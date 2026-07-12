/*==========================================
            LOCATION SYSTEM
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const provinceSelect = document.querySelector("#province-select");
    const provinceHidden = document.querySelector("#province");

    const cityInput = document.querySelector("#city-input");
    const cityHidden = document.querySelector("#city");
    const citySuggestions = document.querySelector("#city-suggestions");

    const districtInput = document.querySelector("#district-input");
    const districtHidden = document.querySelector("#district");
    const districtSuggestions = document.querySelector("#district-suggestions");

    let allCities = [];
    let allDistricts = [];

    /*==========================================
        HELPER: RENDER A SUGGESTION LIST
    ==========================================*/
    function renderSuggestions(listEl, items, onPick) {
        listEl.innerHTML = "";

        if (items.length === 0) {
            listEl.classList.remove("show");
            return;
        }

        items.slice(0, 10).forEach(item => {
            const li = document.createElement("li");
            li.textContent = item.label;
            li.addEventListener("click", () => onPick(item));
            listEl.appendChild(li);
        });

        listEl.classList.add("show");
    }

    function hideSuggestions(listEl) {
        listEl.classList.remove("show");
    }

    /*==========================================
        LOAD PROVINCE LIST (dropdown, once)
    ==========================================*/
    async function loadProvinceList() {
        try {
            const response = await fetch("data-indonesia-master/provinsi.json");

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const provinces = await response.json();

            provinces
                .slice()
                .sort((a, b) => a.nama.localeCompare(b.nama, "id"))
                .forEach(province => {
                    const option = document.createElement("option");
                    option.value = province.id;
                    option.textContent = province.nama;
                    provinceSelect.appendChild(option);
                });

        } catch (error) {
            console.error("Gagal memuat data provinsi:", error);

            provinceSelect.options[0].textContent = "Gagal memuat provinsi";
        }
    }

    /*==========================================
        LOAD CITIES (KOTA/KABUPATEN) FOR A
        SELECTED PROVINCE
    ==========================================*/
    async function loadCitiesForProvince(provinceId, provinceName) {
        allCities = [];
        cityInput.value = "";
        cityHidden.value = "";
        cityInput.disabled = true;
        cityInput.placeholder = "Memuat data kota...";
        hideSuggestions(citySuggestions);

        // province changed -> district list is no longer valid either
        resetDistrict();

        if (!provinceId) {
            cityInput.placeholder = "Pilih provinsi terlebih dahulu";
            return;
        }

        try {
            const response = await fetch(`data-indonesia-master/kota/${provinceId}.json`);
            const cities = await response.json();

            allCities = cities.map(city => ({
                id: city.id,
                name: city.nama,
                province: provinceName,
                label: city.nama
            }));

            allCities.sort((a, b) => a.name.localeCompare(b.name, "id"));

            cityInput.disabled = false;
            cityInput.placeholder = "Ketik nama kota / kabupaten";

        } catch (error) {
            console.error(`Gagal memuat kota Provinsi ${provinceName}:`, error);
            cityInput.placeholder = "Gagal memuat data kota";
        }
    }

    /*==========================================
        LOAD DISTRICTS (KECAMATAN) FOR A CITY
    ==========================================*/
    function resetDistrict() {
        allDistricts = [];
        districtInput.value = "";
        districtHidden.value = "";
        districtInput.disabled = true;
        districtInput.placeholder = "Pilih kota / kabupaten terlebih dahulu";
        hideSuggestions(districtSuggestions);
    }

    async function loadDistricts(cityId) {
        resetDistrict();

        if (!cityId) return;

        try {
            const response = await fetch(`data-indonesia-master/kecamatan/${cityId}.json`);
            const districts = await response.json();

            allDistricts = districts.map(district => ({
                id: district.id,
                name: district.nama,
                label: district.nama
            }));

            districtInput.disabled = false;
            districtInput.placeholder = "Ketik nama kecamatan";

        } catch (error) {
            console.error("Gagal memuat kecamatan:", error);
        }
    }

    /*==========================================
        PROVINCE SELECT
    ==========================================*/
    provinceSelect.addEventListener("change", () => {
        const provinceId = provinceSelect.value;
        const provinceName = provinceId
            ? provinceSelect.options[provinceSelect.selectedIndex].textContent
            : "";

        // the hidden #province field is what actually gets submitted -
        // it stores the province NAME (matches provinsi.json's "nama"
        // and is what the backend/maps.py needs), not the numeric id.
        provinceHidden.value = provinceName;

        loadCitiesForProvince(provinceId, provinceName);
    });

    /*==========================================
        CITY AUTOCOMPLETE
    ==========================================*/
    function pickCity(picked) {
        cityInput.value = picked.label;
        cityHidden.value = picked.id;
        hideSuggestions(citySuggestions);
        loadDistricts(picked.id);
    }

    function filterCities(query) {
        if (!query) return allCities;
        return allCities.filter(city =>
            city.name.toLowerCase().includes(query)
        );
    }

    cityInput.addEventListener("focus", () => {
        const query = cityInput.value.trim().toLowerCase();
        renderSuggestions(citySuggestions, filterCities(query), pickCity);
    });

    cityInput.addEventListener("input", () => {
        const query = cityInput.value.trim().toLowerCase();

        // typing again means the previous exact pick is no longer valid
        cityHidden.value = "";

        renderSuggestions(citySuggestions, filterCities(query), pickCity);
    });

    cityInput.addEventListener("blur", () => {
        // slight delay so a click on a suggestion registers before the list hides
        setTimeout(() => hideSuggestions(citySuggestions), 150);
    });

    /*==========================================
        DISTRICT AUTOCOMPLETE
    ==========================================*/
    function pickDistrict(picked) {
        districtInput.value = picked.label;
        districtHidden.value = picked.id;
        hideSuggestions(districtSuggestions);
    }

    function filterDistricts(query) {
        if (!query) return allDistricts;
        return allDistricts.filter(district =>
            district.name.toLowerCase().includes(query)
        );
    }

    districtInput.addEventListener("focus", () => {
        const query = districtInput.value.trim().toLowerCase();
        renderSuggestions(districtSuggestions, filterDistricts(query), pickDistrict);
    });

    districtInput.addEventListener("input", () => {
        const query = districtInput.value.trim().toLowerCase();

        districtHidden.value = "";

        renderSuggestions(districtSuggestions, filterDistricts(query), pickDistrict);
    });

    districtInput.addEventListener("blur", () => {
        setTimeout(() => hideSuggestions(districtSuggestions), 150);
    });

    /*==========================================
        INIT
    ==========================================*/
    loadProvinceList();

});