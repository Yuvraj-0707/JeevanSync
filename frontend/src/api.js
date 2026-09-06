const BASE_URL = 'http://localhost:5000/api';

export const getPublicGrid = async () => {
  try {
    const res = await fetch(`${BASE_URL}/inventory/public-grid`);
    if (!res.ok) throw new Error('Network response failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline, using fallback mock data');
    return null;
  }
};

export const registerDonor = async (donorData) => {
  const res = await fetch(`${BASE_URL}/donors/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donorData)
  });
  return await res.json();
};

export const updateHospitalStock = async (hospitalId, inventory) => {
  const token = localStorage.getItem('hospital_token');
  const res = await fetch(`${BASE_URL}/inventory/update/${hospitalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ inventory })
  });
  return await res.json();
};