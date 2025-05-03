const axios = require('axios');

async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'ContactMapApp/1.0'
            }
        });

        if (response.data.length === 0) return null;

        const { lat, lon } = response.data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
    } catch (err) {
        console.error("Geocoding error:", err);
        return null;
    }
}

module.exports = geocodeAddress;
