const url = 'https://hfpibrfnbdohfjgengim.supabase.co/rest/v1/pets';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmcGlicmZuYmRvaGZqZ2VuZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1OTQzNzksImV4cCI6MjA5NzE3MDM3OX0.CiaPTLaVK1HbTUafQdkW-mBV9GTqAOGohGzb-u-56nk';

async function testInsert() {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            owner_id: "00000000-0000-0000-0000-000000000000",
            pet_name: "Test",
            species: "test",
            breed: "test",
            age: "test",
            weight: "test",
            sex: "test",
            color_markings: "test",
            date_of_birth: null,
            vaccination_status: "test",
            vaccine_rabies: false,
            vaccine_distemper: false,
            vaccine_parvovirus: false,
            vaccine_bordetella: false,
            vaccine_leptospira: false,
            vaccine_hepatitis: false,
            vaccine_other: "test",
            photo_url: "test",
            neutered: false,
            owner_name: "test",
            owner_contact: "test",
            owner_email: "test",
            owner_address: "test"
        })
    });
    const data = await res.json();
    console.log(data);
}

testInsert();
