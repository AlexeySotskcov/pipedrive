const axios = require('axios');

async function getUser(accessToken) {
	const requestOptions = {
		url: 'https://api.pipedrive.com/v1/users/me',
		headers: {
			'Authorization': `Bearer ${accessToken}`
		},
		timeout: 10000
	};

	const userInfo = await axios(requestOptions);

	return userInfo.data;
}

async function getDeals(accessToken) {
	const requestOptions = {
		url: 'https://api.pipedrive.com/v1/deals?status=open',
		headers: {
			'Authorization': `Bearer ${accessToken}`
		},
		timeout: 10000
	};
	const deals = await axios(requestOptions);

	return deals.data;
}

async function getDealById(accessToken, dealId) {
    const requestOptions = {
        url: "https://api.pipedrive.com/v1/deals/"+dealId,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
    };
    const deals = await axios(requestOptions);

    return deals.data;
}

async function getUsers(accessToken) {
    const requestOptions = {
        url: "https://api.pipedrive.com/v1/users?limit=10",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
    };
    const users = await axios(requestOptions);

    return users.data;
}

async function updateDeal(id, outcome, accessToken) {
	// outcome : {}
	const requestOptions = {
		url: `https://api.pipedrive.com/v1/deals/${id}`,
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${accessToken}`
		},
		data: outcome,
		timeout: 10000
	};

	await axios(requestOptions);
}

async function updatePerson(id, outcome, accessToken) {
    const requestOptions = {
        url: `https://api.pipedrive.com/v1/persons/${id}`,
        method: "PUT",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        data: outcome,
        timeout: 10000,
    };

    await axios(requestOptions);
}

async function getDealFields(accessToken) {
	const requestOptions = {
        url: "https://api.pipedrive.com/v1/dealFields?start=0&limit=500",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
    };
    const fields = await axios(requestOptions);

    return fields.data;
}

module.exports = {
    getUser,
    getDeals,
    getDealById,
    updateDeal,
    getDealFields,
	updatePerson,
	getUsers
};